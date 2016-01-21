<?php

if($local) {
    define('DSN', 'mysql:dbname=jia;host=localhost');
    define('USER', 'root');
    define('PASS', '');
}else{//live
    define('DSN', 'mysql:dbname=pronzneu_jia;host=localhost');
    define('USER', 'pronzneu_jia');
    define('PASS', 'z7xvTKIT3S?5'); //%ey74cSIeteX
}

$dbc = new PDO(DSN,USER,PASS);