.SUFFIXES:

.SUFFIXES: .js .ts .pug .html .sass

.PHONY: default
default: dist

.PHONY: init
init: mkdirs clean util/bin/modd util/bin/sassc
	npm install

util/bin/modd:
	curl -o tmp/modd.tgz -L https://github.com/cortesi/modd/releases/download/v0.4/modd-0.4-linux64.tgz
	tar axvf tmp/modd.tgz --directory tmp
	mv tmp/modd*/modd util/bin/modd
	rm -rf tmp/*

util/bin/sassc:
	mkdir -p tmp/sassc
	git clone https://github.com/sass/sassc.git tmp/sassc
	git clone https://github.com/sass/libsass.git tmp/libsass
	git clone https://github.com/sass/sass-spec.git tmp/sass-spec
	export SASS_LIBSASS_PATH=$(shell pwd)/tmp/libsass; \
	export SASS_SPEC_PATH=$(shell pwd)/tmp/sass-spec; \
	cd tmp/sassc; make
	mv tmp/sassc/bin/sassc util/bin/sassc
	rm -rf tmp/*

.PHONY: mkdirs
mkdirs:
	mkdir -p tmp
	mkdir -p util/bin
	mkdir -p dist

.PHONY:	clean
clean:
	rm -rf tmp/*
	rm -rf util/bin/*
	rm -rf dist/*
	rm -rf node_modules

.PHONY:	watch
watch:
	modd

# Sass / CSS
#
.PHONY: css
css: dist/index.css

dist/index.css: sass/*.sass
	util/bin/sassc sass/index.sass > $@

# Pug / Html

.PHONY: html
html: dist/index.html

dist/index.html: pug/*.pug
	node node_modules/.bin/pug -O package.json pug/index.pug -o $(dir $@)

# TypeScript / Javascript

.PHONY: js
js: dist/index.js

dist/index.js: ts/*.ts
	node node_modules/.bin/browserify -p [tsify] ts/index.ts > dist/index.js

# dist/

dist: dist/index.css dist/index.html
