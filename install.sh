#!/usr/bin/env bash

# Change working directory to project folder
cd "${0%/*}"

EXT_NAME="test-pkexec"
EXT_UUID="test@maniacx.github.com"

if ! command -v msgfmt &> /dev/null
then
    echo "Missing gettext!!!"
    echo "Please install gettext and re-run this installer."
    echo "Press any key to exit..."
    read -n1
    exit 1
fi

echo "Packing extension..."
gnome-extensions pack ./ \
    --force \

if [ $? -ne 0 ]; then 
    echo "Error occur during compilation of Gnome Extension ${EXT_NAME}."
    echo "Press any key to exit..."
    read -n1
    exit $?
fi

echo "Installing extension..."
gnome-extensions install $EXT_UUID.shell-extension.zip --force

if [ $? -ne 0 ]; then 
    read -n1
    exit $?
fi

echo "Gnome Extension $EXT_NAME was succesfully installed."
echo "Restart the shell (or logout) to be able to enable the extension."
echo "Press any key to exit..."
read -n1
exit 0

