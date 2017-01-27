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

mkdir node_modules
cp -r vendor/* node_modules/

mkdir -p public/javascripts/library
# Copy validation script file to public directory
cp js/util/validations.js public/javascripts/library/validations.js

# Relocate css files to build directory
mkdir -p build/stylesheets

cp css/css_framework/framework.css build/stylesheets
cp css/d3_components/d3Framework.css build/stylesheets

# Insert the css files and the js files (from library) into env_template.ejs
# * Notacion *
cssStart="<link rel='stylesheet' href='"
cssEnd="' />"
jsStart="<script type='text/javascript' src='"
jsEnd="'></script>"
# * insert them after tittle html tag *
match="</title>"
# * "files" *
bootstrap="$cssStart/bootstrap/dist/css/bootstrap.min.css$cssEnd"
framework="$cssStart/stylesheets/framework.css$cssEnd"
d3="$cssStart/stylesheets/d3Framework.css$cssEnd"
chosen="$cssStart/stylesheets/chosen.css$cssEnd"
jquery="$jsStart/jquery/dist/jquery.js$jsEnd"
jqueryui="$jsStart/jquery-ui/jquery-ui.js$jsEnd"
datamanager="$jsStart/data/dataManager.js$jsEnd"
loadDatamanager="<script type='text/javascript'>window.datamanager.loadData((<%- JSON.stringify(data)%>));</script>"
validations="$jsStart/javascripts/library/validations.js$jsEnd"
# Delete .bak (this is just for mac)
# Replace \\ for \n (this is just for mac)
sed -i.bak "s~$match~$match\\$bootstrap\\$framework\\$d3\\$chosen\\$jquery\\$jqueryui\\$datamanager\\$loadDatamanager\\$validations~" views/$file

npm start -- "$@"
