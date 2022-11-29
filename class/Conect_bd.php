<?php
class Conect_bd
{
    private $HOST;
    private $DB_NAME;
    private $USERNAME;
    private $PASSWORD; 
    private $CHARSET;

    private $db; 
    public function __construct($config)
    {
        $this->HOST = $config['bd']['host'];
        $this->DB_NAME = $config['bd']['db_name'];
        $this->USERNAME = $config['bd']['username'];
        $this->PASSWORD = $config['bd']['password'];
        $this->CHARSET = $config['bd']['charset'];

        try {
            $dsn = "mysql:host=" . $this->HOST . ";dbname=" . $this->DB_NAME . ";charset=" . $this->CHARSET . "";
            
            $opt = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $this->db =  new PDO($dsn, $this->USERNAME, $this->PASSWORD, $opt);
        } catch (PDOException $e) {
            echo $e->getMessage();
        }
    }

    public function getDb()
    { 
        if ($this->db instanceof PDO) {
            return $this->db;
        }
    }
  
}
