# IntelMQ Control Platform

IntelMQ Control Platform is a graphical interface to manage configurations for IntelMQ framework.

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