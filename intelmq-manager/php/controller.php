<?php
    
    require 'config.php';
    
    $scope = $_GET['scope'];
    $id = $_GET['id'];
    
    $id_regex = '/[0-9a-zA-Z]+/';
    $lines_regex = '/[0-9]+/';
    
    $arguments = '';
    
    if ($_GET['action'] == 'start' || $_GET['action'] == 'stop' || $_GET['action'] == 'restart' || $_GET['action'] == 'status') {
        $action = $_GET['action'];
    } else {
        $action = "";
    }
    
    if ($scope == 'botnet') {
        $arguments = '--botnet ' . $action . ' --type json';
    } else if ($scope == 'bot') {
        if (!array_key_exists('id', $_GET)) {
            die("Missing 'id' argument on request.");
        } else if (!preg_match($id_regex, $id)) {
            $id = '';
        }
        
        $arguments = '--bot ' . $action . ' --id ' . escapeshellcmd($id) . ' --type json';
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
        
        if ($_GET['level'] == 'DEBUG' || $_GET['level'] == 'INFO' || $_GET['level'] == 'ERROR' || $_GET['level'] == 'CRITICAL') {
            $level = $_GET['level'];
        } else {
            $level = 'DEBUG';
        }
        
        $arguments = '--log ' . escapeshellcmd($level) . ':' . escapeshellcmd((int)($lines)) . ' ' . ' --id ' . escapeshellcmd($id) . ' --type json';
    } else if ($scope == 'queues') {
        $arguments = '--list queues --type json';
    } else {
        die('Invalid scope');
    }
    
    $command = sprintf($CONTROLLER, $arguments);
    
    error_log('Before command executes. ' . $command);
    
    set_time_limit(10);
    
    $return = shell_exec($command);
    
    error_log('After command executes. ' . $command);
    
    echo $return;
    
?>