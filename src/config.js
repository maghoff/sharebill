var config = (function() {
    var opts = {};

    if (document.location.pathname.indexOf("_design") == -1) {
        opts.db = 'the_database';
        opts.design = 'the_design_document';
    }

    return opts;
}());
