<?php
class Conect_bd
{
    const HOST = "localhost";
    const DB_NAME = "chekbox";
    const USERNAME = "root";
    const PASSWORD = "root";
    const CHARSET = "utf8";

    private $db;

    public function __construct()
    {
        try {
            $dsn = "mysql:host=" . self::HOST . ";dbname=" . self::DB_NAME . ";charset=" . self::CHARSET . "";
            $opt = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $this->db =  new PDO($dsn, self::USERNAME, self::PASSWORD, $opt);
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
