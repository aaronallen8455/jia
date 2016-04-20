<?php
/**
 * Created by PhpStorm.
 * User: Admin
 * Date: 4/19/2016
 * Time: 4:38 PM
 */

require 'includes/config.inc.php';
$pageTitle = 'Search';
include 'includes/header.html';

//validate search string
$search_errors = array();
$search_str = '';
if ($_SERVER['REQUEST_METHOD'] === 'GET' && key_exists('q', $_GET)) {
    if (strlen($_GET['q']) < 40) {
        //filter out certain characters
        $search_str = preg_replace('/[^\w\s\d\-\']/', '', $_GET['q']);
        //remove commas
        $search_str = str_replace(',', ' ', $search_str);
    }else $search_errors['q'] = 'Must be less than 40 characters';
}

//display the form
require 'includes/form_functions.inc.php';
include 'views/search_form.html';

//display search results
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($search_str) && empty($search_errors)) {
    require MYSQL;
    //search the DB
    $q = 'CALL search(?)';
    $stmt = $dbc->prepare($q);
    $stmt->execute([$search_str]);
    //show results
    include 'views/search_results.html';
}

include 'includes/footer.html';
?>