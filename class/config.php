<?php

return [
    'bd'=>[ 
        'host'       => 'localhost',
        'username'   => 'root',
        'password'   => 'root',
        'db_name'    => 'chekbox',
        'charset'    => 'utf8',
    ],
    'checkbox_auth' =>[
        0 => [
            'title'       => 'Тестовий касир',
            'login'       => 'test_6xuslohvw',
            'password'    => 'test_6xuslohvw',
            'cashbox_key' => 'test739618130f98710104064abf',
            'is_dev'      => 0,
        ],
        1 => [
            'title'       => 'Тестовий касир ФОП ШЕВЕЛЬОВ',
            'login'       => 'test_lemieydaw',
            'password'    => 'test_lemieydaw',
            'cashbox_key' => 'testedf3d810912bfe8820c9438b',
            'is_dev'      => 0,
        ]
    ]
];

?>