COPY_DIRS=views,lists,shows,evently,template,vendor/couchapp/lib

HTMLS=_attachments/index.html _attachments/posts.html
BOOTSTRAP_ATTACHMENTS=_attachments/img/glyphicons-halflings-white.png _attachments/img/glyphicons-halflings.png
STYLE=_attachments/style/Feed-icon.svg _attachments/style/brillant.png _attachments/style/ornate_13.png
MISC=_id couchapp.json language validate_doc_update.js .couchapprc
COPY_FILES=$(HTMLS) $(BOOTSTRAP_ATTACHMENTS) $(STYLE) $(MISC)

JQUERY=vendor/jquery/_attachments/jquery-1.7.2.js
BOOTSTRAP_FILES=bootstrap.min bootstrap-typeahead
BOOTSTRAP=$(BOOTSTRAP_FILES:%=vendor/bootstrap/_attachments/js/%.js)
COUCHAPP_FILES=sha1 json2 jquery.couch jquery.couch.app jquery.couch.app.util jquery.mustache jquery.evently
COUCHAPP=$(COUCHAPP_FILES:%=vendor/couchapp/_attachments/%.js)
LOCAL=views/lib/fraction.js views/lib/sprintf-0.7-beta1.js sharebill.js
JS_FILES=config.js $(JQUERY) $(BOOTSTRAP) $(COUCHAPP) $(LOCAL)

CSS_FILES=vendor/bootstrap/_attachments/css/bootstrap.css _attachments/style/local.css

SRCS=$(shell find src/{$(COPY_DIRS)}) $(COPY_FILES)
TRGS=$(SRCS:src/%=%)

release: $(TRGS:%=release/%) release/_attachments/all.js release/_attachments/style/all.css

release/%: src/%
	mkdir -p `dirname $@`
	if [ ! -d $< ] ; then cp $< $@ ; fi

clean:
	rm -rf release .intermediate

remake: clean release

.PHONY: clean remake


release/_attachments/all.js: $(JS_FILES:%.js=.intermediate/%.min.js)
	mkdir -p `dirname $@`
	cat $(JS_FILES:%.js=.intermediate/%.min.js) > $@

.intermediate/%.min.js: src/%.js
	mkdir -p `dirname $@`
	uglifyjs -nc --unsafe -o $@ $<

.intermediate/%.min.js: .intermediate/%.js
	mkdir -p `dirname $@`
	uglifyjs -nc --unsafe -o $@ $<


release/_attachments/style/all.css: $(CSS_FILES:%=src/%)
	mkdir -p `dirname $@`
	cat $(CSS_FILES:%=src/%) > $@
