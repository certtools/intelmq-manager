<!--
SPDX-FileCopyrightText: 2020 IntelMQ Team

SPDX-License-Identifier: AGPL-3.0-or-later
-->

Please report any errors you encounter at https://github.com/certtools/intelmq-manager/issues

# Requirements

The ``intelmq-manager`` only contains the webinterface since version 2.3. To use the webinterface, you have to have a working ``intelmq``
installation wich provides access to the ``intelmq-api``. For the webinterface any operating system that can run a webserver and serve
html pages is supported, for ``intelmq-manager`` and ``intelmq-api`` please refer to their documentation.

# Installation

`pip install intelmq-manager` installs the python module together with the html files. There is a helper variable to find its path

```
python3 -c 'import intelmq_manager; print(intelmq_manager.path)'
```

# Security considerations

**Never ever run intelmq-manager on a public webserver without SSL and proper authentication**.

The way the current version is written, anyone can send a POST request and change intelmq's configuration files via sending HTTP POST requests.
Intelmq-manager will reject non JSON data but nevertheless, we don't want anyone to be able to reconfigure an intelmq installation.

Therefore you will need authentication and SSL. Authentication is handled by the ``intelmq-api``. Please refer to its documentation on how to
enable authentication and setup accounts.

**Never ever allow unencrypted, unauthenticated access to intelmq-manager**.

# Configuration

In the file ``html/js/vars.js`` set ``ROOT`` to the URL of your intelmq API, i.e. ``https://intelmq-api.example.org/``. By default this points
to the URL of the host ``intelmq-manager`` is accesed on.

## Content-Security-Policy Headers

### Manually

It is recommended to set these two headers for all requests:

```
Content-Security-Policy: script-src 'self'
X-Content-Security-Policy: script-src 'self'
```
