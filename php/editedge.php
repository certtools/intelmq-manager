<?php

    session_start();
    $edge = array();

    $edge["from"] = $_GET["from"];
    $edge["to"] = $_GET["to"];

    $_SESSION["data"]["edges"][$_GET["id"]] = $edge;

    $encoded_data = json_encode($_SESSION["data"]);
    file_put_contents('/tmp/botnet_data', $encoded_data);

?>
