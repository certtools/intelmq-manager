<?php
/**
 *
 * XX Maybe this file want be used if my magic command (controller:30) will work smoothly.
 * It's not used right now.
 *
 * Execute a command and kill it if the timeout limit fired to prevent long php execution
 *
 * @see http://stackoverflow.com/questions/2603912/php-set-timeout-for-script-with-system-call-set-time-limit-not-working
 *
 * @param string $cmd Command to exec (you should use 2>&1 at the end to pipe all output)
 * @param integer $timeout
 * @return string Returns command output
 *
 *
 * Edvard Rejthar, IntelMQ developer: it was the only function that was able to correctly timeout an eternal command;
 * many others let my nginx stuck forever. Ubuntu 17.10, let's hope it'll work for youtoo.
 */
function ExecWaitTimeout($cmd, $timeout = 5) {

    $descriptorspec = array(
        0 => array("pipe", "r"),
        1 => array("pipe", "w"),
        2 => array("pipe", "w")
    );
    $pipes = array();

    $timeout += time();
    $process = proc_open($cmd, $descriptorspec, $pipes);
    if (!is_resource($process)) {
        throw new Exception("proc_open failed on: " . $cmd);
    }

    $output = '';


    do {
        $timeleft = $timeout - time();
        $read = array($pipes[1]);
        $write = NULL;
        $exeptions = NULL;
        stream_select($read, $write, $exeptions, $timeleft, NULL);

        if (!empty($read)) {
            $output .= fread($pipes[1], 8192);
        }
    } while (!feof($pipes[1]) && $timeleft > 0);

    if ($timeleft <= 0) {
        proc_terminate($process);
        return $output;
        //throw new Exception("command timeout on: " . $cmd . " $output");
    } else {
        return $output;
    }
}