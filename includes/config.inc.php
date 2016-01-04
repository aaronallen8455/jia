<?php

$host = substr($_SERVER['HTTP_HOST'], 0, 5);
if (in_array($host, array('local', '127.0', '192.1'))) { //determine if host is local or on the server.
    $local = true;
}else{
    $local = false;
}

//errors are emailed here:
define('CONTACT_EMAIL', 'aaronallen8455@gmail.com');

if($local) {
    define('BASE_URI', 'file:///B:/Applications/xampp/htdocs/jia');
    define('BASE_URL', 'localhost/');
    define('MYSQL', BASE_URI . '/includes/mysql.inc.php');
}else{//live
    define('MYSQL', '../mysql.inc.php'); //SQL config is outside of webdir on live
}

//start the session
session_start();
//create error handler
function my_error_handler($e_number, $e_message, $e_file, $e_line, $e_vars) {
    global $local;
    //build the error message
    $message = "An error occured in script '$e_file' on line $e_line:\n$e_message\n";
    //add the backtrace
    $message .= "<pre>" . print_r(debug_backtrace(), 1) . "</pre>\n";
    //show message if not live
    if ($local) {
        echo '<div class="error">' . nl2br($message) . '</div>';
    }else{
        //send the error in an email
        error_log($message, 1, CONTACT_EMAIL, 'From:admin@jazzinaustin.com');
        //only print message in browser if error isn't a notice
        if ($e_number != E_NOTICE) {
            echo '<div class="error">A system error occured. We apologize for the inconvenience.</div>';
        }
    }
    return true; //so that php doesn't try to handle the error too.
}
//use the error handler
set_error_handler('my_error_handler');