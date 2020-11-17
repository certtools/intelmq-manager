# Requirements

The following instructions assume the following requirements:

* IntelMQ is already installed
* IntelMQ and IntelMQ Manager will be installed on same machine
* a supported operating system

Supported and recommended operating systems are:
* Debian 9, 10
* Fedora 30, 31, 32
* OpenSUSE Leap 15.1, 15.2
* Ubuntu: 16.04, 18.04, 20.04

Partly supported are:
* CentOS 7
* RHEL 7
See [Notes on CentOS / RHEL](#notes-on-centos--rhel)

## Install dependencies

Either using OS packages, e.g. for Debian, Ubuntu:

```
apt-get install python3-hug python3-mako sudo
```

For CentOS / RHEL 
#TODO

For Fedora
#TODO

For OpenSUSE
#TODO

For the python3 packages pip can be used alternatively:

```
python3 -m pip install hug mako
```

(You will need a correctly configured `sudo` to serve this web app from
a web server running under a different user id than your intelmq userid.)

# Installation

## Native packages

This is only recommended if you also installed intelmq itself with packages.
As you already have the repository configured, you can install the package called `intelmq-manager` using your operating system's package manager.
Complete install instructions for your operating system can be found here:
https://software.opensuse.org/download.html?project=home:sebix:intelmq&package=intelmq-manager

Currently, these operating systems are supported by the packages:
* CentOS 7, install `epel-release` first
* RHEL 7, install `epel-release` first
* Debian 9, 10
* Fedora 30, 31, 32
* openSUSE Leap 15.1, 15.2
* openSUSE Tumbleweed
* Ubuntu 16.04, 18.04, 19.10, 20.04


## Manually

Clone the repository using git and copy the files in the subfolder `intelmq-manager` to the webserver directory (can also be `/srv/www/htdocs/` depending on the used system):
```bash
git clone -b master https://github.com/certtools/intelmq-manager.git /tmp/intelmq-manager
```
#TODO: setup up hug with or without webserver

`intelma-manager` tries to remember the positions of the bots in the network. For that to work, it stores them in a file `positions.conf`. You can set the path to this file
using a configuration file- the default is to use the `manager/positions.conf` file in the `intelmq` configuration directory.

Add the user the intelmq-manager api runs as to the intelmq group and give write permissions for the configuration files:
#TODO: add functionality to create file if it does not exist
```bash
mkdir /opt/intelmq/etc/manager/
touch /opt/intelmq/etc/manager/positions.conf
chgrp www-data /opt/intelmq/etc/*.conf /opt/intelmq/etc/manager/positions.conf
chmod g+w /opt/intelmq/etc/*.conf /opt/intelmq/etc/manager/positions.conf
```

### Allow access to intelmqctl
Give the user the intelmq-manage api runs as permissions to execute intelmqctl as intelmq user. Edit the `/etc/sudoers` file and add the adapted following line:
```javascript
intelmq-manager ALL=(intelmq) NOPASSWD: /usr/local/bin/intelmqctl
```

### Notes on CentOS / RHEL

The manager does currently not work with selinux enabled, you need to deactivate it.
Also, stopping bots does currently not work, see also https://github.com/certtools/intelmq-manager/issues/103

If you can help to fix these issues, please join us!

For RHEL, the packages of CentOS may work better than those for RHEL as there are issues building the packages for RHEL. Help on RHEL is appreciated.

# Security considerations

Never ever run intelmq-manager on a public webserver without SSL and proper authentication!

Never ever allow unencrypted, unauthenticated access to intelmq-manager!.

# Configuration

#TODO: configuration file

### Manually

It is recommended to set these two headers for all requests:

```
Content-Security-Policy: script-src 'self'
X-Content-Security-Policy: script-src 'self'
```

## Running a development server

Unless your development system is setup exactly like it would be for
production use, with `intelmqctl` invoked via `sudo` and installed in
the default location under `/opt/intelmq`, you will likely need to
create a configuration file, like this (`devconfig.json`):


```
{
    "intelmq_ctl_cmd": ["/usr/local/bin/intelmqctl"],
    "allowed_path": "/opt/intelmq/var/lib/"
}
```

The option `"intelmq_ctl_cmd"` is a list of strings so that we can avoid
shell-injection vulnerabilities because no shell is involved when
running the command. This means that if the command you want to use
needs parameters, they have to be separate strings. For instance the
default command using `sudo` would be


```
{
    "intelmq_ctl_cmd": ["sudo", "-u", "intelmq", "/usr/local/bin/intelmqctl"],
    "allowed_path": "/opt/intelmq/var/lib/"
}
```

Starting the server with the configuration file:

```
INTELMQ_MANAGER_CONFIG=devconfig.json hug -f intelmq_manager/serve.py -p8080
```

The server should be running now and listening on port 8080 and you
should be able to access it from a browser with a URL like:

```
http://localhost:8080/
```

## Typical problems

If the command is not configured correctly, you'll see exceptions on
startup like this:

```
intelmq_manager.runctl.IntelMQCtlError: <ERROR_MESSAGE>
```

This means the intelmqctl command could not be executed as a subprocess.
The `<ERROR_MESSAGE>` should indicate why.


To save the positions of the bots in the configuration map, you need
an existing writable `manager/positions.conf` file. If it's missing,
just create an empty one.


## Type checking

Except for the parts that directly deal with `hug`, the code can be
typechecked with `mypy`. To run the type checker, start with the module
`serve`:

```
mypy intelmq_manager/serve.py
```
