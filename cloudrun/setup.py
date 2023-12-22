#!/usr/bin/env python
# -*- encoding: utf-8 -*-
"""
setup.py
A module that installs download as a module
"""
from pathlib import Path

from setuptools import find_packages, setup

#: Load version from source file
version = {}
version_file = Path(__file__).parent / "src" / "download" / "version.py"
exec(version_file.read_text(), version)

setup(
    name="download",
    version=version["__version__"],
    license="MIT",
    description="Download service for enviro.deq.utah.gov",
    long_description=(Path(__file__).parent / "README.md").read_text(),
    long_description_content_type="text/markdown",
    author="UGRC",
    author_email="ugrc-developers@utah.gov",
    url="https://github.com/agrc/deq-enviro",
    packages=find_packages("src"),
    package_dir={"": "src"},
    include_package_data=True,
    zip_safe=True,
    classifiers=[
        # complete classifier list: http://pypi.python.org/pypi?%3Aaction=list_classifiers
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Topic :: Utilities",
    ],
    project_urls={
        "Issue Tracker": "https://github.com/agrc/python/issues",
    },
    keywords=["gis"],
    install_requires=[
        "google-cloud-logging==3.*",
        "google-cloud-storage==2.*",
        "google-cloud-firestore==2.*",
        "flask-cors==4.*",
        "flask-json==0.4",
        "flask==3.*",
        "openpyxl==3.*",  # required for writing excel files with pandas
        "pyshp==2.*",  # required for writing shapefiles with arcgis without arcpy
        "python-dotenv==1.*",
        "simplejson==3.*",
        # arcgis deps
        "cachetools==5.*",
        "geomet==1.*",
        "lxml==4.*",
        "ntlm_auth==1.*",
        "pandas==2.*",
        "requests_ntlm==1.*",
        "requests_oauthlib==1.*",
        "requests_toolbelt==1.*",
        "requests==2.*",
        "six==1.*",
        "ujson==5.*",
    ],
    extras_require={
        "dev": [
            "black==23.*",
            "cloudevents==1.*",
            "pytest-cov==4.*",
            "pytest-instafail==0.5.*",
            "pytest-mock==3.*",
            "pytest-ruff==0.*",
            "pytest-watch==4.*",
            "pytest==7.*",
            "ruff==0.0.*",
        ],
    },
    setup_requires=[
        "pytest-runner",
    ],
    entry_points={
        "console_scripts": [
            "download = download.main:main",
        ]
    },
)
