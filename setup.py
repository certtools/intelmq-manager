"""
Setup file for intelmq-manager

SPDX-FileCopyrightText: 2020 IntelMQ Team <intelmq-team@cert.at>
SPDX-License-Identifier: AGPL-3.0-or-later
"""

from setuptools import find_packages, setup

from intelmq_manager.version import __version__


setup(
    name="intelmq-manager",
    maintainer='IntelMQ Team',
    maintainer_email='intelmq-team@cert.at',
    version=__version__,
    python_requires='>=3.5',
    packages=find_packages(),
    install_requires=[
        "intelmq-api",
        "mako",
    ],
    include_package_data=True,
    url='https://github.com/certtools/intelmq-manager/',
    description=("IntelMQ Manager is a graphical interface to manage"
                 " configurations for the IntelMQ framework."),
    data_files=[('/etc/intelmq', ['contrib/manager-apache.conf'])],  # required for deb packaging
    package_data={'': ('manager-apache.conf',  # works for the wheel package
                       'templates/*',
                       'static/css/*',
                       'static/images/*',
                       'static/js/*',
                       'static/less/*',
                       'static/plugins/*',
                       'static/plugins/bootstrap/*',
                       'static/plugins/dataTables/*',
                       'static/plugins/font-awesome-4.1.0/*',
                       'static/plugins/font-awesome-4.1.0/css/*',
                       'static/plugins/font-awesome-4.1.0/fonts/*',
                       'static/plugins/font-awesome-4.1.0/less/*',
                       'static/plugins/font-awesome-4.1.0/scss/*',
                       'static/plugins/fonts/*',
                       'static/plugins/metisMenu/*',
                       'static/plugins/vis.js/*',
                       'static/plugins/vis.js/img/*',
                       'static/plugins/vis.js/img/graph/*',
                       'static/plugins/vis.js/img/network/*',
                       'static/plugins/vis.js/img/timeline/*',
                       )},
    entry_points={
        'console_scripts': [
            'intelmq-manager-build = intelmq_manager.build:main',
        ],
    },
)
