<?php
require './includes/config.inc.php';
//assert admin
if (!isset($_SESSION['isAdmin'])) {
    header('Location: http://'.BASE_URL);
    exit();
}

require MYSQL;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $top = !empty($_POST['emailTop'])?$_POST['emailTop']:'';
    $eventTable = '<table border="1" class="event-table" style="border-collapse: collapse; min-width: 400px;">';
    $bottom = !empty($_POST['emailBottom'])?$_POST['emailBottom']:'';

    $eventTable .= '<tr><th style="padding: 5px;">Event</th><th style="padding: 5px;">Venue</th><th style="padding: 5px;">Time</th></tr>';

    //make event table
    $events = array();
    foreach ($_POST['event'] as $event) {
        //get type - starred, added, or omitted
        list($type, $json) = preg_split('/ /', $event, 2);
        //handle each type
        $starred = false;
        switch ($type) {
            case '-':
                break;
            case '*':
                $starred = true;
            case '+':
                $array = json_decode(html_entity_decode($json), true); //create assoc array
                $array['type'] = !empty($starred)?'starred':'normal';
                //add to events
                $events[$array['date']][] = $array;
        }
    }

    foreach ($events as $date=>$eventGroup) {
        $eventTable .= "<tr><th colspan='3' style='text-align: left; padding: 5px 5px 5px 20px; background-color: lightgrey;'>$date</th></tr>";
        $toggler = 1; //odd or even row?
        foreach ($eventGroup as $event) {
            //add starred class if event is starred
            $eventTable .= '<tr style="background-color: ' . ($toggler?'#f1f8ff; ':'#e0f3ff;') . '">';
            $eventTable .= "<td style='padding: 4px;'><a href='http://".BASE_URL."events/{$event['id']}/' " . (($event['type'] === 'starred')?"style='background-color:#FFFF00;'":'') .">{$event['title']}</a></td>";
            $eventTable .= "<td style='padding: 4px;'>{$event['venue']}</td>";
            $eventTable .= "<td style='padding: 4px;'>{$event['time']}</td>";
            $eventTable .= '</tr>';
            $toggler ^= 1;
        }
    }
    $eventTable .= '</table>';

    //generate the HTML
    $html = "<body style='min-width: 400px; max-width: 900px;'>
    <a href='http://jazzinaustin.com/'>
    <table style='width: 100%; background-color: #14206c;'>
    <tr style='background: rgba(0, 0, 0, 0) linear-gradient(to bottom, #0b113b, #14206c 50%) repeat scroll 0 0;'>
        <td style='display:block; width: 100%; padding: 10px; text-align: center;'><img src='http://".BASE_URL."images/logo.png'/></td>

</tr>
</table>
</a>
    $top
    <span><h2>JIA Calendar: Upcoming Shows</h2></span>
    $eventTable
    $bottom
    <small>To un-subscribe from this email list, click <a href='*!@?+'>here</a>.</small>
    </body>";

    $_SESSION['email_message'] = $html;
    
    //get all email addresses
    $emails = [];
    $page = 0;
    while ($stmt = $dbc->query('SELECT email, code FROM `subscribers` ORDER BY id LIMIT ' . $page++*50 . ', ' . '50')) {
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            do {
                $emails[] = ['email' => $row['email'], 'code' => $row['code']];
            }while ($row = $stmt->fetch(PDO::FETCH_ASSOC));
        }else break;
    }
    $emails = json_encode($emails);
    
    //mailer interface
    include './views/mailer.html';

}else{

    $pageTitle = 'Email Creator';
    include './includes/header.html';
    //on form submit

    //get all upcoming events
    $q = 'SELECT id, start_time, end_time, title, venue, DATE_FORMAT(`date`, \'%a. %M %D, %Y\') AS `edate` FROM events WHERE `date`>=CURRENT_DATE() AND `date`<DATE_ADD(CURDATE(), INTERVAL 1 WEEK) ORDER BY `date` ASC, start_time ASC';
    $events = array();
    $stmt = $dbc->query($q);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $events[] = array(
            'id' => $row['id'],
            'time' => parseTime($row['start_time']) . (!empty($row['end_time'])?('-' . parseTime($row['end_time'])):''),
            'title' => str_replace("'", '&#39;', $row['title']),
            'venue' => str_replace("'", '&#39;', $row['venue']),
            'date' => $row['edate']
        );
    }

    //display the form
    include './views/email_form.html';
    include './includes/footer.html';
}

?>