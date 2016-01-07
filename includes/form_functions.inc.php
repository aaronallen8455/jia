<?php

function createInput($name, $type, $errors = array(), $label, $values = 'POST', $options = array()) {
    
    $value = false;
    
    if ($values === 'SESSION') {
        if (isset($_SESSION[$name])) $value = htmlspecialchars($_SESSION[$name], ENT_QUOTES, 'UTF-8');
    }else{
        if (isset($_POST[$name])) $value = htmlspecialchars($_POST[$name], ENT_QUOTES, 'UTF-8');
    }
    
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
		echo '<textarea name="' . $name . '" id="' . $name . '" rows="5" cols="75"';

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
        
        $ele = '<label for="'.$name.'">'.$label.'</label><span class="instrSelectSpan"><select id="'.$name.'" name="'.$name.'" ';
        //sticky value
        if ($value) {
            $ele .= 'value="'.$value.'">';
        }else $ele .= '>';
        
        $instruments = array(
            'Bass', 'Trumpet', 'Piano', 'Saxophone', 'Drums', 'Trombone', 'Guitar', 'Vocal'
        );
        sort($instruments);
        
        foreach ($instruments as $k=>$v) {
            $ele .= '<option value="'.($k+1).'">'.$v.'</option>';
        }
        //'other' option
        $ele .= '<option value="other">Other...</option></select>';
        
        //show other input if value or error
        if ($value === 'other') {
            $ele .= '<input type="text" id="instrSelOther" name="instrSelOther" value="'. $_POST['instrSelOther']?$_POST['instrSelOther']:$_SESSION['instrSelOther'] .'">';
            if (array_key_exists($name, $errors)) {
                $ele .= 'class="error"><span class="error">'. $errors[$name] . '</span>';
            }else $ele .= '>';
        }
    }
    
}