COPY_DIRS=views,lists,shows,evently,vendor/couchapp/lib
COPY_FILES=_id couchapp.json language validate_doc_update.js .couchapprc rewrites.json

HTML_FILES=_attachments/index.html _attachments/posts.html template/freeform.html template/readonlypost.html template/user.html
HTML_DEPS=.intermediate/_attachments/all.js .intermediate/_attachments/style/all.css
HTML_DEP_SUM_FILES=$(HTML_DEPS:.intermediate/%=.intermediate/%.sum)

IMAGE_FILES=_attachments/style/Feed-icon.svg _attachments/style/brillant.png _attachments/style/ornate_13.png _attachments/img//glyphicons-halflings-white.png _attachments/img//glyphicons-halflings.png
IMAGE_SUM_SRCS=$(IMAGE_FILES)
IMAGE_SUM_FILES=$(IMAGE_SUM_SRCS:%=.intermediate/%.sum)

JQUERY=vendor/jquery/_attachments/jquery-1.7.2.js
BOOTSTRAP_FILES=bootstrap.min bootstrap-typeahead
BOOTSTRAP=$(BOOTSTRAP_FILES:%=vendor/bootstrap/_attachments/js/%.js)
COUCHAPP_FILES=sha1 json2 jquery.couch jquery.couch.app jquery.couch.app.util jquery.mustache jquery.evently
COUCHAPP=$(COUCHAPP_FILES:%=vendor/couchapp/_attachments/%.js)
LOCAL=views/lib/biginteger.js views/lib/schemeNumber.js views/lib/fractionParser.js views/lib/sprintf-0.7-beta1.js sharebill.js
JS_FILES=config.js $(JQUERY) $(BOOTSTRAP) $(COUCHAPP) $(LOCAL)

CSS_FILES=vendor/bootstrap/_attachments/css/bootstrap.css _attachments/style/local.css

FILES_FROM_COPY_DIRS=$(shell bash -c "find src/{$(COPY_DIRS)}")
TRGS_FROM_COPY_DIRS=$(FILES_FROM_COPY_DIRS:src/%=%)
SRCS=$(TRGS_FROM_COPY_DIRS) $(COPY_FILES)
TRGS=$(SRCS:%=release/%) $(HTML_FILES:%=release/%)

release: $(TRGS)

release/%: src/%
	mkdir -p `dirname $@`
	if [ ! -d $< ] ; then cp $< $@ ; fi

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
