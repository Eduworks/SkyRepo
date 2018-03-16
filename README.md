[![Build Status](https://travis-ci.org/eduworks/skyrepo.svg?branch=master)](https://travis-ci.org/eduworks/skyrepo)
# SkyRepo
Linked Data Repository (CRUD+Search)

# Purpose of this Document
This document is intended to act as a technical guide to the installation of SkyRepo.

This installation of SkyRepo will provide several components that operate to provide a working system. It is composed of:
 * The SkyRepo Repository, a Java application that runs in a Servlet Container, such as Tomcat.
 * The SkyRepo Library, a Javascript library that provides an interoperability layer between web applications and the SkyRepo Repository.

# Installation
## Ubuntu/Fedora Linux:

    wget https://raw.githubusercontent.com/eduworks/skyrepo/master/scripts/skyrepoInstall.sh
    chmod +x skyrepoInstall.sh
    sudo ./skyrepoInstall.sh
    
During the installation, you will be asked to select a version to install. The 'master' installation will install an unstable version with the latest features. Specific versions can be relied upon to be stable and consistant.

## Windows (experimental, NYI)

    @powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
    refreshenv
    choco install -y skyrepo
    refreshenv

Go to services, start elasticsearch-service-x64 and set it to start automatically.

# Post Installation
To support open linked data, it is important that the objects created in SkyRepo have public, reliable URLs. For this:

 * Assign this server a domain name.
 * Enable HTTPS.
 * (Optional) Use a reverse proxy to control the endpoint closely.
