var config = (function() {
    var opts = {};

    if (document.location.pathname.indexOf("_design") == -1) {
        opts.db = 'sharebill';
        opts.design = 'sharebill';
    }

    return opts;
}());
