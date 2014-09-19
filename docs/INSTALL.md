# Requirements

This document assumes you install on a Debian or Ubuntu system. 

It also assumes you have already downloaded and installed IntelMQ, if you want to know how to install it you can read https://github.com/certtools/intelmq/blob/master/docs/UserGuide.md . For the Management and Monitor to work you need to have the Manager in the same machine as IntelMQ. If you want to work only with the Configuration part of the Manager you can do it, but you are going to have to create a /etc/intelmq folder and copy the BOTS file from IntelMQ to it.

# Install

Start by installing Apache httpd and PHP

```
    apt-get install apache2 php5 libapache2-mod-php5
```

After Apache and PHP are installed get the latest version of IntelMQ Manager and copy it's contents to your chosen directory. Example:

```
    apt-get install git
    git clone https://<your-github-account>@github.com/certtools/intelmq-manager.git
    cd intelmq-manager/intelmq-manager
    cp -r * /var/www/html/
```

Configure Apache accordingly and make sure to change php/config.php to put the correct command and the correct paths for configuration files. If intelmqctl is installed at /usr/local/bin/intelmqctl you change php/config.php like this:

```
    $CONTROLLER = "/usr/local/bin/intelmqctl %s";
```

Add the apache user to the intelmq group.

```
    usermod -a -G intelmq www-data
```


### Basic Authentication

If you want to enable basic authentication on IntelMQ Manager edit the httpd.conf and insert 

```
    AuthType basic 
    AuthName <realm name>

    AuthBasicProvider file
    AuthUserFile <password file path>
```

Where &lt;realm name&gt; is the string that identifies the realm that should be used and &lt;password file path&gt; is the path to the file created with the htpasswd command.

To create a new file do:

```
    htpasswd -c <password file path> <username>
```

To edit an existing one do:

```
    htpasswd <password file path> <username>
```


### Reminder

When using IntelMQ Manager do not forget that in order for it to change the configuration files it needs read and write access to the files in the /etc/intelmq folder (or equivalent configuration folder in your setup).

Also, by default IntelMQ Manager launchs the bots using the apache account, which means that the apache account will need to have read/write access to the following folders:
/var/log/intelmq/
/var/run/intelmq/
/var/lib/intelmq/

In order to centralize the scripting efforts all the work is done by the 'intelmqctl' script and the web manager only calls the script with the appropriate parameters. For that reason the apache user will have to be able to execute the 'intelmqctl' script.
