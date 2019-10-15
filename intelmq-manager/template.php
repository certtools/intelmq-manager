<!DOCTYPE html>
<html lang="en">

    <head>

        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="">
        <meta name="author" content="">

        <title>IntelMQ Manager</title>

        <!-- Bootstrap Core CSS -->
        <link href="plugins/bootstrap/bootstrap.min.css" rel="stylesheet">

        <!-- MetisMenu CSS -->
        <link href="plugins/metisMenu/metisMenu.min.css" rel="stylesheet">

        <!-- Vis.JS Plugin JavaScript (configs.html)-->
        <link href="plugins/vis.js/vis.css" rel="stylesheet" type="text/css">

        <!-- DataTables CSS (other files than configs.html) -->
        <link href="plugins/dataTables/dataTables.bootstrap.css" rel="stylesheet">

        <!-- Custom Fonts -->
        <link href="plugins/font-awesome-4.1.0/css/font-awesome.min.css" rel="stylesheet" type="text/css">

        <!-- Custom CSS -->
        <link href="css/sb-admin-2.css" rel="stylesheet">
        <link href="css/style.css" rel="stylesheet">

        <link rel="icon" type="image/png" href="images/logo2.png">

        <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
            <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
        <![endif]-->

    </head>

    <body>
        <div id="wrapper">

            <!-- Navigation -->
            <nav class="navbar navbar-default navbar-static-top" role="navigation" style="margin-bottom: 0">
                <div class="navbar-header">
                    <a class="navbar-brand" href="index.php"><img height="24px"  style="margin-right:10px" src="./images/logo2.png"><img height="20px" src="./images/logo_no_margin_6.png"/></a>
                </div>
                <!-- /.navbar-header -->

                <ul class="nav navbar-top-links navbar-left">
                    <li <?= (($_GET["page"] === "configs") ? "class='active'" : "") ?>>
                        <a href="?page=configs">
                            <span class="top-menu-text"><img src="./images/config.png" width="24px" height="24px">&nbsp;Configuration</span>
                        </a>
                    </li>
                    <li <?= (($_GET["page"] === "management") ? "class='active'" : "") ?>>
                        <a href="?page=management">
                            <span class="top-menu-text"><img src="./images/botnet.png" width="24px" height="24px">&nbsp;Management</span>
                        </a>
                    </li>
                    <li <?= (($_GET["page"] === "monitor") ? "class='active'" : "") ?>>
                        <a href="?page=monitor">
                            <span class="top-menu-text"><img src="./images/monitor.png" width="24px" height="24px">&nbsp;Monitor</span>
                        </a>
                    </li>
                    <li <?= (($_GET["page"] === "check") ? "class='active'" : "") ?>>
                        <a href="?page=check">
                            <span class="top-menu-text"><img src="./images/check.png" width="24px" height="24px">&nbsp;Check</span>
                        </a>
                    </li>
                    <li <?= (($_GET["page"] === "about") ? "class='active'" : "") ?>>
                        <a href="?page=about">
                            <span class="top-menu-text"><img src="./images/about.png" width="24px" height="24px">&nbsp;About</span>
                        </a>
                    </li>
                </ul>
                <!-- /.navbar-top-links -->
                <div title="Click to expand, then escape to minimize again." id='log-window'>
                    <i role="close" class="fa fa-times"></i>
                    <div class="contents"></div>
                </div>
            </nav>
            <?php include("templates/$page.html"); ?>

            <!-- jQuery Version 1.11.0 -->
            <script src="plugins/jquery-1.11.0.js"></script>

            <!-- Bootstrap Core JavaScript -->
            <script src="plugins/bootstrap/bootstrap.min.js"></script>

            <!-- Metis Menu Plugin JavaScript -->
            <script src="plugins/metisMenu/metisMenu.js"></script>

            <!-- Custom Application JavaScript -->
            <?php
            if($ALLOWED_PATH):
                echo "<script>ALLOWED_PATH=\"$ALLOWED_PATH\";</script>";
            endif;
            foreach ($libraries as $lib):
                echo "<script src='$lib'></script>";
            endforeach;
            echo "<script>CONTROLLER_CMD=\"$CONTROLLER_CMD\";</script>";
            ?>

        </div>
        <div id="common-templates">
            <div class="control-buttons" data-bot-id="" data-botnet="">
                <button type="submit" class="btn btn-default" title="Start" data-status-definition="starting" data-url="start"><span class="glyphicon glyphicon-play"></span></button>
                <button type="submit" class="btn btn-default" title="Stop" data-status-definition="stopping" data-url="stop"><span class="glyphicon glyphicon-stop"></span></button>
                <button type="submit" class="btn btn-default" title="Reload" data-status-definition="reloading" data-url="reload"><span class="glyphicon glyphicon-repeat"></span></button>
                <button type="submit" class="btn btn-default" title="Restart" data-status-definition="restarting" data-url="restart"><span class="glyphicon glyphicon-refresh"></span></button>
                <button type="submit" class="btn btn-default" title="Status" data-url="status"><span class="glyphicon glyphicon-arrow-down"></span></button>
            </div>
        </div>
    </body>
</html>
