(function() {
    var s = [
        "/_utils/script/sha1.js",
        "/_utils/script/json2.js",
        "/_utils/script/jquery.js",
        "/_utils/script/jquery.couch.js",
        "vendor/couchapp/jquery.couch.app.js",
        "vendor/couchapp/jquery.couch.app.util.js",
        "vendor/couchapp/jquery.mustache.js",
        "vendor/couchapp/jquery.evently.js"
    ];

    var sc = "script", tp = "text/javascript", sa = "setAttribute", doc = document, ua = window.navigator.userAgent;
    for(var i=0, l=s.length; i<l; ++i) {
        if(ua.indexOf("Firefox")!==-1 || ua.indexOf("Opera")!==-1) {
            var t=doc.createElement(sc);
            t[sa]("src", s[i]);
            t[sa]("type", tp);
            doc.getElementsByTagName("head")[0].appendChild(t);
        } else {
            doc.writeln("<" + sc + " type=\"" + tp + "\" src=\"" + s[i] + "\"></" + sc + ">");
        }
    }
})();
