<?php
    $config = include_once('config.php'); 
    include_once('Conect_bd.php');
    include_once('checkbox.php'); 
    include_once('modelAjaxCheckbox.php'); 
    
    $conect_db = new Conect_bd($config);
    $checkbox = new Checkbox($config);
    $modelAjaxCheckbox = new ModelAjaxCheckbox();

    $pdo = $conect_db->getDb();

    $json = [];
    switch ($_GET['action']) {
        case 'refreshStatusCashRegister': 
            echo rroInfo($config);
        break;
        case 'close_shift':
            $checkbox->disconnect();
            $response =  $checkbox->getShifts();
            echo getResponse($response);
        break;
        case 'create_shift':
            $response = $checkbox->connect();
            $response =  $checkbox->getShifts();
            echo getResponse($response);
        break;
        case 'rroOrderInfo':
            echo rroInfo($config);
        break;
        case 'orderCreateReceiptPayment': 
            $response =  $checkbox->getShifts();
            
            $data =  json_decode(getResponse($response),1);
            
            if($data['status'] == 'OPENED'){
                $order_id = $_GET['order_id']; 
                $client_id = $_GET['client_id'];  
                $file = file_get_contents("https://berivse.net/e.php?ix=order&order_id=$order_id&kv=0&client_id=$client_id");
                $data = [];
                $response = json_decode( $file, true); 
                if($response['status'] == 'success'){
                    foreach ($response['goods'] as $key => $good) {
                        $data['goods'][$key]['good']['code'] = $good['sku'];
                        $data['goods'][$key]['good']['name'] = $good['name'];
                        $data['goods'][$key]['good']['price'] = $good['price_discount'] * 100;
                        $data['goods'][$key]['quantity'] = $good['quantity'] * 1000;

                        

                        if($_GET['is_return']){
                            $data['goods'][$key]['is_return'] = true;
                        }else{
                            $data['goods'][$key]['is_return'] = false;
                        }
                    } 
                    
                    $data['payments'][0]['type'] = $_GET['payments'];
                    $data['payments'][0]['value'] = $response['total_sum_discount'] * 100; 

                    if( $_GET['email'] == "true" && isset($response['email'])){
                        $data['delivery']['email'] = $response['email'];
                        //$data['delivery']['email'] = 'program@berivse.net';
                    } 

                    $json =  $checkbox->create_receipt($data);
                    
                   
                     //echo $json['status'];
                   //  print_r($json);
                    //exit; 

                    if($json['status'] == "DONE" || $json['status'] == "CREATED"){
                        if($_GET['is_return']){
                            $query = "UPDATE `order_rro` SET `checkbox_return_receipt_id` = :checkbox_return_receipt_id WHERE `order_id` = :order_id ";
                            $params = [
                                ':order_id'     =>  $order_id,
                                ':checkbox_return_receipt_id' => $json['id'],  
                            ];
    
                        }else{
                            $query = "INSERT INTO `order_rro`(`order_id`, `checkbox_receipt_id`, `date_create`) VALUES (:order_id, :checkbox_receipt_id, :date_create)";
                
                            $params = [
                                ':order_id'     =>  $order_id,
                                ':checkbox_receipt_id' => $json['id'],
                                ':date_create' => date("Y-m-d H:i:s")
                            ];
                            
                            
                        }
                        $stmt = $pdo->prepare($query);
                        $stmt->execute($params);
                        $json['message'] =  'Чек відправлено';
     
                    }else{
                        $json['order'] = $response;
                        $json['data_order'] = $data;
                    } 
                }else{
                    $json['status'] = 'CLOSED';
                    $json['message'] =  'Замовлення відсутнє';
                }
            }else{
                $json['status'] = 'CLOSED';
                $json['message'] =  'Зміну не відкрито';

                
            } 
            echo json_encode( $json, JSON_UNESCAPED_UNICODE);
        break;
        case 'getReceiptHtml':
            echo $checkbox->getReceiptHtml($_GET['checkbox_receipt_id']);
        break;
        case 'getReceiptPdf':
            header("Content-type:application/pdf");
            header('Content-Disposition: inline; filename="'.$_GET['checkbox_receipt_id'].'"');
            echo $checkbox->getReceiptPdf($_GET['checkbox_receipt_id']);
        break;
        case 'confirmReceipt':
            $order_id = $_GET['order_id']; 
            $client_id = $_GET['client_id']; 
            $file = file_get_contents("https://berivse.net/e.php?ix=order&order_id=$order_id&kv=0&client_id=$client_id");
            $response = json_decode( $file, true); 
            if($response['status'] == 'success'){
                foreach ( $response['goods'] as $key => $good) {
                    $str .= <<<EOT
                    <tr>
                    <td>$good[name]</td>
                    <td>$good[sku]</td>
                    <td>$good[quantity]</td>
                    <td>$good[price_discount]</td>
                    <td>$good[sum_discount]</td>
                </tr>
EOT;
                }
                $str .= "<tr><td colspan='4'>Загальна сума</td><td><b>$response[total_sum_discount]</b></td></tr>";
            }else{
                $str = '<tr>Нема замовлення<tr>';
            }
            
            echo  $str;
        break;
        case 'zReport': 
            echo '<pre>';
            echo $checkbox->getReportText($_GET['z_report_id']);
        break;
        case 'infoOrderRro':
            $data = [];
            $order_id = $_GET['order_id']; 
            $stmt = $pdo->prepare("SELECT * FROM order_rro WHERE `order_id` = ?");
            $stmt->execute([$order_id]);
            $response = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if( $response['checkbox_receipt_id']){
                $response['status'] = 'success';
            }else{
                $response['status'] = 'failed';
            }
            echo json_encode( $response,1);
        break;
        case 'shifts': 
            echo '<pre>';
           // print_r( $checkbox->getZReports());
            $response = $checkbox->getShifts(); 
            
        break;
    }  

    function getResponse($response, $json = []){
        if($response['message'] == "Not authenticated"){
            $json['status'] = "CLOSED";
            $json['message'] = "Невірний логін аба пароль";
        }else{
            $date = date_create($response['results'][0]->opened_at);
            $json['status'] = $response['results'][0]->status;
            $json['date_at'] = date_format($date, 'd.m.Y H:i:s');
            $json['z_report_id'] = $response['results'][0]->z_report->id;

        }
        
        return  json_encode( $json,1);
    }

    function rroInfo($config){
        $conect_db = new Conect_bd($config);
        $checkbox = new Checkbox($config);
        
        $pdo = $conect_db->getDb();

        $json = [];
        $order_id = $_GET['order_id']; 
        $response = $checkbox->getShifts();
        $response_profile =  $checkbox->getCashierProfile(); 
        $json['cashier_full_name'] = $response_profile['full_name'];

        
        $stmt = $pdo->prepare("SELECT * FROM order_rro WHERE `order_id` = ?");
        $stmt->execute([$order_id]);
        $data = $stmt->fetch(PDO::FETCH_LAZY);
 
        if ($stmt->rowCount() > 0) {
            $json['order']['receipt']['status'] = true;
            $json['order']['receipt']['order_id'] = $data['order_id'];
            $json['order']['receipt']['checkbox_receipt_id'] = $data['checkbox_receipt_id'];
            $json['order']['receipt']['message'] = "Відправлений";
            if($data['checkbox_return_receipt_id'] == null){
                $json['order']['return_receipt']['status'] = false;
            }else{
                $json['order']['return_receipt']['status'] = true;
                $json['order']['return_receipt']['checkbox_return_receipt_id'] =  $data['checkbox_return_receipt_id'];
                $json['order']['return_receipt']['message'] = "Відправлений";
            }
        }else{
            $json['order']['receipt']['status'] = false;
            $json['order']['return_receipt']['status'] = false;
        }
        return getResponse($response,$json);

    }




    