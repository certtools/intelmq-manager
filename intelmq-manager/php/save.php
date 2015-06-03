<?php

    require('config.php');

    $file = $_GET['file'];
    if (array_key_exists($file, $FILES)) {
        $filename = $FILES[$_GET['file']];
    }

    $post_contents = file_get_contents("php://input");

    $data = json_decode($post_contents, true);

    foreach ($data as $key => $obj) {
        if(($file == "startup") && (strpos($key, '__default__') !== false)) { unset($data[$key]); }
    }

/*
    if(preg_match_all($BOT_CONFIGS_REJECT_REGEX, $post_contents, $matches)) {
        die('Config has invalid characters');
    }
*/

    file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));

?>
