#!/bin/bash
OS=`uname`
LOCATION="." #executable
CONFIG_FILE='config_file=/usr/share/ciao-webui/ciao_config.json'
if [[ "$OS" == 'Darwin' ]]; then
    CONFIG_FILE='config_file=/usr/local/share/ciao-webui/ciao_config.json'
fi

if [ "$1" == "" ]; then
    env="production"
else
    env=$1
fi
echo "Environment: "$env

export NODE_ENV=$env

if [ "$2" == "" ]; then
    node $LOCATION/ciao-webui/bin/www "$CONFIG_FILE"

else
    node $LOCATION/ciao-webui/bin/www " $@"
fi
