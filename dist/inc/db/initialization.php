<?php
include_once('functions.php');
include_once('configuration.php');
try{
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
    $connexion = new PDO($dsn, $user, $password);
}catch(PDOException $e){
    echo $e->getMessage();
    exit;
}
