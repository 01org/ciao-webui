#!/bin/bash
env=$1

export NODE_ENV=$env

file=$env
file+="_template.ejs"
echo $NODE_ENV
echo $file

# Update/download the required dependencies for the project
npm install
# installing Babel and Browserify globally
npm install --global babel-cli
npm install --global browserify

# Create javascript directory
mkdir public/javascripts
# Create library working directory
mkdir public/javascripts/library

#Build react + jsx code and put in build directory
npm run babel-react &

# get vendor libraries
# Copy all the js libraries to the public Path
if [ ! -f public/javascripts/library/jquery.js ]; then
    curl https://code.jquery.com/jquery-2.2.1.min.js -o jquery-2.2.1.min.js
    mv jquery-2.2.1.min.js public/javascripts/library/jquery.js
fi

if [ ! -f public/javascripts/library/jquery-ui.js ]; then
    curl  https://code.jquery.com/ui/1.11.4/jquery-ui.min.js -o jquery-ui.min.js
    mv jquery-ui.min.js public/javascripts/library/jquery-ui.js
fi

# Download required font
mkdir tempDownloads
cd tempDownloads

curl 'https://01.org/sites/default/files/downloads/clear-sans/clearsans-1.00.zip' > clearsans-1.00.zip

# Installing unzip package
# swupd bundle-add file-utils

# unzip font files
unzip clearsans-1.00.zip
mkdir fonts
mkdir fonts/clearsans-1.00
cp -r TTF LICENSE-2.0.txt fonts/clearsans-1.00/

cd ..

# Create stylesheets directory
mkdir public/stylesheets
# Copy all the css content to the public path
cp -r css/css_framework/* public/stylesheets
cp css/d3_components/d3Framework.css public/stylesheets
cp -r tempDownloads/fonts public/stylesheets/

# removing temporal files
rm -rf tempDownloads

# Relocating bootstrap files
cp -r node_modules/bootstrap/dist/fonts/* public/stylesheets/fonts
cp -r node_modules/bootstrap/dist/css/bootstrap.min.css public/stylesheets

# Copy datamanager.js to public directory
cp build/data/dataManager.js public/javascripts/datamanager.js

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
bootstrap="$cssStart/stylesheets/bootstrap.min.css$cssEnd"
framework="$cssStart/stylesheets/framework.css$cssEnd"
d3="$cssStart/stylesheets/d3Framework.css$cssEnd"
jquery="$jsStart/javascripts/library/jquery.js$jsEnd"
jqueryui="$jsStart/javascripts/library/jquery-ui.js$jsEnd"
datamanager="$jsStart/javascripts/datamanager.js$jsEnd"
loadDatamanager="<script type='text/javascript'>window.datamanager.loadData((<%- JSON.stringify(data)%>));</script>"
# Delete .bak (this is just for mac)
# Replace \\ for \n (this is just for mac)
sed -i.bak "s~$match~$match\\$bootstrap\\$framework\\$d3\\$jquery\\$jqueryui\\$datamanager\\$loadDatamanager~" views/$file


# Run build scripts
npm run build-login
npm run build-tenant
npm run build-admin
npm run build-machine
npm run build-network
npm run build-subnet
npm run build-group


# Start the application
npm start
