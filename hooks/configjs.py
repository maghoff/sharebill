import os

FILE_TEMPLATES = {
"_attachments/config.js": """
var config = (function() {
    var opts = {};

    if (document.location.pathname.indexOf("_design") == -1) {
        opts.db = '%(db)s';
        opts.design = '%(design)s';
    }

    return opts;
}());
""",

"rewrites.json": """
[
    {
        "to": "index.html",
        "from": ""
    }, {
        "to": "vendor/*",
        "from": "vendor/*"
    }, {
        "to": "app/*",
        "from": "app/*"
    }, {
        "to": "config/*",
        "from": "config/*"
    }, {
        "to": "_view/*",
        "from": "_view/*"
    }, {
        "to": "../../",
        "from": "%(db)s"
    }, {
        "to": "../../*",
        "from": "%(design)s/*"
    }, {
        "to": "../../*",
        "from": "%(db)s/*"
    }, {
        "to": "*",
        "from": "*"
    }
]
"""
}

def hook(path, hooktype, dbs, **kwargs):
	assert(len(dbs) == 1)
	db = dbs[0]

	opts = {}

	opts["db"] = db.dbname

	ddocid = open(os.path.join(path, '_id')).read().strip()
	assert(ddocid.startswith("_design/"))
	opts["design"] = ddocid[8:]

	for filename, template in FILE_TEMPLATES.iteritems():
		with open(filename, 'w') as f:
			f.write(template % opts)
