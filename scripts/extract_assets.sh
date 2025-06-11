#!/bin/sh
set -e
mkdir -p assets/img
base64 -d assets/img/logo.txt > assets/img/logo.png
base64 -d assets/img/hero-bg.txt > assets/img/hero-bg.jpg
echo "Images extracted to assets/img/"
