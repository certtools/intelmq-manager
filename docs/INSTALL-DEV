## Install dependencies

Either using OS packages, e.g. for Ubuntu:

```
apt-get install python3-hug python3-mako sudo
```

For the python3 packages pip can be used alternatively:

```
python3 -m pip install hug mako
```

(You will need a correctly configured `sudo` to serve this web app from
a web server running under a different user id than your intelmq userid.)

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
