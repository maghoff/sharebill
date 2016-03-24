function (head, req) {
	var ddoc = this;
	var SchemeNumber = require("views/lib/schemeNumber").SchemeNumber;
	var fractionParser = require("views/lib/fractionParser");

	function parseRFC3339(dString) {
		var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;

		var that = new Date();
		if (dString.toString().match(new RegExp(regexp))) {
			var d = dString.match(new RegExp(regexp));
			var offset = 0;

			that.setUTCDate(1);
			that.setUTCFullYear(parseInt(d[1],10));
			that.setUTCMonth(parseInt(d[3],10) - 1);
			that.setUTCDate(parseInt(d[5],10));
			that.setUTCHours(parseInt(d[7],10));
			that.setUTCMinutes(parseInt(d[9],10));
			that.setUTCSeconds(parseInt(d[11],10));
			if (d[12])
				that.setUTCMilliseconds(parseFloat(d[12]) * 1000);
			else
				that.setUTCMilliseconds(0);
			if (d[13] != 'Z') {
				offset = (d[15] * 60) + parseInt(d[17],10);
				offset *= ((d[14] == '-') ? -1 : 1);
				that.setTime(that.getTime() - offset * 60 * 1000);
			}
		} else {
			that.setTime(Date.parse(dString));
		}
		return that;
	};

	function forEachRow(firstRow, generator, body) {
		var row;
		if (firstRow) {
			body(firstRow);
			while (row = generator()) body(row);
		}
	}


	var path = require("vendor/couchapp/lib/path").init(req);
	var Atom = require("vendor/couchapp/lib/atom");
	var Mustache = require("mustache");


	/* req object example:
	{
		"info":{
			"db_name":"sharebill-herjing",
			"doc_count":227,
			"doc_del_count":14,
			"update_seq":404,
			"purge_seq":0,
			"compact_running":false,
			"disk_size":21422174,
			"instance_start_time":"1333664364808456",
			"disk_format_version":5,
			"committed_update_seq":404
		},
		"id":null,
		"uuid":"27ed40b50c5af6d3657b5bcb44023375",
		"method":"GET",
		"requested_path":[
			"sharebill-herjing",
			"_design",
			"sharebill",
			"_list",
			"account_posts",
			"user?reduce=false&amp;startkey=[\"BRB\"]&amp;endkey=[\"BRB\",{}]&amp;limit=1"
		],
		"path":["sharebill-herjing","_design","sharebill","_list","account_posts","user"],
		"query":{"reduce":"false","startkey":["BRB"],"endkey":["BRB",{}],"limit":"1"},
		"headers":{
			"Accept":
			"Host":"10.0.0.201:5984",
			"User-Agent":"curl/7.22.0 (x86_64-pc-linux-gnu) libcurl/7.22.0 OpenSSL/1.0.1 zlib/1.2.3.4 libidn/1.23 librtmp/2.3"
		},
		"body":"undefined",
		"peer":"10.0.0.22",
		"form":{},
		"cookie":{},
		"userCtx":{
			"db":"sharebill-herjing",
			"name":null,
			"roles":[]
		},
		"secObj":{}
	}
	*/

	function formatTransaction(doc) {
		function make_dict_array(d) {
			var arr = [];
			for (var key in d) {
				arr.push({key: key, value: d[key]});
			}
			return arr;
		};

		function sum_values(d) {
			var sum = new SchemeNumber("0");
			for (var key in d) {
				sum = SchemeNumber.fn["+"](sum, fractionParser(d[key]));
			}
			return sum.toString();
		};

		doc.transaction.debit_array = make_dict_array(doc.transaction.debets);
		doc.transaction.sum_debits = sum_values(doc.transaction.debets);
		doc.transaction.credit_array = make_dict_array(doc.transaction.credits);
		doc.transaction.sum_credits = sum_values(doc.transaction.credits);

		doc.a = make_dict_array(doc._attachments);

		doc.title = ddoc.instance_config.title;
		doc.cdn_base = ddoc.instance_config.cdn_base;
		doc.all_css_sum = ddoc.sums.all_css_sum;
		doc.all_js_sum = ddoc.sums.all_js_sum;

		return Mustache.to_html(ddoc.template.readonlypost, doc);
	}

	var idPath = path.makePath(path.concatArgs(path.concatArgs([''], req.path), [req.query]));
	var selfPath = idPath;

	provides("atom", function() {
		// we load the first row to find the most recent change date
		var firstRow = getRow();

		// generate the feed header
		var feedHeader = Atom.header({
			updated : (firstRow ? new Date(parseRFC3339(firstRow.value.meta.timestamp)) : new Date()),
			title : ddoc.instance_config.title,
			feed_id : path.absolute(idPath),
			feed_link : path.absolute(selfPath),
		});

		// send the header to the client
		send(feedHeader);

		forEachRow(firstRow, getRow, function (row) {
			// generate the entry for this row
			var feedEntry = Atom.entry({
				entry_id : path.absolute('/'+encodeURIComponent(req.info.db_name)+'/'+encodeURIComponent(row.id)),
				title : row.value.meta.description,
				content : formatTransaction(row.value),
				updated : new Date(parseRFC3339(row.value.meta.timestamp)),
				author : "",
				alternate : path.absolute(path.show('freeform', row.id))
			});
			// send the entry to client
			send(feedEntry);
		});

		// close the loop after all rows are rendered
		return "</feed>";
	});
}
