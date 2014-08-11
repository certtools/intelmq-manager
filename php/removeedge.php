<?php
    session_start();

    unset($_SESSION["data"]["edges"][$_GET["id"]]);

    $encoded_data = json_encode($_SESSION["data"]);
    file_put_contents('/tmp/botnet_data', $encoded_data);
?>
