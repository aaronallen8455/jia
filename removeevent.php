<?php
require './includes/config.inc.php';
$pageTitle = 'Remove Event';
include './includes/header.html';

//if not logged in, exit
if (!isset($_SESSION['id'])) {
    echo '<div class="centeredDiv"><h2>You\'re not authorized.</h2></div>';
    include './includes/footer.html';
    exit();
}
//validate event id and insure that user is the creator of event or is an admin or owns the venue
if ($_SERVER['REQUEST_METHOD'] === 'GET' && filter_var($_GET['id'], FILTER_VALIDATE_INT, array('min_range'=>1))) {
    //get user id
    require MYSQL;
    if (empty($_SESSION['isAdmin'])) {
        $q = 'SELECT events.user_id AS uide, venue_owner.user_id AS uido FROM events LEFT OUTER JOIN events_venues ON events_venues.event_id=events.id
LEFT JOIN venue_owner ON venue_owner.venue_id=events_venues.venue_id WHERE events.id='.$_GET['id'].' AND (events.user_id='.$_SESSION['id'].' OR venue_owner.user_id='.$_SESSION['id'].')';
        $row = $dbc->query($q)->fetch(PDO::FETCH_NUM);
        //check for id match
        if (empty($row)) {
            echo '<div class="centeredDiv"><h2>This page was accessed in error!</h2></div>';
            include './includes/footer.html';
            exit();
        }
    }
    // get event title
    $q = 'SELECT title FROM events WHERE id=' . $_GET['id'];
    $r = $dbc->query($q)->fetch(PDO::FETCH_NUM);
    echo "<div class=\"centeredDiv\"><h2>Are you sure you want to remove the event '$r[0]?'";
    ?>
<form action="http://<?php echo BASE_URL; ?>removeevent/<?php echo $_GET['id']; ?>/" method="post">
    <input type="hidden" value="true" name="delete" />
    <button type="submit">Yes</button>
    <button type="button" id="cancelButton">Cancel</button>
</form>
</div>
<script type="application/javascript" src="http://<?php echo BASE_URL; ?>js/cancel.js"></script>
<?php
    //check for form submission
}else if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['delete'] === 'true') {
    //check that user is still the author of the event, or is admin
    if (filter_var($_GET['id'], FILTER_VALIDATE_INT, array('min_range'=>1))) {
        require MYSQL;
        if (empty($_SESSION['isAdmin'])) {
            $q = 'SELECT events.user_id AS uide, venue_owner.user_id AS uido FROM events LEFT OUTER JOIN events_venues ON events_venues.event_id=events.id
LEFT JOIN venue_owner ON venue_owner.venue_id=events_venues.venue_id WHERE events.id='.$_GET['id'].' AND (events.user_id='.$_SESSION['id'].' OR venue_owner.user_id='.$_SESSION['id'].')';
            $row = $dbc->query($q)->fetch(PDO::FETCH_NUM);
            //check for id match
            if (empty($row)) {
                echo '<div class="centeredDiv"><h2>This page was accessed in error!.</h2></div>';
                include './includes/footer.html';
                exit();
            }
        }
        //delete row from events
        $q = 'DELETE FROM events WHERE id=' . $_GET['id'];
        if ($dbc->exec($q)) {
            //success
            echo '<div class="centeredDiv"><h2>The event was successfully removed!</h2></div>';
        }else{
            trigger_error('The event was not deleted due to a system error. We apologize for the inconvenience.');
        }
    }
}
include './includes/footer.html';
?>