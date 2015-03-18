<?php

    $FILES = array(
        'bots' => '/opt/intelmq/etc/BOTS',
        'runtime' => '/opt/intelmq/etc/runtime.conf',
        'startup' => '/opt/intelmq/etc/startup.conf',
        'pipeline' => '/opt/intelmq/etc/pipeline.conf'
    );

    $CONTROLLER = "sudo -u intelmq /opt/intelmq/bin/intelmqctl %s";

    $BOT_CONFIGS_REJECT_REGEX = '/[^[:print:]\n\r\t]/';
    $BOT_ID_REJECT_REGEX = '/[^A-Za-z0-9.-]/';
?>
