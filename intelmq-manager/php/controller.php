<?php

    require 'config.php';

    $scope = '';
    $id = '';

    if (array_key_exists('scope', $_GET)) {
        $scope = $_GET['scope'];
    }

    if (array_key_exists('id', $_GET)) {
        $id = $_GET['id'];
    }

    $id_regex = '/[0-9a-zA-Z]+/';
    $lines_regex = '/[0-9]+/';

    $arguments = '';

    if (array_key_exists('action', $_GET) && ($_GET['action'] == 'start' ||
                                               $_GET['action'] == 'stop' ||
                                               $_GET['action'] == 'restart' ||
                                               $_GET['action'] == 'status')) {
        $action = $_GET['action'];
    } else {
        $action = "";
    }

    if ($scope == 'botnet') {
        $arguments = $action;
    } else if ($scope == 'bot') {
        if (!array_key_exists('id', $_GET)) {
            die("Missing 'id' argument on request.");
        } else if (!preg_match($id_regex, $id)) {
            $id = '';
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
            $id = '';
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

        $arguments = 'log ' . escapeshellcmd($id) . ' ' . escapeshellcmd((int)($lines)) . ' ' . escapeshellcmd($level);
    } else if ($scope == 'queues') {
        $arguments = 'list queues';
    } else {
        die('Invalid scope');
    }

    $command = sprintf($CONTROLLER, $arguments);

    set_time_limit(10);

    $return = shell_exec($command);

    echo $return;

?>
