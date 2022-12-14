$(document).ready(function () {
    rroOrderInfo()

    refreshStatusCashRegister();
    orderRefreshStatusShift()
    createShift()
    closeShift()

    orderCreateReceiptPayment();
    orderReturnReceiptPayment()

    confirmReceipt()

    function refreshStatusCashRegister() {
        $('.checkbox-rro-order-list-button-refresh').off().click(function () {
            preloader('on');
            $.ajax({
                type: "GET",
                dataType: "json",
                data: {
                    action: "refreshStatusCashRegister"
                },
                url: "class/controllerAjaxCheckbox.php",
                async: false,
                success: function (data) {
                    console.log(data);
                    preloader('off');
                    htmlControlPanel(data)
                    createShift()
                    closeShift()
                }
            });
        })
    }

    function closeShift() {
        $('.close-shift').click(function () {
            $('#item-shift .icon').html(' <div class="spinner-border spinner-border-sm mr-1" role="status"></div></button>')
            $.ajax({
                type: "GET",
                dataType: "json",
                data: {
                    action: "close_shift"
                },
                url: "class/controllerAjaxCheckbox.php",
                async: false,
                success: function (data) {
                    console.log(data);
                    rroOrderInfo()
                    createShift()
                    
                    $('#z-report-modal').modal('show')
                    zReport(data)
                    //file_get_contents('class/controllerAjaxCheckbox.php?action=zReport&z_report_id='+data['z_report_id'])
                    //window.open('class/controllerAjaxCheckbox.php?action=zReport&z_report_id='+data['z_report_id'], '_blank');
                }
            });
        })
    }

    $('.close').click(function(){
        $('#z-report-modal').modal('hide')
    })
    $('.btn-zreport').click(function(){
        $('#z-report-modal').modal('show')
        var data = JSON.parse( $(this).attr('data-shift') );  
        zReport(data)
    })

    function zReport(data){
        text = file_get_contents('class/controllerAjaxCheckbox.php?action=zReport&z_report_id='+data.z_report_id)
        $title_download = "z_report_"+ data.serial+"_"+data.closed_at;
        $('.modal-body').html(text)
        $('.z-report-num').html(data.serial)
        $('.modal-body').attr('data-title',  $title_download )
    }
    /*$('#z-report-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal 
        var data = button.data('shift')  
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this) 
        text = file_get_contents('class/controllerAjaxCheckbox.php?action=zReport&z_report_id='+data.z_repor_id)
        $title_download = "z_report_"+ data.serial+"_"+data.closed_at;
          //z_report_71_2022/12/06_12:06:50.txt
        modal.find('.modal-body').html(text)
        modal.find('.z-report-num').html(data.serial)
        modal.find('.modal-body').attr('data-title',  $title_download )
      })*/
      
  
    function createShift() {
        $('.create-shift').click(function () { 
            $('#item-shift .icon').html(' <div class="spinner-border spinner-border-sm mr-1" role="status"></div></button>')
            $.ajax({
                type: "GET",
                dataType: "json",
                data: {
                    action: "create_shift"
                },
                url: "class/controllerAjaxCheckbox.php",
                async: false,
                success: function (data) {
                    console.log(data);
                    rroOrderInfo()
                    closeShift()
                }
            });
        })
    }

    function htmlControlPanel(data) {
        if (data['status'] == 'OPENED') {
            $status = "?????????? ????????????????";
            $('.checkbox-rro-order-status').html('<span style="color: green">' + $status + '</span><br><span>' + data['cashier_full_name'] + '</span><br><span>'+data['date_at']+'</span>') 
            $('#item-shift').html(' <button class="btn btn-danger close-shift"><span class="icon"><i class="fa fa-ban fa-fw"></i></span>?????????????? ??????????</button>')
        } else {
            $status = "?????????? ??????????????";
            $('.checkbox-rro-order-status').html('<span style="color: red">' + $status + '</span><br><span>' + data['cashier_full_name'] + '</span><br><span></span>') 
            $('#item-shift').html(' <button class="btn btn-success create-shift"><span class="icon"><i class="fa fa-check fa-fw"></span></i>???????????????? ??????????</button>')
        }
    }

    function preloader(action) {
        if (action) {
            $("#preloader").show()
        } else {
            $("#preloader").hide()
        }
    }

    function orderRefreshStatusShift() {
        $('#checkbox-rro-order-info-button-refresh').off().click(function () {
            rroOrderInfo();
        })
    }

    function  htmlControlPanelOrder(data){
        $('.shift-status').show(); 
        htmlControlPanel(data)
        

        if(!data['order']['return_receipt']['status']){
            $('.order-generate-return-receipt').show()
            $('.order-return-receipt').hide()
        }else{
            $('.order-return-receipt').show()
            $('.order-generate-return-receipt').hide()
            $('.order-return-receipt-message').html(data['order']['return_receipt']['message'])
            $('.return-receipt-link').attr('href', 'class/controllerAjaxCheckbox.php?action=getReceiptHtml&checkbox_receipt_id='+data['order']['return_receipt']['checkbox_return_receipt_id'])
        }

        if(data['order']['receipt']['status']){
            $('.order-generate-receipt').hide();
            $('.order-receipt').show();
            
            $('.order-receipt-send-email').hide() 

            $('.order-message').html(data['order']['receipt']['message'])
            $('.receipt-link').attr('href', 'class/controllerAjaxCheckbox.php?action=getReceiptHtml&checkbox_receipt_id='+data['order']['receipt']['checkbox_receipt_id'])
        }else{
            $('.order-generate-receipt').show();
            $('.order-receipt').hide();
            $('.order-receipt-send-email').show()
            $('.order-generate-return-receipt').hide()
        }

        createShift()
        closeShift()
    }

    function rroOrderInfo(){
        preloader(true)
        var orderId = $('#checkbox-rro-order-info-container').attr('data-order-id');
        $.ajax({
            type: "GET",
            dataType: "json",
            data: {
                order_id : orderId,
                action: "rroOrderInfo"
            },
            url: "class/controllerAjaxCheckbox.php",
            success: function (data) {
                console.log(data);
                htmlControlPanelOrder(data);
                preloader(false)
            },
            error: function (data) {
                console.log(data)
            }
        });
    }
    

    function orderCreateReceiptPayment() {
        
        $('#checkbox-rro-order-info-button-create-receipt').click(function () {
            preloader(true)
            var orderId = $('#checkbox-rro-order-info-container').attr('data-order-id');
            var clientId = $('#checkbox-rro-order-info-container').attr('data-client-id');
            var email = $('#checkbox-rro-order-info-button-create-receipt-send-email').prop('checked');
            var payments = $('#checkbox-rro-order-info-button-create-receipt-payment-type').val();
            $.ajax({
                type: "GET", 
                dataType: "json",
                data: { 
                    order_id: orderId,
                    client_id: clientId,
                    payments: payments,
                    email: email,
                    action: "orderCreateReceiptPayment"
                },
                url: "class/controllerAjaxCheckbox.php", 
                success: function (data) {
                    console.log(data);
                    if(data["status"] != "CLOSED"){
                        rroOrderInfo()  
                    } 
                    
                    preloader(false)
                    alert(data['message'])
                },
                error: function (data) {
                    console.log(data)
                }
            });
        })
    }

    function orderReturnReceiptPayment(){
        $('#checkbox-rro-order-info-button-return-receipt').click(function () {
            preloader(true)
            var orderId = $('#checkbox-rro-order-info-container').attr('data-order-id');
            var clientId = $('#checkbox-rro-order-info-container').attr('data-client-id');
            $.ajax({
                type: "GET", 
                dataType: "json",
                data: { 
                    order_id: orderId,
                    client_id: clientId,
                    is_return: true,
                    action: "orderCreateReceiptPayment"
                },
                url: "class/controllerAjaxCheckbox.php", 
                success: function (data) {
                    console.log(data);
                    if(data["status"] == "CLOSED"){
                        alert(data['message'])
                    }else{
                        rroOrderInfo()
                    }
                    preloader(false)
                },
                error: function (data) {
                    console.log(data)
                }
            });
        })
    }

    function confirmReceipt(){
        $('.pre-create-receipt').click(function(){
            var orderId = $('#checkbox-rro-order-info-container').attr('data-order-id');
            var clientId = $('#checkbox-rro-order-info-container').attr('data-client-id');
            var email = $('#checkbox-rro-order-info-button-create-receipt-send-email').prop('checked')
            console.log(email);
            $.ajax({
                type: "GET",
                dataType: "html",
                data: {
                    order_id: orderId,
                    client_id: clientId,
                    action: "confirmReceipt"
                },
                url: "class/controllerAjaxCheckbox.php",
                success: function (data) {
                    $('.order-list-goods').html(data)
                    
                },
                error: function (data) {
                    console.log(data)
                }
            });
        })
    }

    function file_get_contents( url ) {	// Reads entire file into a string
        // 
        // +   original by: Legaev Andrey
        // %		note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain.
    
        var req = null;
        try { req = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {
            try { req = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {
                try { req = new XMLHttpRequest(); } catch(e) {}
            }
        }
        if (req == null) throw new Error('XMLHttpRequest not supported');
    
        req.open("GET", url, false);
        req.send(null);
    
        return req.responseText;
    }
    // z-report-text
    /*$('#z-report-print').click(function(){
         
            // Store DIV contents in the variable.
            var div = document.getElementById('z-report-text');

            // Create a window object.
            // Open the window. Its a popup window.
            var win = window.open('', '', 'height=700,width=700');
            
          	// Write contents in the new window.
            win.document.write(div.outerHTML);
            win.document.close();
            win.print();       // Finally, print the contents.
       
    })*/
   

})
function printElement(elem, title) {
     
    var popup = window.open('', 'PRINT', 'height=600,width=900');
   
    popup.document.write('<html><head><title>' + title  + '</title><style>body {font-family: Arial;}</style>');
    popup.document.write('</head><body >');
    popup.document.write(document.getElementById(elem).innerHTML);
    popup.document.write('</body></html>');
    popup.document.close(); 
    popup.focus(); 
    popup.print();
    popup.close();
    return true;
  }

  function download( ){
    var a = document.body.appendChild(
        document.createElement("a")
    );
    var text = document.getElementById('z-report-text').innerHTML.replace('<pre>', '')  ;
    var title = $('#z-report-text').attr('data-title');
     console.log(title)   
    a.download = title+".txt";
    a.href = "data:text/text," + text;
    a.click();
}
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})