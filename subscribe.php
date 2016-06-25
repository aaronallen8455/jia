<?php
require './includes/config.inc.php';
include './includes/login.inc.php';
$pageTitle = 'Subscribe';
include './includes/header.html';

//on submit, validate form
$subscribe_errors = array();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //validate email
    if (isset($_POST['email']) && filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
        $email = $_POST['email'];
    }else $subscribe_errors['email'] = 'Please enter a valid email address!';

    if (empty($subscribe_errors)) {
        require_once MYSQL;
        //check if email already exists in DB
        $stmt = $dbc->prepare('SELECT id FROM `subscribers` WHERE email=?');
        $stmt->execute([$_POST['email']]);
        if (!$stmt->fetchColumn()) {
            $stmt->closeCursor();
            //check that this IP hasn't added more than 5 addresses
            $stmt = $dbc->query("SELECT COUNT(*) FROM `subscribers` WHERE ip='{$_SERVER['REMOTE_ADDR']}'");
            if ((int)$stmt->fetchColumn() < 5) {
                //add the email
                $code = bin2hex(openssl_random_pseudo_bytes(6));
                $q = 'INSERT INTO `subscribers` (email, ip, code) VALUES (?, ?, ?)';
                $stmt = $dbc->prepare($q);
                if ($stmt->execute([$_POST['email'], $_SERVER['REMOTE_ADDR'], $code])) {
                    include './views/subscribe_success.html';
                }else{
                    trigger_error('A system error has occurred while processing your request. We apologize for the inconvenience.');
                }
            }
        }else{
            $subscribe_errors['email'] = 'This email address already exists in our database!';
        }
    }
}elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['code'])) {
    //unsubbing
    //validate code
    if (preg_match('/[\w\d]{12}/', $_GET['code'])) {
        require_once MYSQL;
        if ($dbc->exec("DELETE FROM `subscribers` WHERE code='{$_GET['code']}'")) {
            include './views/unsubscribe_success.html';
        }else{
            trigger_error('A system error has occurred while processing your request. We apologize for the inconvenience.');
        }
    }
}

//display the form if applicable
if (!empty($subscribe_errors) || ($_SERVER['REQUEST_METHOD'] !== 'POST' && !isset($_GET['code']))) {
    require './includes/form_functions.inc.php';
    include './views/subscribe_form.html';
}
include './includes/footer.html';
?>