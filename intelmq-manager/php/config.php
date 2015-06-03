<?php

    $FILES = array(
        'bots' => '/opt/intelmq/bots/BOTS',
        'runtime' => '/opt/intelmq/conf/runtime.conf',
        'startup' => '/opt/intelmq/conf/startup.conf',
        'pipeline' => '/opt/intelmq/conf/pipeline.conf'
    );

    $CONTROLLER = "sudo -u intelmq /opt/intelmq/bin/intelmqctl %s";

    $BOT_CONFIGS_REJECT_REGEX = '/[^[:print:]\n\r\t]/';
    $BOT_ID_REJECT_REGEX = '/[^A-Za-z0-9.-]/';
?>
