<?php
require './includes/config.inc.php';
include './includes/login.inc.php';
$pageTitle = 'My Account';
include './includes/header.html';
//make sure user is logged in
if (isset($_SESSION['id']) && filter_var($_SESSION['id'], FILTER_VALIDATE_INT, array('min_range'=>1))) {
    //get associated events, profile
    require_once MYSQL;
    /*$q = 'SELECT * FROM profiles WHERE user_id='.$_SESSION['id'];
    if ($profile = $dbc->query($q)) {
        $profile = $profile->fetch();
    }*/
    $q = 'SELECT title, events.id, venue, DATE_FORMAT(`date`, \'%c/%e/%y\') AS edate FROM events WHERE `date` >= CURDATE() AND user_id='.$_SESSION['id'].'
    ORDER BY `date` DESC LIMIT 25';
    $events = $dbc->query($q);
    //get events that this profile is tagged in but doesn't own.
    $q = 'SELECT title, events.id, venue, DATE_FORMAT(`date`, \'%c/%e/%y\') AS edate FROM events
JOIN events_profiles ON event_id = events.id WHERE profile_id = '.$_SESSION['id'].' AND events.user_id <> '.$_SESSION['id'].' AND `date` >= CURDATE()';
    $taggedEvents = $dbc->query($q);
    //display view
    include './views/myaccount.html';
}else{
    echo '<h2>You are not logged in!</h2>';
}
include './includes/footer.html';
?>