<?php
    
    require 'config.php';
    
    // TODO: Find arguments from GET parameters
    $scope = $_GET['scope'];
    
    $arguments = '';
    
    if ($_GET['action'] == 'start' || $_GET['action'] == 'stop' || $_GET['action'] == 'restart' || $_GET['action'] == 'status') {
        $action = $_GET['action'];
    } else {
        die('Invalid action');
    }
    
    if ($scope == 'botnet') {
        $arguments = '--' . $scope . ' ' . $action . ' --type json';
    } else if ($scope == 'bot') {
        $arguments = '--' . $scope . ' ' . $action . ' --id ' . escapeshellcmd($_GET['id']) . ' --type json';
    } else {
        die('Invalid scope');
    }
    
    $command = sprintf($CONTROLLER, $arguments);
    
    error_log('Before command executes. ' . $command);
    
    set_time_limit(10);
    
    $return = shell_exec($command); //TODO: Change to proc_open + stream_get_contents
    
    error_log('After command executes. ' . $command);
    
    echo $return;
    
?>