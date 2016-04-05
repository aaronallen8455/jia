<?php
require './includes/config.inc.php';
$pageTitle = 'Remove Tag';
include './includes/header.html';

//check for form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id']) && isset($_POST['delete'])) {
//ensure logged in
    if (isset($_SESSION['id']) && filter_var($_SESSION['id'], FILTER_VALIDATE_INT, ['min_range' => 1])) {
        //check that event id was passed and that user's profile is tagged in that event
        if (isset($_GET['id']) && filter_var($_GET['id'], FILTER_VALIDATE_INT, ['min_range' => 1]) && isset($_SESSION['hasProfile'])) {
            require MYSQL;
            //verify the tag
            $q = 'SELECT events.band AS band, events.title AS title FROM events_profiles JOIN profiles ON profiles.user_id=profile_id JOIN events ON event_id=events.id
WHERE profile_id=? AND event_id=? LIMIT 1';
            $stmt = $dbc->prepare($q);
            $stmt->execute(array($_SESSION['id'], $_GET['id']));
            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $band = $row['band'];
                $title = $row['title'];
                $stmt->closeCursor();
                //delete the events_profiles entry
                if ($dbc->exec('DELETE FROM events_profiles WHERE event_id=' . $_GET['id'] . ' AND profile_id=' . $_SESSION['id'])) {
                    //modify the band entry
                    $band = preg_replace('/\|'.$_SESSION['name'].',[^|]*$|' . $_SESSION['name'] . ',[^|]*\|?/', '', $band);
                    if ($dbc->exec('UPDATE events SET band=\'' . $band . '\' WHERE id=' . $_GET['id'])) {
                        echo '<div class="centeredDiv"><h2>You have been untagged from the event \'' . $title . '.\'</h2>';
                    } else {
                        trigger_error('The tag could not be deleted because a system error occured. We apologize for the inconvenience.');
                    }
                } else {
                    trigger_error('The tag could not be deleted because a system error occured. We apologize for the inconvenience.');
                }
            } else {
                echo '<div class="centeredDiv"><h2>You are not tagged in this event.</h2></div>';
            }
        } else {
            echo '<div class="centeredDiv"><h2>Access Denied</h2></div>';
        }
    } else {
        echo '<div class="centeredDiv"><h2>Access Denied</h2></div>';
    }
}else if ($_SERVER['REQUEST_METHOD'] === 'GET' && filter_var($_GET['id'], FILTER_VALIDATE_INT, array('min_range'=>1))) {
    //get the event's title
    require MYSQL;
    if ($title = $dbc->query('SELECT title FROM events WHERE id='.$_GET['id'])->fetchColumn()) {
        //display the confirmation form.
        ?>
        <div class="centeredDiv"><h2>Are you sure you want to un-tag yourself from the event '<?php echo $title; ?>'?</h2>
            <form action="http://<?php echo BASE_URL; ?>removetag/<?php echo $_GET['id']; ?>/" method="post">
                <input type="hidden" value="true" name="delete"/>
                <button type="submit">Yes</button>
                <button type="button" id="cancelButton">Cancel</button>
            </form>
        </div>
        <script type="application/javascript" src="http://<?php echo BASE_URL; ?>js/cancel.js"></script>
        <?php
    }
    
}else{
    echo '<div class="centeredDiv"><h2>Access Denied</h2></div>';
}

include './includes/footer.html';

?>