<?php

//check if login form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') { //otherwise check if form was submitted
    if (isset($_POST['login'])) {
        $loginEmail = $_POST['login']['email']; //save value for sticky form use
        if (filter_var($_POST['login']['email'], FILTER_VALIDATE_EMAIL)) {
            $e = $_POST['login']['email'];
        }else{
            $loginError = true;
        }
        if(!empty($_POST['login']['pass'])) {
            $p = $_POST['login']['pass'];
        }
    }
}else if (isset($_COOKIE['email'], $_COOKIE['pass'])) { //otherwise, check for login cookies.
    $p = $_COOKIE['pass'];
    setcookie('pass', $p, time() + 60 * 60 * 24 * 31); //store cookies for 1 month
    if (filter_var($_COOKIE['email'], FILTER_VALIDATE_EMAIL)) {
        $e = $_COOKIE['email'];
        setcookie('email', $e, time() + 60 * 60 * 24 * 31);
    }
}

//process login info
if (isset($p, $e)) {
    require MYSQL;
    $loginError = true; //turns false if login succeeds
    //get password from database
    $q = 'SELECT id, pass, type, CONCAT_WS(\' \', first_name, last_name) as name FROM users WHERE email=?';
    $stmt = $dbc->prepare($q);
    $stmt->execute(array($e));
    if ($stmt->rowCount() === 1) {
        $row = $stmt->fetch();
        $passHash = $row['pass'];
        
        //verify the password password
        if (isset($pass) && password_verify($p, $passHash)) {
            if (!empty($row['type'])) { //login succeeded
                //if user is admin, set the prop
                if ($row['type'] === 'a') {
                    session_regenerate_id(true);
                    $_SESSION['isAdmin'] = true;
                }
                //set other props
                $_SESSION['id'] = $row['id'];
                $_SESSION['name'] = $row['name'];
                //set the remember me cookie
                if ($_POST['login']['remember']) {
                    setcookie('email', $e, time() + 60 * 60 * 24 * 31);
                    setcookie('pass', $p, time() + 60 * 60 * 24 * 31);
                }else if (isset($_COOKIE['email'], $_COOKIE['pass']) && isset($_POST['login'])) {
                    //if the box was not checked, we delete existing cookies.
                    setcookie('email', '', time()-3600);
                    setcookie('pass', '', time()-3600);
                }
                $loginError = false;
            }
        }
    }
}