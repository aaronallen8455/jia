<?php
/**
 * Created by PhpStorm.
 * User: Admin
 * Date: 4/8/2016
 * Time: 3:39 PM
 */

require './includes/config.inc.php';
include './includes/login.inc.php';
$pageTitle = 'JIA Weekly';
include './includes/header.html';

include './views/blog.html';

include './includes/footer.html';

?>