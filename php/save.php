<?php

    require('config.php');
    
    if (array_key_exists($_GET['file'], $FILES)) {
        $filename = $FILES[$_GET['file']];
    }
    
    file_put_contents($filename, file_get_contents("php://input"));
?>