**Table of Contents**

1. [Requirements](#requirements)
2. [Installation](#installation)
    1. [Install Dependencies](#install-dependencies)
        1. [Ubuntu 14.04 / Debian 8](#dependencies-ubuntudebian)
        2. [CentOS 7](#dependencies-centos)
    2. [Install](#install)
        1. [Ubuntu 14.04 / Debian 8](#install-ubuntudebian)
        2. [Centos 7](#install-centos)
    3. [Temporary Fix for Python 3.4](#tempfix)
3. [Configuration](#configuration)
    1. [Basic Authentication (optional)](#basic-auth)

<a name="requirements"></a>
# Requirements

The following instructions assume the following requirements:

* IntelMQ is already installed
* IntelMQ and IntelMQ Manager will be installed on same machine
* Operating System: Ubuntu 14.04 LTS or Debian 8 or CentOS 7

<a name="installation"></a>
# Installation

<a name="install-dependencies"></a>
## Install Dependencies

<a name="dependencies-ubuntudebian"></a>
### Ubuntu 14.04 / Debian 8

```bash
apt-get install git apache2 php5 libapache2-mod-php5
```

<a name="dependencies-centos"></a>
### CentOS 7 (TBD)

**TBD**


<a name="install"></a>
## Install

<a name="install-ubuntudebian"></a>
### Ubuntu 14.04 / Debian 8

```bash
sudo su -

git clone https://github.com/certtools/intelmq-manager.git /tmp/intelmq-manager
cp -R /tmp/intelmq-manager/intelmq-manager/* /var/www/html/
chown -R www-data.www-data /var/www/html/

# add the apache user to the intelmq group.
usermod -a -G intelmq www-data
```

Give Apache user permissions to execute commands as intelmq user. Edit the /etc/sudoers file and add the following line:
```
www-data ALL=(intelmq) NOPASSWD: /opt/intelmq/bin/intelmqctl
```

Edit '/var/www/html/php/config.php' and put the following as the $CONTROLLER value:
```
$CONTROLLER = "sudo -u intelmq /opt/intelmq/bin/intelmqctl %s";
```

Restart apache:
```
/etc/init.d/apache2 restart
```

<a name="install-centos"></a>
### CentOS 7 (TBD)

**TBD**

<a name="tempfix"></a>
## Temporary Fix for Python 3.4
```
sed -i 's|#!/usr/bin/env python|#!/usr/bin/env python3.4|g' /opt/intelmq/bin/intelmqctl
sed -i "s|('INTELMQ_PYTHON', 'python')|('INTELMQ_PYTHON', 'python3.4')|g" /opt/intelmq/bin/intelmqctl
```

<a name="configuration"></a>
# Configuration

<a name="basic-auth"></a>
## Basic Authentication (optional)

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
chown -R intelmq.intelmq /opt/intelmq
