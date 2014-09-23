# Requirements

The following instructions assume:
* Debian or Ubuntu Operatin System
* [IntelMQ](https://github.com/certtools/intelmq) is already installed
* [IntelMQ](https://github.com/certtools/intelmq) and [IntelMQ Manager](https://github.com/certtools/intelmq-manager) will be installed on same machine


# Installation

### Install Dependencies

```
apt-get install git
apt-get install apache2 php5 libapache2-mod-php5
```

### Install

```
git clone https://<your-github-account>@github.com/certtools/intelmq-manager.git /tmp/intelmq-manager
cp -R /tmp/intelmq-manager/intelmq-manager/* /var/www/
chown -R www-data.www-data /var/www/html
```

### Configure

Add the Apache user to the intelmq group.

```
usermod -a -G intelmq www-data
```

Give Apache user permissions to execute commands as intelmq user. Edit the /etc/sudoers file and add the following line:
```
www-data ALL=(intelmq) NOPASSWD: /usr/local/bin/intelmqctl
```

Edit '/var/www/php/config.php' and put the following as the $CONTROLLER value:
```
$CONTROLLER = "sudo -u intelmq /usr/local/bin/intelmqctl %s";
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
