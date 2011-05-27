/*jslint es5: true, debug: true */
/*global jQuery */

(function($) {
	$.fn.accountsTable = function() {
		var self = this;

		var tableHtml = '<table>\
			<thead>\
				<tr>\
					<th rowspan="2">Date</th>\
					<th rowspan="2">Description</th>\
					<th colspan="2" class="user_super_header">Debit</th>\
					<th colspan="2" class="user_super_header">Credit</th>\
				</tr>\
				<tr id="user_headers">\
				</tr>\
			</thead>\
			<tbody>\
			</tbody>\
		</table>';

		self.empty();
		self.append($(tableHtml).children());

		self.addPost = function(post) {
		};
	};
}(jQuery));


/*global $, TestCase, assertEquals */

var AccountsTableTest = TestCase("AccountsTableTest");

AccountsTableTest.prototype.testTemplate = function() {
	/*:DOC += <table id="accountsTable"></table> */

	$("#accountsTable").accountsTable();

	assertEquals(1, $('tbody').length);
};

AccountsTableTest.prototype.testCanInsert = function() {
	/*:DOC += <table id="accountsTable"></table> */

	var acc = $("#accountsTable");
	acc.accountsTable();
	acc.addPost({
		debits: {
			"a": 5
		},
		credits: {
			"a": 5
		}
	});

	assertEquals(2, $('tr#user_headers>td').length);
	assertEquals("a", $('tr#user_headers>td').get(0).text());
};
