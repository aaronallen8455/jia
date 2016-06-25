<?php
require '../includes/config.inc.php';

//assert admin
if (isset($_SESSION['isAdmin']) && $_SESSION['isAdmin'] === true && isset($_POST['action'])) {
    $response = 0;
    //if initial request, get the email content and store it
    //if ($_POST['action'] === 'init' && isset($_POST['msg'])) {
    if ($_POST['action'] === 'init') {
        //$_SESSION['email_message'] = $_POST['msg'];
        $response = 1;
    }else if ($_POST['action'] === 'stop') {
        //close the session when done
        unset($_SESSION['email_message']);
        $response = 1;
    }else if ($_POST['action'] === 'mail' && isset($_POST['adds']) && !empty($_SESSION['email_message'])) {
        //get array of email addresses.
        $emails = json_decode($_POST['adds']);
        if (is_array($emails)) {
            foreach ($emails as $email) {
                if (filter_var($email->email, FILTER_VALIDATE_EMAIL)) {
                    //send the email
                    $from = "mailer@jazzinaustin.com";
                    $headers = "Content-type: text/html; charset=iso-8859-1\r\nFrom: JazzInAustin <$from>\r\n";
                    // insert in the unsub URL
                    $msg = str_replace('*!@?+', 'http://' . BASE_URL . 'subscribe/' . $email->code . '/', $_SESSION['email_message']);
                    //echo $msg;
                    mail($email->email, 'Jazz in Austin Newsletter', $msg, $headers, "-f " . $from);
                }
            }
            $response = 1;
        }
    }
    echo $response;
}
?>