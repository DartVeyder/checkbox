<?php
    class Checkbox{
        private $login;

        private $password;

        private $cashbox_key;

        private $is_dev;

        private $access_token = '';

        private $config;

        public function __construct($config)
        {
            $this->config = $config['checkbox_auth'];
            $auth = $this->auth(0); //0 - тестова для розробки (тестовий сервер), 1 - тестова для розробки (промисловий сервер), 2- робоча 

            $this->login = $auth['login'];  //"test_6xuslohvw"
            $this->password = $auth['password'];           //"test_6xuslohvw"
            $this->cashbox_key =  $auth['cashbox_key'];      //"test739618130f98710104064abf"
            $this->is_dev =  $auth['is_dev']; 
            $this->getBearToken();
        }

        private function auth($is_auth){
            $data = [];
            $data = $this->config ;  
            return $data[$is_auth];
        }

        //Вхід користувача (касира) за допомогою логіна та паролю та Створення Bear токена
        public function getBearToken()
        {
            $params = ['login' => $this->login, 'password' => $this->password];
            $response = $this->makePostRequest('/api/v1/cashier/signin', $params);
    
            $this->access_token = $response['access_token'] ? $response['access_token'] : '';
        }

        //Відкриття нової зміни касиром.
        public function connect()
        {
            $cashbox_key = $this->cashbox_key;
            $header_params = ['cashbox_key' => $cashbox_key];
            return $this->makePostRequest('/api/v1/shifts', [], $header_params);
        }

        //Отримання змін поточного касира
        public function getShifts()
        {
            $url = '/api/v1/shifts?desc=true';
            return $this->makeGetRequest($url);
        }

        //Створення Z-Звіту та закриття поточної зміни користувачем (касиром).
        public function disconnect()
        {
            return $this->makePostRequest('/api/v1/shifts/close');
        }

        //Отримання інформації про активну зміну користувача (касира)
        public function getCurrentCashierShift()
        {
            $url = '/api/v1/cashier/shift';
            return $this->makeGetRequest($url);
        }

        //Створення чеку продажу/повернення, його фіскалізація та доставка клієнту по email.
        public function create_receipt($params)
        {
            return $this->makePostRequest('/api/v1/receipts/sell', $params);
        }
    

        private function makePostRequest($route, $params = [], $header_params = [])
        {
            $url_host = $this->is_dev ? 'https://dev-api.checkbox.in.ua' : 'https://api.checkbox.in.ua';
            $url = $url_host . $route;
    
            $header = ['Content-type' => 'application/json'];
    
            if ($this->access_token) {
                $header = array_merge($header, ['Authorization: Bearer ' . trim($this->access_token)]);
            }
    
            if (isset($header_params['cashbox_key'])) {
                $header = array_merge($header, ['X-License-Key: ' . $header_params['cashbox_key']]);
            }
    
            $header = array_merge($header, ['X-Client-Name: shhygolvv_khm']);
            $header = array_merge($header, ['X-Client-Version: 1']);
    
            $curl = curl_init();
    
            curl_setopt_array($curl, array(
                CURLOPT_URL            => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_ENCODING       => "",
                CURLOPT_MAXREDIRS      => 10,
                CURLOPT_TIMEOUT        => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST  => "POST",
                CURLOPT_POSTFIELDS     => json_encode($params),
                CURLOPT_HTTPHEADER     => $header,
            ));
    
            $response = curl_exec($curl);
    
            curl_close($curl);
    
            return isset($response) ? (array)json_decode($response) : [];
        }

    private function makeGetRequest($route, $params = [], $header_params = [], $echo = false)
    {
        $url_host = $this->is_dev ? 'https://dev-api.checkbox.in.ua' : 'https://api.checkbox.in.ua';
        $url = $url_host . $route;

        $header = ['Content-type' => 'application/json'];
        if ($this->access_token) {
            $header = array_merge($header, ['Authorization: Bearer ' . trim($this->access_token)]);
        }

        if (isset($header_params['cashbox_key'])) {
            $header = array_merge($header, ['X-License-Key: ' . $header_params['cashbox_key']]);
        }

        $header = array_merge($header, ['X-Client-Name: shhygolvv_khm']);
        $header = array_merge($header, ['X-Client-Version: 1']);

        if ($params) {
            $params = http_build_query($params);
        } else {
            $params = '';
        }

        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_ENCODING       => "",
            CURLOPT_MAXREDIRS      => 10,
            CURLOPT_TIMEOUT        => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST  => "GET",
            CURLOPT_HTTPHEADER     => $header,
        ));

        $response = curl_exec($curl);

        curl_close($curl);

        if ($echo) {
            return $response;
        } else {
            return isset($response) ? (array)json_decode($response) : [];
        }

    }

    public function getReceiptHtml($receipt_id)
    {
        $url = '/api/v1/receipts/' . $receipt_id . '/html/';
        return $this->makeGetRequest($url, [], [], true);
    }

    public function getReceiptPdf($receipt_id)
    {
        $url = '/api/v1/receipts/' . $receipt_id . '/pdf/';
        return $this->makeGetRequest($url, [], [], true);
    }

    public function getZReports()
    {
        $url = '/api/v1/reports/?is_z_report=true';
        return $this->makeGetRequest($url);
    }

    public function getReportText($report_id)
    {
        $url = '/api/v1/reports/' . $report_id . '/text/';
        return $this->makeGetRequest($url, [], [], true);
    }

    public function getCashierProfile(){
        $url = '/api/v1/cashier/me';  
        return json_decode($this->makeGetRequest($url, [], [], true),1);
    }
    
    }
    

?>