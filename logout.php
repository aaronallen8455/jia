<?php
require './includes/config.inc.php';

//remove the remember me cookie
if (isset($_COOKIE['rm'])) {
    $s = strtok($_COOKIE['rm'], '-'); //selector
    setcookie('rm', '', time()-300);
    //remove database entry
    require MYSQL;
    $q = 'DELETE FROM rm_tokens WHERE selector='. $s .' user_id=' . $_SESSION['id'];
    $dbc->query($q);
}

//destroy the session
$_SESSION = array();
session_destroy();
//remove id from session cookie
setcookie(session_name(), '', time()-300);

//redirect to index
header('location: http://'.BASE_URL);