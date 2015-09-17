COPY_DIRS=views,lists,shows,evently,vendor/couchapp/lib
COPY_FILES=_id couchapp.json language validate_doc_update.js .couchapprc rewrites.json

HTML_FILES=_attachments/index.html template/freeform.html template/readonlypost.html template/user.html
HTML_DEPS=.intermediate/_attachments/all.js .intermediate/_attachments/style/all.css .intermediate/_attachments/browserify.js
HTML_DEP_SUM_FILES=$(HTML_DEPS:.intermediate/%=.intermediate/%.sum)

IMAGE_FILES=_attachments/style/Feed-icon.svg _attachments/style/ornate_13.png _attachments/img//glyphicons-halflings-white.png _attachments/img//glyphicons-halflings.png
IMAGE_SUM_SRCS=$(IMAGE_FILES)
IMAGE_SUM_FILES=$(IMAGE_SUM_SRCS:%=.intermediate/%.sum)

JQUERY=vendor/jquery/_attachments/jquery-1.7.2.js
BOOTSTRAP_FILES=bootstrap.min bootstrap-typeahead
BOOTSTRAP=$(BOOTSTRAP_FILES:%=vendor/bootstrap/_attachments/js/%.js)
COUCHAPP_FILES=sha1 json2 jquery.couch jquery.couch.app jquery.couch.app.util jquery.mustache jquery.evently
COUCHAPP=$(COUCHAPP_FILES:%=vendor/couchapp/_attachments/%.js)
LOCAL=views/lib/biginteger.js views/lib/schemeNumber.js views/lib/fractionParser.js views/lib/sprintf-0.7-beta1.js calc.js toMixedNumber.js sharebill.js
JS_FILES=config.js $(JQUERY) $(BOOTSTRAP) $(COUCHAPP) $(REACT) $(LOCAL)

BROWSERIFY_MODULES= \
	src/account-input-table.js \
	src/balances.js \
	src/calc.js \
	src/complete_early_xhr.js \
	src/entry-buttons.js \
	src/freeform.js \
	src/instance-config.js \
	src/moment-config.js \
	src/post-editor.js \
	src/recent.js \
	src/sheet.js \
	src/toMixedNumber.js

SERVER_RENDERING_TRGS= \
	release/react/addons.js \
	release/moment.js \
	release/browser-request.js \
	release/lib/views/lib/schemeNumber.js \
	release/lib/views/lib/biginteger.js \
	$(BROWSERIFY_MODULES:src/%=release/lib/%)

CSS_FILES=vendor/bootstrap/_attachments/css/bootstrap.css _attachments/style/local.css

FILES_FROM_COPY_DIRS=$(shell bash -c "find src/{$(COPY_DIRS)}")
TRGS_FROM_COPY_DIRS=$(FILES_FROM_COPY_DIRS:src/%=%)
SRCS=$(TRGS_FROM_COPY_DIRS) $(COPY_FILES)
TRGS=$(SRCS:%=release/%) $(HTML_FILES:%=release/%) $(SERVER_RENDERING_TRGS)

release: $(TRGS)

release/%: src/%
	mkdir -p `dirname $@`
	if [ ! -d $< ] ; then cp $< $@ ; fi

release/react/addons.js: node_modules/react/dist/react-with-addons.min.js
	mkdir -p `dirname $@`
	cp $< $@

release/moment.js: node_modules/moment/min/moment-with-locales.js
	mkdir -p `dirname $@`
	cp $< $@

release/browser-request.js:
	mkdir -p `dirname $@`
	touch $@

release/lib/views/lib/%: src/views/lib/%
	mkdir -p `dirname $@`
	uglifyjs -nc --unsafe -o $@ $<

release/lib/%.js: src/%.js
	mkdir -p `dirname $@`
	uglifyjs -nc --unsafe -o $@ $<

clean:
	rm -rf release .intermediate

remake: clean release

.PHONY: clean remake



.intermediate/%.sum: src/% ./checksumify.sh
	./checksumify.sh $<

.intermediate/%.sum: .intermediate/% ./checksumify.sh
	./checksumify.sh $<

.intermediate/image-sums.json: $(IMAGE_SUM_FILES) ./collect_checksums.sh cdn_base
	./collect_checksums.sh $@ $(IMAGE_SUM_FILES)


.intermediate/html-dep-sums.json: $(HTML_DEP_SUM_FILES) ./collect_checksums.sh cdn_base
	./collect_checksums.sh $@ $(HTML_DEP_SUM_FILES)


release/%.html: src/%.mu.html .intermediate/html-dep-sums.json
	mkdir -p `dirname $@`
	pystache "`cat $<`" .intermediate/html-dep-sums.json > $@


.intermediate/_attachments/all.js: $(JS_FILES:%.js=.intermediate/%.min.js)
	mkdir -p `dirname $@`
	cat $(JS_FILES:%.js=.intermediate/%.min.js) > $@

.intermediate/_attachments/browserify.js: .intermediate/browserify.min.js
	mkdir -p `dirname $@`
	cp $< $@

.intermediate/%.min.js: src/%.js
	mkdir -p `dirname $@`
	uglifyjs -nc --unsafe -o $@ $<

.intermediate/%.min.js: .intermediate/%.js
	mkdir -p `dirname $@`
	uglifyjs -nc --unsafe -o $@ $<


# pystache claims to accept filenames, but it doesn't seem to work right
.intermediate/_attachments/style/all.css: .intermediate/_attachments/style/all-prestache.css .intermediate/image-sums.json
	pystache "`sed -e 's/glyphicons-halflings.png/glyphicons-halflings.sum-{{glyphicons-halflings_png_sum}}.png/' -e 's/glyphicons-halflings-white.png/glyphicons-halflings-white.sum-{{glyphicons-halflings-white_png_sum}}.png/' .intermediate/_attachments/style/all-prestache.css`" .intermediate/image-sums.json > $@

.intermediate/_attachments/style/all-prestache.css: $(CSS_FILES:%=src/%)
	mkdir -p `dirname $@`
	cat $(CSS_FILES:%=src/%) > $@

node_modules: package.json
	npm install
	touch node_modules

.intermediate/browserify.js: $(BROWSERIFY_MODULES) node_modules
	./node_modules/.bin/browserify \
		-r './src/balances:./balances' \
		-r './src/entry-buttons:./entry-buttons' \
		-r './src/instance-config:./instance-config' \
		-r './src/post-editor:./post-editor' \
		-r './src/recent:./recent' \
		-r 'react' \
		src/moment-config.js \
		-o $@
