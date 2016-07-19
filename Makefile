# Variable declaration

DESTDIR ?= /usr/local
NODE_ENV ?="production"
OS=$(shell uname)
NPM_LINK=$(shell npm bin -g)
file="$(NODE_ENV)_template.ejs"
cssStart="<link rel='stylesheet' href='"
cssEnd="' />"
jsStart="<script type='text/javascript' src='"
jsEnd="'></script>"
match="</title>"
# * "files" *
bootstrap="$(cssStart)/bootstrap/dist/css/bootstrap.min.css$(cssEnd)"
framework="$(cssStart)/stylesheets/framework.css$(cssEnd)"
d3="$(cssStart)/stylesheets/d3Framework.css$(cssEnd)"
jquery="$(jsStart)/jquery/dist/jquery.js$(jsEnd)"
jqueryui="$(jsStart)/jquery-ui/jquery-ui.js$(jsEnd)"
datamanager="$(jsStart)/data/dataManager.js$(jsEnd)"
loadDatamanager="<script type='text/javascript'>window.datamanager.loadData\(\(<%- JSON.stringify\(data\)%>\)\);</script>"
validations="$(jsStart)/javascripts/library/validations.js$(jsEnd)"

install:
	-mkdir -p public/javascripts/library
	-mkdir node_modules
	-mkdir -p build/stylesheets
	-cp views/default_template.ejs views/$(file)
	-cp css/css_framework/framework.css build/stylesheets
	-cp css/d3_components/d3Framework.css build/stylesheets
	-cp -r vendor/* node_modules/
	-cp js/util/*.js public/javascripts/library/
	sed -i.bak "s~$(subst $\",,$(match))~$(subst $\",,$(match))\\$(bootstrap)\\$(subst $\",,$(framework))\\$(subst $\",,$(d3))\\ $(subst $\",,$(jquery))\\$(subst $\",,$(jqueryui))\\$(subst $\",,$(datamanager))\\$(subst $\",,$(loadDatamanager))\\ $(subst $\",,$(validations))~" views/$(subst $\",,$(file))
	-mkdir -p $(DESTDIR)/ciao-webui/
	-mkdir -p $(DESTDIR)/share/ciao-webui
	-cp config/ciao_config.json $(DESTDIR)/share/ciao-webui/
	-cp -rf * $(DESTDIR)/ciao-webui/
	sed "s/\".\" #executable/\"$(subst $\/,\\/,$(DESTDIR))\"/" ./ciao-webui.sh > $(NPM_LINK)/ciao-webui
	chmod u+rx $(NPM_LINK)/ciao-webui

uninstall:
	-rm $(DESTDIR)/share/ciao-webui/ciao_config.json
	-rm -r /usr/local/ciao-webui
	-rm $(NPM_LINK)/ciao-webui

install-dev:
	# Update/download the required dependencies for the project
	-cp -r vendor/* node_modules/
	-npm install
	# installing Babel and Browserify globally
	-npm install --global babel-cli
	-npm install --global browserify
	-npm install --global babel-preset-es2015 babel-preset-react
	#Build react + jsx code and put in build directory
	-npm run babel-react
	# Run build scripts
	-npm run build-login
	-npm run build-tenant
	-npm run build-admin
	-npm run build-machine
	-npm run build-network
	-npm run build-subnet
	-npm run build-group
	-mkdir -p public/javascripts/library
	-mkdir node_modules
	-mkdir -p build/stylesheets
	-cp views/default_template.ejs views/$(file)
	-cp css/css_framework/framework.css build/stylesheets
	-cp css/d3_components/d3Framework.css build/stylesheets
	-cp js/util/*.js public/javascripts/library/
	sed -i.bak "s~$(subst $\",,$(match))~$(subst $\",,$(match))\\$(bootstrap)\\$(subst $\",,$(framework))\\$(subst $\",,$(d3))\\ $(subst $\",,$(jquery))\\$(subst $\",,$(jqueryui))\\$(subst $\",,$(datamanager))\\$(subst $\",,$(loadDatamanager))\\ $(subst $\",,$(validations))~" views/$(subst $\",,$(file))
	-mkdir -p $(DESTDIR)/ciao-webui/
	-mkdir -p $(DESTDIR)/share/ciao-webui
	-cp config/ciao_config.json $(DESTDIR)/share/ciao-webui/
	-cp -rf * $(DESTDIR)/ciao-webui/
	sed "s/\".\" #executable/\"$(subst $\/,\\/,$(DESTDIR))\"/" ./ciao-webui.sh > $(NPM_LINK)/ciao-webui
	chmod u+rx $(NPM_LINK)/ciao-webui

clean:
	-rm -rf node_modules
	-rm build/javascripts/.*js
	-rm -rf public/*
	-rm views/$(file)
