<?php
require './includes/config.inc.php';
require './includes/login.inc.php';
include './includes/header.html';
//show a login form if user isn't logged in.
if (empty($_SESSION['id'])) { ?>
<div id="registerForm">
            <form action="<?php echo $_SERVER['PHP_SELF'];?>" method="post">
                <label for="email">Email: </label>
                <input type="text" id="email" class="loginInput" name="login[email]" value="<?php if (isset($loginEmail)) {echo $loginEmail;} ?>"/><br />
                <label for="password">Password: </label>
                <input type="password" id="password" class="loginInput" name="login[pass]"/><br />
                <?php if (isset($loginError) && $loginError === true) {
    echo '<span class="error">Invalid Email or Password</span><br />';
} ?>
                <a href="#" title="Forgot your password?">Forgot your password?</a><br /><br />
                <label for="remember">Remember Me: </label>
                <input type="checkbox" name="login[remember]" style="display:inline; margin-left:10px;"/>
                <br /><br />
                <input type="submit" id="login" value="Log-in"/>
            </form>
</div>
            <?php
}else{ 
    echo '<span>You\'re already logged in as ' . $_SESSION['name'] . '! <a href="logout.php">Log Out</a></span>';
}
include './includes/footer.html';
