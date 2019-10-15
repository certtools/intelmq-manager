<?php

require('config.php');
if (array_key_exists($_GET['file'], $FILES)) {
    // standard whitelisted config file
    header('Content-Type: application/json');
    echo file_get_contents($FILES[$_GET['file']]);
    return;
}
// random custom bot config file
$path = realpath($_GET["file"]); // sanitize the path
if (strpos($path, $ALLOWED_PATH) !== 0 or ! $path) {
    header('Content-Type: application/json');
    echo '["Unknown resource"]';
    return;
}

if($_GET["fetch"]) {
    echo file_get_contents($path);
    return;
}

$json = ["files" => []];

if (is_dir($path)) {
    $files = glob($path . "/*");
    $json["directory"] = $path;
} else {
    $files = [$path];
}

foreach ($files as $f) {
    $s = filesize($f);
    if ($s < $GLOBALS["FILESIZE_THRESHOLD"]) {
        $o = ["contents" => file_get_contents($f)];
    } else {
        $o = ["size" => $s, "path" => realpath($f)];
    }

    $json["files"][basename($f)] = $o;
}

header('Content-Type: application/json');
echo json_encode($json);