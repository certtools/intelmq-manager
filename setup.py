""" Setup file for intelmq-manager

SPDX-FileCopyrightText: 2020 IntelMQ Team <intelmq-team@cert.at>
SPDX-License-Identifier: AGPL-3.0-or-later
"""
from setuptools import find_packages, setup

import pathlib
import shutil
from mako.lookup import TemplateLookup

from intelmq_manager.version import __version__

def render_page(pagename:str, **template_args) -> str:
    template_dir = pathlib.Path('intelmq_manager/templates')
    template_lookup = TemplateLookup(directories=[template_dir], default_filters=["h"], input_encoding='utf8')
    template = template_lookup.get_template(f'{pagename}.mako')

    return template.render(pagename=pagename, **template_args)

def buildhtml():
    outputdir = pathlib.Path('html')
    outputdir.mkdir(parents=True, exist_ok=True)

    htmlfiles = ["configs", "management", "monitor", "check", "about", "index"]
    for filename in htmlfiles:
        print(f"Rendering {filename}.html")
        html = render_page(filename)
        outputdir.joinpath(f"{filename}.html").write_text(html)

    staticfiles = ["css", "images", "js", "plugins", "less"]
    for filename in staticfiles:
        print(f"Copying {filename} recursively")
        src = pathlib.Path('intelmq_manager/static') / filename
        dst = outputdir / filename
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)

    print('rendering dynvar.js')
    rendered = render_page('dynvar', allowed_path='/opt/intelmq/var/lib/bots/', controller_cmd='intelmq')
    outputdir.joinpath('js/dynvar.js').write_text(rendered)

# Before running setup, we build the html files in any case
buildhtml()

htmlsubdirs = [directory for directory in pathlib.Path('html').glob('**') if directory.is_dir()]
data_files = [(f'/usr/share/intelmq_manager/{directory}', [str(x) for x in directory.glob('*') if x.is_file()]) for directory in htmlsubdirs]
data_files = data_files + [('/usr/share/intelmq_manager/html', [str(x) for x in pathlib.Path('html').iterdir() if x.is_file()])]
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
