#!/usr/bin/python3
from setuptools import find_packages, setup
from setuptools.command.sdist import sdist as _sdist

import pathlib
import shutil
from mako.lookup import TemplateLookup

from intelmq_manager.version import __version__

class CustomSdist(_sdist):
    """ Custom source dist command to build html files."""

    template_dir = pathlib.Path("intelmq_manager/templates")
    template_lookup = TemplateLookup(directories=[template_dir], default_filters=["h"])


    def render_page(self, pagename: str) -> str:
        template = self.template_lookup.get_template(pagename + ".mako")
        controller_cmd = "intelmq"
        allowed_path = "/opt/intelmq/var/lib/bots/"
        return template.render(pagename=pagename,
                controller_cmd=controller_cmd,
                allowed_path=allowed_path)

    def build(self):
        outputdir = pathlib.Path('intelmq_manager/html')
        outputdir.mkdir(parents=True, exist_ok=True)

        htmlfiles = ["configs", "management", "monitor", "check", "about", "index"]
        for filename in htmlfiles:
            print("Rendering {}.html".format(filename))
            html = self.render_page(filename)
            with outputdir.joinpath("{}.html".format(filename)) as p:
                p.write_text(html)

        staticfiles = ["css", "images", "js", "plugins", "less"]
        for filename in staticfiles:
            print("Copying {} recursively".format(filename))
            src = pathlib.Path('intelmq_manager/static/{}'.format(filename))
            dst = outputdir.joinpath(filename)
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst)

    def run(self):
        self.build()
        return _sdist.run(self)

setup(
    cmdclass = {
        'sdist': CustomSdist,
        },
    name="intelmq-manager",
    version=__version__,
    python_requires='>=3.5',
    packages=find_packages(),
    include_package_data=True,
    url='https://github.com/certtools/intelmq-manager/',
    description=("IntelMQ Manager is a graphical interface to manage"
                 " configurations for the IntelMQ framework."),
)
