SRCS=$(shell find src/)

TRGS=$(SRCS:src/%=%)

release: $(TRGS:%=release/%)

release/%: src/%
	mkdir -p `dirname $@`
	if [ ! -d $< ] ; then cp $< $@ ; fi

clean:
	rm -rf release

remake: clean release

.PHONY: clean remake
