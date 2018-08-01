<?php

    require('config.php');

    if (array_key_exists($_GET['file'], $FILES)) {
        $filename = $FILES[$_GET['file']];
    } else {
        die("Invalid file.");
    }
    if ($_GET['file'] == "bots") {
        die("You are not allowed to write the bots file.");
    }

    $post_contents = file_get_contents("php://input");
    if ($post_contents === '') {
        die('Error: Received an empty string, which is invalid. Check your webserver log for error messages.');
    }

    $decoded_config = json_decode($post_contents);
    if (gettype($decoded_config) != 'object') {
        die('File must consist of an array.');
    }

    if($_GET['file'] != 'defaults' && $_GET['file'] != 'positions') {
        foreach ($decoded_config as $key => $value) {
            if(preg_match($BOT_ID_REJECT_REGEX, $key) && (strcmp($key, "__default__") !== 0)) {
                die('Invalid bot ID');
            }
        }
    }

    if(preg_match_all($BOT_CONFIGS_REJECT_REGEX, $post_contents, $matches)) {
        die('Config has invalid characters');
    }

    if ($post_contents != file_get_contents($filename)) {
        if(file_put_contents($filename, $post_contents) != strlen($post_contents)) {
            die('Could not write file.');
        }
    }
    echo('success');
?>
