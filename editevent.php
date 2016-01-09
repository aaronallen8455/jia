<?php
require './includes/config.inc.php';
$pageTitle = 'Edit Event';
include './includes/header.html';

//if not logged in, exit
if (!isset($_SESSION['id'])) {
    echo '<div class="centeredDiv"><h2>You\'re not authorized.</h2></div>';
    include './includes/footer.html';
    exit();
}
//check for submitted form
$event_errors = array();
if ($_SERVER['REQUEST_METHOD'] === 'POST' && filter_var($_GET['id'], FILTER_VALIDATE_INT, array('min_range'=>1))) {
    //fields: Title, Venue, Date, Start time, end time, description
    //validate title
    if (isset($_POST['title']) && strlen($_POST['title']) <= 80 && strlen($_POST['title']) >= 6) {
        $title = $_POST['title'];
        $title = strip_tags($title); //strip any html tags
    }else{
        $event_errors['title'] = 'Please enter a valid title for your event!';
    }
    //validate venue
    if (isset($_POST['venue']) && strlen($_POST['venue']) <= 80 && strlen($_POST['venue']) >= 2) {
        $venue = $_POST['venue'];
        $venue = strip_tags($venue);
    }else{
        $event_errors['venue'] = 'Please enter the name of the venue for your event!';
    }
    //validate date
    if (isset($_POST['date']) && preg_match('/^\d{1,2}\D\d{1,2}\D(\d{2}||\d{4})$/', $_POST['date'])) {
        $nums = preg_split('/\D/', $_POST['date']);
        $month = substr('0' . $nums[0], -2);
        $day = substr('0' . $nums[1], -2);
        $year = substr('20' . $nums[2], -4);
        $date = $year.'-'.$month.'-'.$day;
        if (strtotime($date) < strtotime(date('Y-m-d'))) $event_errors['date'] = 'The date can\'t be in the past!';
    }else{
        $event_errors['date'] = 'Please enter a valid date!';
    }
    //validate start time
    if (isset($_POST['startHour'], $_POST['startMin'], $_POST['startPeriod'])) {
        //time values are validated with JS
        $hour = (int) $_POST['startHour'];
        if ($_POST['startPeriod'] === 'pm' && ($_POST['startHour'] < 12)) {
            $hour += 12;
        }
        $hour = substr('0' . $hour, -2);
        $min = substr('0' . $_POST['startMin'], -2);
        $start = $hour . $min;
    }else{
        $event_errors['start'] = 'Please enter a valid start time!';
    }
    //validate end time
    if (isset($_POST['endHour'], $_POST['endMin'], $_POST['endPeriod'])) {
        //time values are validated with JS
        $hour = (int) $_POST['endHour'];
        if ($_POST['endPeriod'] === 'pm' && ($_POST['endHour'] < 12)) {
            $hour += 12;
        }
        $hour = substr('0' . $hour, -2);
        $min = substr('0' . $_POST['endMin'], -2);
        $end = $hour . $min;
    }else{
        $event_errors['end'] = 'Please enter a valid ending time!';
    }
    //filter description
    $desc = null;
    if (isset($_POST['desc'])) {
        $desc = strip_tags($_POST['desc']);
        if (strlen($_POST['desc'])>65535) {
            $desc = substr($desc, 0, 65535);
        }
    }
    //validate band members
    $band = '';
    if (!empty($_POST['band'])) {
        $i = 0;
        foreach ($_POST['band'] as &$bn) {
            if ($i !== 0) $band .= '|';
            $bn = htmlspecialchars(strip_tags($bn));
            $bn = str_replace(array(',','|'), '', $bn);
            //validate instrument
            if(isset($_POST['instr'][$i])) {
                $_POST['instr'][$i] = strip_tags($_POST['instr'][$i]);
                $_POST['instr'][$i] = str_replace(array(',','|'), '', $_POST['instr'][$i]);
            }
            //check for duplicate names
            if (array_count_values($_POST['band'])[$bn] === 1) {
                //compose band string
                $band .= $bn . ',' . ($_POST['instr'][$i]?$_POST['instr'][$i]:'');
            }
            $i++;
        }
    }
    //if no errors, update event
    if (empty($event_errors)) {
        require_once MYSQL;
        //make sure that user is creator of event or is admin
        $q = $dbc->query("SELECT user_id, band, venue FROM events WHERE id={$_GET['id']}");
        if ($row = $q->fetch(PDO::FETCH_ASSOC)) {
            if (!$_SESSION['isAdmin']) {
                if ($row['user_id'] !== $_SESSION['id']) {
                    //wrong user
                    echo '<h2>This page has been accessed in error!</h2>';
                    include './includes/footer.html';
                    exit();
                }
            }
        }else{
            echo '<h2>This page has been accessed in error!</h2>';
            include './includes/footer.html';
            exit();
        }
        //update event
        $q = 'UPDATE events SET title=?, venue=?, start_time=?, end_time=?, `date`=?, `desc`=?, band=? WHERE id='.$_GET['id'];
        $stmt = $dbc->prepare($q);
        if ($stmt->execute(array($title, $venue, $start, $end, $date, $desc, $band))) {
            $eid = $_GET['id'];
            //show success message
            include './views/editevent_success.html';
            include './includes/footer.html';
            //if the band was changed, redo the events_profiles entries.
            if ($band !== $row['band']) {
                //clear existing entries
                $q = 'DELETE FROM events_profiles WHERE event_id=' . $eid;
                if ($dbc->exec($q)) {
                    //create new entries
                    $q = 'SELECT u.id AS id FROM users AS u INNER JOIN profiles AS p ON p.user_id=u.id WHERE CONCAT_WS(\' \', LOWER(u.first_name), LOWER(u.last_name))=LOWER(?)';
                    $stmt = $dbc->prepare($q);
                    foreach ($_POST['band'] as $bn) {
                        $stmt->execute(array($bn));
                        $uid = $stmt->fetchColumn();
                        if ($uid) {
                            $dbc->exec('INSERT INTO events_profiles (profile_id, event_id) VALUES ('.$uid.', '.$eid.')');
                        }
                    }
                }
            }
            //if venue was changed, redo events_venues entry.
            if ($venue !== $row['venue']) {
                //delete existing entry
                $q = 'DELETE FROM events_venues WHERE event_id=' . $eid;
                if ($dbc->exec($q)) {
                    //create new entry
                    $q = 'SELECT id FROM venues WHERE LOWER(name)=LOWER(?)';
                    $stmt = $dbc->prepare($q);
                    $stmt->execute(array($venue));
                    $vid = $stmt->fetchColumn();
                    if ($vid) {
                        //create row
                        $dbc->exec("INSERT INTO events_venues (venue_id, event_id) VALUES ($vid, $eid)");
                    }
                }
            }
            exit();
        }else{
            trigger_error('A system error has occured, your event was not updated. We apologize for the inconvenience.');
        }
    }
}

//validate event id
if (($_SERVER['REQUEST_METHOD'] === 'GET' || !empty($event_errors)) && filter_var($_GET['id'], FILTER_VALIDATE_INT, array('min_range'=>1))) {
    //check user id against event user id or if user is admin
    require MYSQL;
    //get all the details for the event
    $event = $dbc->query('SELECT user_id, title, venue, DATE_FORMAT(`date`, \'%c/%e/%y\') AS date, start_time, end_time, `desc`, band FROM events WHERE id=' . $_GET['id']);
    if ($event) {
        $event = $event->fetch(PDO::FETCH_ASSOC);
        if (!$_SESSION['isAdmin']) {
            if ($event['user_id'] !== $_SESSION['id']) {
                echo '<h2>This page was accessed in error!</h2>';
                include './includes/footer.html';
                exit();
            }
        }
        //break up the time values
        $event['startHour'] = (int)substr($event['start_time'],0,2);
        if ($event['startHour'] > 12) {
            $event['startHour'] -= 12;
            $event['startPeriod'] = 'pm';
        }else $event['startPeriod'] = 'am';
        $event['startMin'] = substr($event['start_time'],-2);
        
        $event['endHour'] = (int)substr($event['end_time'],0,2);
        if ($event['endHour'] > 12) {
            $event['endHour'] -= 12;
            $event['endPeriod'] = 'pm';
        }else $event['endPeriod'] = 'am';
        $event['endMin'] = substr($event['end_time'],-2);
        //display the edit event form
        include './includes/form_functions.inc.php';
        include './views/editevent_form.html';
    }else{
        echo '<h2>Invalid Event ID!</h2>';
        include './includes/footer.html';
        exit();
    }
}else{
    echo '<h2>Invalid Event ID!</h2>';
}
include './includes/footer.html';
?>