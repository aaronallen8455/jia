<?php
require './includes/config.inc.php';
require './includes/login.inc.php';

if (isset($_SESSION['id'])) {
    //redirect to the myaccount page if user successfully logged in.
    header('Location: http://'. BASE_URL . 'myaccount.php');
}

$pageTitle = 'Login';
$noLogin = true;
include './includes/header.html';
//show a login form if user isn't logged in.
    if (empty($_SESSION['id'])) {
      include './views/login_form.html';
                }else{ 
                    echo '<span class="loginSuccess">You\'re logged in as ' . $_SESSION['name'] . '! <a href="http://'.BASE_URL.'myaccount/">My Account</a></span>';
                }
include './includes/footer.html';
