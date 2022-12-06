<?php
$configs = include_once('class/config.php');
include_once('class/checkbox.php');

$checkbox = new Checkbox($configs);
include_once('template/main.html');


/*$response =  $checkbox->getShifts();
print_r($response['results'][0]->status);*/

foreach ($variable as $key => $value) {
    # code...
}