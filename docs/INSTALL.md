# Requirements

This document assumes you install on a Debian or Ubuntu system. 

It also assumes you have already downloaded and installed IntelMQ. For the Management and Monitor to work you need to have the Manager in the same machine as IntelMQ. If you want to work only with the Configuration part of the Manager you can do it, but you are going to have to create a /etc/intelmq folder and copy the BOTS file from IntelMQ to it.

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

Also, don't forget to give read/write access to the following folders:

```
/var/log/intelmq/
/var/run/intelmq/
/var/lib/intelmq/
```

### Basic Authentication

If you want to enable basic authentication on IntelMQ Manager edit the httpd.conf and insert 

```
    AuthType basic 
    AuthName <realm name>

    AuthBasicProvider file
    AuthUserFile <password file path>
```

Where <realm name> is the string that identifies the realm that should be used and <password file path> is the path to the file created with the htpasswd command.

To create a new file do:

```
    htpasswd -c <password file path> <username>
```

To edit an existing one do:

```
    htpasswd <password file path> <username>
```

## lighttpd

First make sure that you have the latest version of  intelmq-control-platform.
Then install lighttpd:

```
apt-get install lighttpd
```

### PHP

Next, install php in fast-cgi mode:
(taken from the manual at: http://www.betamaster.us/blog/?p=911)

```
apt-get install php5-cgi
```

Enable php5 fastcgi:

```
/usr/sbin/lighty-enable-mod fastcgi
/usr/sbin/lighty-enable-mod fastcgi-php
service lighttpd restart
```

On Debian jessie, the config file for fastcgi on lighttpd looks like this:

```
cat /etc/lighttpd/conf-enabled/15-fastcgi-php.conf
# -*- depends: fastcgi -*-
# /usr/share/doc/lighttpd/fastcgi.txt.gz
# http://redmine.lighttpd.net/projects/lighttpd/wiki/Docs:ConfigurationOptions#mod_fastcgi-fastcgi

## Start an FastCGI server for php (needs the php5-cgi package)
fastcgi.server += ( ".php" =>
	((
		"bin-path" => "/usr/bin/php-cgi",
		#"bin-path" => "/usr/sbin/php5-fpm",
		"socket" => "/var/run/lighttpd/php.socket",
		#"socket" => "/run/php5-fpm.sock",
		"max-procs" => 1,
		"bin-environment" => (
			"PHP_FCGI_CHILDREN" => "4",
			"PHP_FCGI_MAX_REQUESTS" => "10000"
		),
		"bin-copy-environment" => (
			"PATH", "SHELL", "USER"
		),
		"broken-scriptfilename" => "enable"
	))
)
```

### basic authentication


### Reminder

When using IntelMQ Manager do not forget that in order for it to change the configuration files it needs read and write access to the files in the /etc/intelmq folder (or equivalent configuration folder in your setup).

Also, by default IntelMQ Manager launchs the bots using the apache account, which means that the apache account will need to have read/write access to the following folders:
/var/log/intelmq/
/var/run/intelmq/
/var/lib/intelmq/

In order to centralize the scripting efforts all the work is done by the 'intelmqctl' script and the web manager only calls the script with the appropriate parameters. For that reason the apache user will have to be able to execute the 'intelmqctl' script.
