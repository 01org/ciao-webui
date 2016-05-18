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

# Insert the css files and the js files (from library) into env_template.ejs
# * Notacion *
cssStart="<link rel='stylesheet' href='"
cssEnd="' />"
jsStart="<script type='text/javascript' src='"
jsEnd="'></script>"
# * insert them after tittle html tag *
match="</title>"
# * "files" *
bootstrap="$cssStart/bootstrap/dist/bootstrap.min.css$cssEnd"
framework="$cssStart/stylesheets/framework.css$cssEnd"
d3="$cssStart/stylesheets/d3Framework.css$cssEnd"
jquery="$jsStart/jquery/jquery.js$jsEnd"
jqueryui="$jsStart/jquery-ui/jquery-ui.js$jsEnd"
datamanager="$jsStart/data/dataManager.js$jsEnd"
loadDatamanager="<script type='text/javascript'>window.datamanager.loadData((<%- JSON.stringify(data)%>));</script>"
# Delete .bak (this is just for mac)
# Replace \\ for \n (this is just for mac)
sed -i.bak "s~$match~$match\\$bootstrap\\$framework\\$d3\\$jquery\\$jqueryui\\$datamanager\\$loadDatamanager~" views/$file
