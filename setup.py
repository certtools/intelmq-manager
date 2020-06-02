#!/usr/bin/python3
# -*- coding: utf-8 -*-

from setuptools import find_packages, setup

from intelmq_manager.version import __version__


setup(
    name="intelmq-manager",
    version=__version__,
    python_requires='>=3.5',
    install_requires=[
        "hug>=2.3.0",
        "mako>=1.0.7",
        ],
    packages=find_packages(),
    include_package_data=True,
    url='https://github.com/certtools/intelmq-manager/',
    description=("IntelMQ Manager is a graphical interface to manage"
                 " configurations for the IntelMQ framework."),
)
