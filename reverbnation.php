<?php
require './includes/config.inc.php';
$pageTitle = 'Import from ReverbNation';
include './includes/header.html';

//ensure that user is logged in
if (isset($_SESSION['id']) && filter_var($_SESSION['id'], FILTER_VALIDATE_INT, array('min_range' => 1))) {
    //if the initial form was posted, validate file type
    $import_errors = array();
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit1'])) {
        //check for file
        if (isset($_FILES['csv']) && is_uploaded_file($_FILES['csv']['tmp_name']) && ($_FILES['csv']['error'] === UPLOAD_ERR_OK)) {
            //if user uploads a different file after correcting an error, remove the original file.

            $file = $_FILES['csv'];
            //check file size
            $size = round($file['size'] / 1024);
            if ($size > 3000) {
                $import_errors['csv'] = 'The file was too large.';
                unlink($file['tmp_name']);
            } else {
                //validate file type
                $allowed_mime = array('text/csv', 'application/csv', 'application/octet-stream', 'text/tsv', 'text/plain');
                $allowed_extensions = array('.csv');
                $fileinfo = finfo_open(FILEINFO_MIME_TYPE);
                $file_type = finfo_file($fileinfo, $file['tmp_name']);
                finfo_close($fileinfo);
                $file_ext = substr($file['name'], -4);
                if (!in_array($file_type, $allowed_mime) || !in_array($file_ext, $allowed_extensions)) {
                    $import_errors['csv'] = 'The uploaded file was not of the proper type.';
                    unlink($file['tmp_name']);
                }
            }
        } else {
            $import_errors['csv'] = 'Please select a .csv file from Reverbnation.';
        }
        
        //if no errors, process the csv
        if (empty($import_errors)) {

            //parse the csv
            if (($handle = fopen($file['tmp_name'], "r")) !== FALSE) {
                fgetcsv($handle);
                while (($data = fgetcsv($handle, 1000)) !== FALSE) {
                    if (count($data) === Event::FIELDS)
                        new Event($data);
                }
                fclose($handle);
            }else{
                trigger_error('An error occured, csv file could not be opened.');
                unlink($file['tmp_name']);
                include './includes/footer.html';
                exit();
            }
            //check if events were found
            if (!empty(Event::$events)) {
                //show the Confirmation form
                include './views/rnconf_form.html';
                include './includes/footer.html';
                unlink($file['tmp_name']);
                exit();
            }else{
                echo '<div class="centeredDiv"><h2>No usable events were found in \''.$file['name'].'\'.</h2></div>';
            }
        }
        //confirm list of events to import if second stage post.
    }elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit2'])) {

        if (!empty($_POST['check'])) {
            require MYSQL;

            //perform DB operation.
            foreach ($_POST['check'] as $i=>$json) {
                $sql = 'CALL create_event(?,?,?,?,?,?,?,?, @eid)';
                $stmt = $dbc->prepare($sql);
                //get event details
                $event = json_decode($json);
                $date = $event->date;
                $venue = $event->venue;
                $band = $event->band;
                $desc = strip_tags($event->desc);
                $start = $event->startTime;
                $title = strip_tags($_POST['title'][$i]);
                //insert into DB
                $stmt->execute(array($venue, $date, $start, null, $title, $band, $_SESSION['id'], $desc));
                //get event id
                $eid = $dbc->query('SELECT @eid')->fetchColumn();
                $stmt->closeCursor();
                //create profile_events entries for all other band members
                $q = 'SELECT u.id AS id FROM users AS u INNER JOIN profiles AS p ON p.user_id=u.id WHERE CONCAT_WS(\' \', LOWER(u.first_name), LOWER(u.last_name))=LOWER(?)';
                $stmt = $dbc->prepare($q);
                $band = str_replace(',', '', $band);
                $name = strtok($band, '|');
                do {
                    $stmt->execute(array($name));
                    $uid = $stmt->fetchColumn();
                    if ($uid) {
                        $dbc->exec('INSERT INTO events_profiles (profile_id, event_id) VALUES ('.$uid.', '.$eid.')');
                    }
                }while ($name = strtok('|'));
                $stmt->closeCursor();
                if (!empty($eid))
                    echo 'Imported event "' . $title . '"<br/>';
                else echo 'The event "' . $title . '" was not imported because it already exists in our database.<br/>';
            }
            //display success message.
            echo '<div class="centeredDiv"><h2>Import Completed!</h2></div>';
        }else echo '<div class="centeredDiv"><h2>No events found.</h2></div>';

        include './includes/footer.html';
        exit();
    }
    
    //display the csv import form
    include './views/rnimport_form.html';
}else{
    echo '<div class="centeredDiv"><h2>Access Denied.</h2></div>';
}

include './includes/footer.html';

//a class for representing a complete event to import
class Event
{
    //number of fields present in the reverbnation csv format
    //Date,Venue,Address,City,State,Postal Code,Country,Details,Age Limit,Ticket Details,Ticket Link,Artists
    const FIELDS = 12;
    static $events = array();
    static $map = array(
    'date' => 0,
    'venue' => 1,
    'desc' => 7,
    'band' => 11
    );

    public $date;
    public $venue;
    public $desc;
    public $band;
    public $startTime;

    public function __construct(
        $fieldsArray
    )
    {
        $this->date = $fieldsArray[self::$map['date']];
        $this->venue = $fieldsArray[self::$map['venue']];
        $this->desc = $fieldsArray[self::$map['desc']];
        $this->band = self::parseBand($fieldsArray[self::$map['band']]);
        $this->startTime = substr($this->date, -5, 2) . substr($this->date, -2);

        //validate date
        if (checkdate(substr($this->date, 5, 2), substr($this->date, 8, 2), substr($this->date, 0, 4))) {
            //check if in the past
            if (strtotime($this->date) >= time()) {
                //remove time from date
                $this->date = substr($this->date, 0, 10);
                //add to array
                self::$events[] = $this;
            }
        }
    }

    static function parseBand($str)
    {
        $str = preg_replace('/, /', ',|', $str);
        //add creator as band member
        if (empty($str)) {
            $str = $_SESSION['name'] . ',';
        }else{
            $str = $_SESSION['name'] . ',|' . $str;
            $str .= ',';
        }
        return $str;
    }
}

?>