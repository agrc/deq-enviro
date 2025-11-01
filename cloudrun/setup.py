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
        "cloudevents==1.*",
        "google-cloud-logging==3.*",
        "google-cloud-storage==3.*",
        "google-cloud-firestore==2.*",
        "google-events==0.*",
        "flask-cors>=5,<7",
        "flask-json==0.4",
        "flask==3.*",
        "openpyxl==3.*",  # required for writing excel files with pandas
        "geopandas==1.*",  # required for writing to FGDBs
        "pyshp>=2,<4",  # required for writing shapefiles with arcgis without arcpy
        "python-dotenv==1.*",
        "simplejson==3.*",
    ],
    extras_require={
        "dev": [
            "pytest-cov>=4,<7",
            "pytest-instafail==0.5.*",
            "pytest-mock==3.*",
            "pytest-ruff==0.*",
            "pytest-watch==4.*",
            "pytest>=7,<9",
            "ruff==0.*",
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
