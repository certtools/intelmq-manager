# IntelMQ Manager

IntelMQ Manager is a graphical interface to manage configurations for IntelMQ framework.

![Main Interface](docs/screenshots/index.png?raw=true "Entry Point")

### Pipeline
This interface lets you visually configure the whole IntelMQ pipeline and the parameters of every single bot.
You will be able to see the pipeline in a graph-like visualization like this:

![Main Interface](docs/screenshots/configuration_load.png?raw=true "Main Interface")

### Bots Configuration
When you add a node or edit one you'll be presented with a form with the bots available parameters and can easily change the values like this:

![Parameter editing](docs/screenshots/edit_node.png?raw=true "Parameter editing")

After editing the bots' configuration and pipeline, simply click "Save Configuration" to automatically write the changes to the correct files and the configurations are ready to be deployed.

### Future Work

In the near future this interface will also allow you to start and stop bots, read their logs and see other messages regarding the overall health of the system.

### Reminder

When using IntelMQ Manager do not forget that in order for it to change the configuration files it needs read and write access to the files in the /etc/intelmq folder (or equivalent configuration folder in your setup).

Also, by default IntelMQ Manager launchs the bots using the apache account, which means that the apache account will need to have read/write access to the following folders:
/var/log/intelmq/
/var/run/intelmq/
/var/lib/intelmq/

In order to centralize the scripting efforts all the work is done by the 'intelmqctl' script and the web manager only calls the script with the appropriate parameters. For that reason the apache user will have to be able to execute the 'intelmqctl' script.

