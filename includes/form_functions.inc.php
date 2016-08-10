<?php

function createInput($name, $type, $errors = array(), $label, $values = 'POST', $options = array()) {
    global $event;
    $value = false;
    
    if ($values === 'SESSION') {
        if (isset($_SESSION[$name])) $value = htmlspecialchars($_SESSION[$name], ENT_QUOTES, 'UTF-8');
    }else if ($values === 'POST') {
        if (isset($_POST[$name])) $value = htmlspecialchars($_POST[$name], ENT_QUOTES, 'UTF-8');
    }else if ($values === 'GET') {
        if (isset($_GET[$name])) $value = htmlspecialchars($_GET[$name], ENT_QUOTES, 'UTF-8');
    }else if ($values === 'EDIT') {
        if (empty($_POST[$name])) {
            $value = htmlspecialchars((isset($event[$name])?$event[$name]:''), ENT_QUOTES, 'UTF-8');
        }else{
            $value = htmlspecialchars((isset($_POST[$name])?$_POST[$name]:''), ENT_QUOTES, 'UTF-8');
        }
    }else $value = false;
    echo '<div class="formEleDiv'.(($type === 'textarea')?'Text':'').'">';
    
    if ($type === 'text' || $type === 'password') { //for text and password cases
        $ele = '<label for="'.$name.'">'.$label.'</label><input id="' . $name . '" name="'.$name.'" type="'.$type.'" ';
        if ($value) {
            $ele .= 'value="'.$value.'" ';
        }
        if (!empty($options)) { //append options
            foreach ($options as $k=>$v) {
                $ele .= $k . '="'.$v.'" ';
            }
        }
        if (array_key_exists($name, $errors)) { //handle any errors
            $ele .= 'class="error" />';
            $ele .= '<span class="error">'.$errors[$name].'</span>';
        }else $ele .= '/>';
        echo $ele;
        
    }else if ($type === 'date') { //date input
        $ele = '<span><label for="'.$name.'">'.$label.'</label><input id="' . $name . '" name="'.$name.'" type="text" ';
        if ($value) $ele .= 'value="'.$value.'" ';
        
        if (!empty($options)) { //append options
            foreach ($options as $k=>$v) {
                $ele .= $k . '="'.$v.'" ';
            }
        }
        
        if (array_key_exists($name, $errors)) { //handle any errors
            $ele .= 'class="error" />';
            $ele .= '<span class="error">'.$errors[$name].'</span>';
        }else $ele .= '/>';
        
        $ele .= '<span class="calendarInput"></span></span>';
        echo $ele;
        
    }else if ($type === 'textarea') { //text area
        // Display the error first: 
		if (array_key_exists($name, $errors)) echo ' <span class="error">' . $errors[$name] . '</span><br />';
        echo '<span>'.$label.'</span><br />';
		// Start creating the textarea:
		echo '<textarea name="' . $name . '" id="' . $name . '"';

		// Add the error class, if applicable:
		if (array_key_exists($name, $errors)) {
			echo ' class="error">';
		} else {
			echo '>';		
		}

		// Add the value to the textarea:
		if ($value) echo $value;

		// Complete the textarea:
		echo '</textarea>';
        
    }else if ($type === 'select') { //select input
        
        $ele = '<label for="'.$name.'">'.$label.'</label><span class="instrSelectSpan"><select id="'.$name.'" name="'.$name.'" class="instrSelector" ';

        $valueSubmitted = false; //true if value was passed in options array
        if (!empty($options)) { //append options
            foreach ($options as $k=>$v) {
                if ($k === 'value') {
                    $value = $v;
                    $valueSubmitted = true;
                }else
                    $ele .= $k . '="'.$v.'" ';
            }
        }
        $ele .= '>';
        //sticky value
        $ele .= '<option value="none" style="font-style:italic;" '.(($value==='none')?'selected':'').'>Select One:</option>';
        
        $instruments = array(
            'Bass', 'Trumpet', 'Piano', 'Saxophone', 'Drums', 'Trombone', 'Guitar', 'Vocal'
        );
        sort($instruments);
        
        foreach ($instruments as $k=>$v) {
            $ele .= '<option value="'.$v.'" ';
            if (isset($value) && ucwords($value) === $v) {
                $ele .= 'selected'; //sticky selection
                $value = false;
            }
            $ele .= '>'.$v.'</option>';
        }
        //'other' option
        $ele .= '<option value="other" '. (($value==='other')?'selected':'') .'>Other...</option></select>';
        
        //show other input if value or error
        if ($value === 'other' && !$valueSubmitted) {
            $ele .= '<input type="text" id="instrSelOther" name="instrSelOther" value="'. (isset($_POST['instrSelOther'])?$_POST['instrSelOther']:$value) .'" ';
            if (array_key_exists($name, $errors)) {
                $ele .= 'class="error">';
            }else $ele .= '>';
        }
        if (array_key_exists($name, $errors)) {
            $ele .= '</span>';
            $ele .= '<span class="error">'. $errors[$name] . '</span>';
        }
        echo $ele;
    }else if ($type === 'captcha') {

        require 'cap_img.php';

        $ele = '<label for="'.$name.'">'.$label.'</label><input id="' . $name . '" name="'.$name.'" type="'.$type.'" ';
        if ($value) {
            $ele .= 'value="'.$value.'" ';
        }
        if (!empty($options)) { //append options
            foreach ($options as $k=>$v) {
                $ele .= $k . '="'.$v.'" ';
            }
        }
        if (array_key_exists($name, $errors)) { //handle any errors
            $ele .= 'class="error" />';
        }else $ele .= '/>';

        // chars to be used in code
        $chars = '23456789abcdefghkmnopqrstuvwxyz';
        $code = '';
        // generate the code
        for ($i=0; $i<4; $i++) {
            $code .= $chars[rand(0, strlen($chars) - 1)];
        }
        // get the image url
        list($imgUrl, $path) = makeImage($code);
        $ele .= "<img src='http://$imgUrl'/>";

        if (array_key_exists($name, $errors)) { //handle any errors
            $ele .= '<span class="error">'.$errors[$name].'</span>';
        }

        // make hidden field with hashed value
        $ele .= '<input type="hidden" name="cap" value="' . sha1($code) . '"/>';
        // hidden field with img file path.
        $ele .= '<input type="hidden" name="imgpath" value="' . $path . '"/>';

        echo $ele;
    }
    echo '</div>';
}