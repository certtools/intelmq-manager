""" Setup file for intelmq-manager

SPDX-FileCopyrightText: 2020 IntelMQ Team <intelmq-team@cert.at>
SPDX-License-Identifier: AGPL-3.0-or-later
"""
from setuptools import find_packages, setup

import pathlib
import shutil
from mako.lookup import TemplateLookup

from intelmq_manager.version import __version__

def render_page(pagename: str) -> str:
    template_dir = pathlib.Path("intelmq_manager/templates")
    template_lookup = TemplateLookup(directories=[template_dir], default_filters=["h"])
    template = template_lookup.get_template(pagename + ".mako")
    controller_cmd = "intelmq"
    allowed_path = "/opt/intelmq/var/lib/bots/"
    return template.render(pagename=pagename,
            controller_cmd=controller_cmd,
            allowed_path=allowed_path)

def buildhtml():
    outputdir = pathlib.Path('html')
    outputdir.mkdir(parents=True, exist_ok=True)

    htmlfiles = ["configs", "management", "monitor", "check", "about", "index"]
    for filename in htmlfiles:
        print("Rendering {}.html".format(filename))
        html = render_page(filename)
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

# Before running setup, we build the html files in any case
buildhtml()

htmlsubdirs = [directory for directory in pathlib.Path('html').glob('**') if directory.is_dir()]
data_files = [('share/intelmq_manager/{}'.format(directory), [str(x) for x in directory.glob('*') if x.is_file()]) for directory in htmlsubdirs]
data_files = data_files + [('share/intelmq_manager/html', [str(x) for x in pathlib.Path('html').iterdir() if x.is_file()])]
data_files = data_files + [('/etc/intelmq', ['contrib/manager-apache.conf'])]

setup(
    name="intelmq-manager",
    version=__version__,
    python_requires='>=3.5',
    packages=find_packages(),
    install_requires=[
        "intelmq-api",
    ],
    include_package_data=True,
    url='https://github.com/certtools/intelmq-manager/',
    description=("IntelMQ Manager is a graphical interface to manage"
                 " configurations for the IntelMQ framework."),
    data_files=data_files
)
