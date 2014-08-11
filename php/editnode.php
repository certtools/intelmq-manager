<?php

    session_start();
    $node = array();

    foreach ($_GET as $key => $value) {
        $node[$key] = $value;
    }

    $_SESSION["data"]["nodes"][$_GET["id"]] = $node;

    $encoded_data = json_encode($_SESSION["data"]);
    file_put_contents('/tmp/botnet_data', $encoded_data);

?>
