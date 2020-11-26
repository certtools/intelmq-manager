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
    outputdir = pathlib.Path('intelmq_manager/html')
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

setup(
    name="intelmq-manager",
    version=__version__,
    python_requires='>=3.5',
    packages=find_packages(),
    include_package_data=True,
    url='https://github.com/certtools/intelmq-manager/',
    description=("IntelMQ Manager is a graphical interface to manage"
                 " configurations for the IntelMQ framework."),
)
