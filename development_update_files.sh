#!/bin/bash

env=$1

export NODE_ENV=$env

file=$env
file+="_template.ejs"
echo $NODE_ENV
echo $file

# Verify the environment to define the template
if [ $env == "default" ]
then
    $file = default_template.ejs
else
    # Create env_template.ejs
    cp views/default_template.ejs views/$file
fi

# Create javascript directory
mkdir -p public/javascripts
# Create library working directory
mkdir -p public/javascripts/library

# get vendor libraries
# Copy all the js libraries to the public Path
if [ ! -f public/javascripts/library/jquery.js ]; then
    wget https://code.jquery.com/jquery-2.2.1.min.js
    mv jquery-2.2.1.min.js public/javascripts/library/jquery.js
fi

if [ ! -f public/javascripts/library/jquery-ui.js ]; then
    wget https://code.jquery.com/ui/1.11.4/jquery-ui.min.js
    mv jquery-ui.min.js public/javascripts/library/jquery-ui.js
fi

# Create stylesheets directory
mkdir -p public/stylesheets
# Copy all the css content to the public path
cp -r css/css_framework/* public/stylesheets
cp css/d3_components/d3Framework.css public/stylesheets

# Copy datamanager.js to public directory
cp build/data/dataManager.js public/javascripts/datamanager.js

# Insert the css files and the js files (from library) into env_template.ejs
# * Notacion *
cssStart="<link rel='stylesheet' href='"
cssEnd="' />"
jsStart="<script type='text/javascript' src='"
jsEnd="'></script>"
# * insert them after tittle html tag *
match="</title>"
# * "files" *
bootstrap="$cssStart/stylesheets/bootstrap.min.css$cssEnd"
framework="$cssStart/stylesheets/framework.css$cssEnd"
d3="$cssStart/stylesheets/d3Framework.css$cssEnd"
jquery="$jsStart/javascripts/library/jquery.js$jsEnd"
jqueryui="$jsStart/javascripts/library/jquery-ui.js$jsEnd"
jquerychosencss="$(cssStart)/stylesheets/chosen.css$(cssEnd)"
datamanager="$jsStart/javascripts/datamanager.js$jsEnd"
loadDatamanager="<script type='text/javascript'> window.datamanager.loadData((<%- JSON.stringify(data)%>)); </script>"
# Delete .bak (this is just for mac)
# Replace \\ for \n (this is just for mac)
sed -i.bak "s~$match~$match\\$bootstrap\\$framework\\$jquerychosencss\\$d3\\$jquery\\$jqueryui\\$datamanager\\$loadDatamanager~" views/$file
