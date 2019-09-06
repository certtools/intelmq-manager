<?php
require 'config.php';
require 'util.php';

/**
 * Build an intelmqctl command
 */
$scope = '';
$id = '';
$json_wanted = true;
$cache = false;

if (array_key_exists('scope', $_GET)) {
    $scope = $_GET['scope'];
}

if (array_key_exists('id', $_GET)) {
    $id = $_GET['id'];
}

$id_regex = '/^[0-9a-zA-Z-]+$/';
$lines_regex = '/^[0-9]+$/';

$arguments = '';

if (array_key_exists('action', $_GET) && ($_GET['action'] == 'start' ||
        $_GET['action'] == 'stop' ||
        $_GET['action'] == 'restart' ||
        $_GET['action'] == 'reload' ||
        $_GET['action'] == 'status')) {
    $action = $_GET['action'];
} else {
    $action = "";
}

if ($scope == 'botnet') {
    // only listed values of flag group allowed
    $g = filter_input(INPUT_GET, "group");
    if(in_array($g, ["collectors", "parsers", "experts", "outputs"])) {
        $g = " --group $g";
    } else {// "botnet" or non-listed value
        $g = null;
    }
    $arguments = $action . $g;
} else if ($scope == 'bot') {
    if (!array_key_exists('id', $_GET)) {
        die("Missing 'id' argument on request.");
    } else if (!preg_match($id_regex, $id)) {
        die('Invalid id');
    }

    $arguments = $action . ' ' . escapeshellcmd($id);
} else if ($scope == 'log') {
    if (!array_key_exists('lines', $_GET)) {
        die("Missing 'lines' argument on request." || !preg_match($lines_regex, $_GET['lines']));
    } else if (!array_key_exists('level', $_GET)) {
        die("Missing 'level' argument on request.");
    } else if (!array_key_exists('id', $_GET)) {
        die("Missing 'id' argument on request.");
    } else if (!preg_match($id_regex, $id)) {
        die('Invalid id');
    }

    $lines = $_GET['lines'];

    if ($_GET['level'] == 'DEBUG' ||
            $_GET['level'] == 'INFO' ||
            $_GET['level'] == 'WARNING' ||
            $_GET['level'] == 'ERROR' ||
            $_GET['level'] == 'CRITICAL') {
        $level = $_GET['level'];
    } else {
        $level = 'DEBUG';
    }

    $cache = true;
    $arguments = 'log ' . escapeshellcmd($id) . ' ' . escapeshellcmd((int) ($lines)) . ' ' . escapeshellcmd($level);
} else if ($scope == 'queues') {
    $cache = true;
    $arguments = 'list queues';
} else if ($scope == 'queues-and-status') {
    $cache = true;
    $arguments = 'list queues-and-status';
} else if ($scope == 'version') {
    $arguments = '--version';
} else if ($scope == 'check') {
    $arguments = 'check';
} else if ($scope == 'clear') {
    if (!array_key_exists('id', $_GET)) {
        die("Missing 'id' argument on request.");
    } else if (!preg_match($id_regex, $id)) {
        $id = '';
    }
    $arguments = 'clear ' . escapeshellcmd($id);
} else if ($scope == 'run') {
    $json_wanted = false;

    $arguments = "run " . escapeshellarg(filter_input(INPUT_GET, "bot")) . " ";
    switch (filter_input(INPUT_GET, "cmd")) {
        case "get":
            $arguments .= "message get";
            break;
        case "pop":
            $arguments .= "message pop";
            break;
        case "send":
            $arguments .= "message send '" . escapeshellarg(filter_input(INPUT_POST, "msg")) . "'";
            break;
        case "process":
            $arguments .= "process";
            if(filter_input(INPUT_GET, "show", FILTER_VALIDATE_BOOLEAN)) {
                $arguments .= " --show-sent";
            }
            if(filter_input(INPUT_GET, "dry", FILTER_VALIDATE_BOOLEAN)) {
                $arguments .= " --dry";
            }
            if(filter_input(INPUT_POST, "msg")) {
                $arguments .= " --msg " . escapeshellarg(filter_input(INPUT_POST, "msg")) . "";
            }
            break;
        default:
            break;
    }
} else {
    die('Invalid scope');
}

/**
 * Final command here
 */
if($cache) {
    $seconds_to_cache = 3;
    $ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";
    header("Expires: $ts");
    header("Pragma: cache");
    header("Cache-Control: max-age=$seconds_to_cache");
}

if($json_wanted) {
    $c = $CONTROLLER_JSON;
    header('Content-Type: application/json');
} else {
    $c = $CONTROLLER;
}
$command = sprintf($c, $arguments);
//echo $command; exit;

// appending magic string that'll kill the command if run for too long
$sec = 20;
set_time_limit($sec + 1); // we prefer to timeout in the command ($sec), if that does not work, kill it by PHP timeout

$cmd = $command . " & ii=0 && while [ \"2\" -eq \"`ps -p $! | wc -l`\" ];do ii=$((ii+1)); if [ \$ii -gt ".($sec)."0 ]; then echo '***Intelmqctl timeout!***';kill $!; break;fi; sleep 0.1; done";
$proc = proc_open($cmd,[
    1 => ['pipe','w'],
    2 => ['pipe','w'],
],$pipes);
$stdout = stream_get_contents($pipes[1]);
fclose($pipes[1]);
$stderr = stream_get_contents($pipes[2]);
fclose($pipes[2]);
$status = proc_close($proc);

//$return = shell_exec($command . " 2>&1 & ii=0 && while [ \"2\" -eq \"`ps -p $! | wc -l`\" ];do ii=$((ii+1)); if [ \$ii -gt ".($sec)."0 ]; then echo 'Intelmqctl timeout!';kill $!; break;fi; sleep 0.1; done");


if (!$stdout or $stderr or $status!==0) {
    http_response_code(500);
    if(!$stdout and !$stderr) {
        $stderr = 'Failed to execute intelmqctl.';
    }

    // tips for common errors
    $tip = "";
    if(strpos($stderr, "sudo: no tty present and no askpass program specified") !== FALSE) {
        $tip = "Is sudoers file or the environmental variable `INTELMQ_MANGER_CONTROLLER_CMD` <a href='https://github.com/certtools/intelmq-manager/blob/master/docs/INSTALL.md#allow-access-to-intelmqctl'>set up correctly</a>?";
    }
    else if(strpos($stderr, "Permission denied: '/opt/intelmq") !== FALSE) {
        $tip = "Has the user accessing intelmq folder the read/write permissions? This might be user intelmq or www-data, depending on your configuration, ex: <code>sudo chown intelmq.intelmq /opt/intelmq -R && sudo chmod u+rw /opt/intelmq -R</code>";
    }

    echo json_encode(array(
            "command" => $CONTROLLER_REPLICABLE . $command,
            "message" => $stderr,
            "tip" => $tip
        ));
} else {
    if ($scope != 'version') {
        echo $stdout;
    } else {
        echo json_encode(array(
            "intelmq" => rtrim($stdout),
            "intelmq-manager" => $VERSION,
        ));
    }
}
