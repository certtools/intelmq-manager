# Requirements

The following instructions assume:
* Debian or Ubuntu Operatin System
* [IntelMQ](https://github.com/certtools/intelmq) is already installed
* [IntelMQ](https://github.com/certtools/intelmq) and [IntelMQ Manager](https://github.com/certtools/intelmq-manager) will be installed on same machine


# Installation

### Install Dependencies

```
sudo apt-get install git apache2 php5 libapache2-mod-php5
```

### Install

```
sudo su -

git clone https://github.com/certtools/intelmq-manager.git /tmp/intelmq-manager
cp -R /tmp/intelmq-manager/intelmq-manager/* /var/www/
chown -R www-data.www-data /var/www/
```

### Configure

Add the Apache user to the intelmq group.

```
usermod -a -G intelmq www-data
```

Give Apache user permissions to execute commands as intelmq user. Edit the /etc/sudoers file and add the following line:
```
www-data ALL=(intelmq) NOPASSWD: /opt/intelmq/bin/intelmqctl
```

Edit '/var/www/php/config.php' and put the following as the $CONTROLLER value:
```
$CONTROLLER = "sudo -u intelmq /opt/intelmq/bin/intelmqctl %s";
```

Edit '/etc/apache2/sites-available/000-default.conf' and change the DocumentRoot to
```
 DocumentRoot /var/www/
```

Restart apache:
```
/etc/init.d/apache2 restart
```


### Basic Authentication (optional)

If you want to enable file-based basic authentication, first create the authentication file by doing: 

```
htpasswd -c <password file path> <username>
```

To edit an existing one do:

```
htpasswd <password file path> <username>
```

on IntelMQ Manager edit the httpd.conf and insert 

```
AuthType basic 
AuthName "IntelmMQ Manager"

AuthBasicProvider file
AuthUserFile <password file path>
```

After this is done you'll have to put the user/pass combination you have created with htpasswd to access the web pages of IntelMQ Manager. To use other authentication methods visit: http://httpd.apache.org/docs/2.2/howto/auth.html


