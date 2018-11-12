<?php

require 'php/config.php';

// Controller
// Get a whitelisted page
$page = filter_input(INPUT_GET, "page", FILTER_SANITIZE_STRING);
if (!in_array($page, ["about", "blank", "check", "configs", "homepage", "management", "monitor"])) {
    $page = "homepage";
}

$libraries = [
    "js/static.js",
    "js/sb-admin-2.js",
    "plugins/dataTables/jquery.dataTables.js", // XX this doesnt have to be on every page
    "plugins/dataTables/dataTables.bootstrap.js" // XX this doesnt have to be on every page
];

switch ($page) {
    case "about":
        $libraries[] = "js/about.js";
        break;
    case "management":
        $libraries[] = "js/runtime.js";
        $libraries[] = "js/management.js";
        break;
    case "monitor":
        $libraries = array_merge($libraries, [
            "js/runtime.js",
            "js/pipeline.js",
            "js/defaults.js",
            "js/monitor.js"]);
        break;
    case "configs":
        $libraries = array_merge($libraries, ["plugins/vis.js/vis.js",
            "js/runtime.js",
            "js/pipeline.js",
            "js/positions.js",
            "js/defaults.js",
            "js/network-configuration.js",
            "js/configs.js"]);
        break;
    case "check":
        $libraries[] = "js/check.js";
        break;
}

include("./template.php");
