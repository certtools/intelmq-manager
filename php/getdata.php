<?php

    session_start();

    $contents = file_get_contents('/tmp/botnet_data');

    $decoded = json_decode($contents, true);
    $_SESSION["data"] = array();
    $_SESSION["data"]["nodes"] = $decoded["nodes"];
    $_SESSION["data"]["edges"] = $decoded["edges"];

    echo $contents;

?>
