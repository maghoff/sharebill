var React = require('react/addons');
var moment = require('moment');
var Sheet = require('./sheet');

function generateId() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function blankTransactionDocument() {
	return {
		_id: generateId(),
		meta: {
			timestamp: moment.utc().format("YYYY-MM-DDTHH:mm:ss.SSS\\Z"),
			description: "",
		},
		transaction: {
			debets: {},
			credits: {}
		}
	};
}

function keepInView(domNode) {
	var request;

	function scrollIntoView() {
		var w = {
			top: window.scrollY,
			bottom: window.scrollY + window.innerHeight
		};
		var n = {
			top: domNode.offsetTop,
			bottom: domNode.offsetTop + domNode.clientHeight
		};
		if (n.top < w.top) window.scroll(window.scrollX, n.top);
		else if (n.bottom > w.bottom) window.scroll(window.scrollX, n.bottom-window.innerHeight);
	}

	function scroller() {
		scrollIntoView();
		request = requestAnimationFrame(scroller);
	}

	scroller();

	return {
		stop: function () {
			cancelAnimationFrame(request);
			scrollIntoView();
		}
	};
}

var EntrySheets = React.createClass({
	getInitialState: function () {
		return {
			sheets: []
		};
	},
	addSheet: function (entryType) {
		var document = blankTransactionDocument();
		this.setState({
			sheets: React.addons.update(
				this.state.sheets,
				{$unshift: [{type: entryType, entry: document}]}
			)
		}, function () {
			// FIXME .parentNode.parentNode seems a bit random
			var scroller = keepInView(this.refs[document._id].getDOMNode());
			setTimeout(function () {
				this.refs[document._id].focus();
				scroller.stop();
			}.bind(this), 500);
		}.bind(this));
	},
	removeSheet: function (index) {
		this.setState({
			sheets: React.addons.update(
				this.state.sheets,
				{$splice: [[index, 1]]}
			)
		});
	},
	render: function () {
		return React.createElement(
			React.addons.CSSTransitionGroup, { transitionName: "entry-sheet", component: "div" },
			this.state.sheets.map(function (sheet, index) {
				var deleteCallback = function () { this.removeSheet(index); }.bind(this);
				return React.createElement(
					Sheet, {
						key: sheet.entry._id,
						ref: sheet.entry._id,
						type: sheet.type,
						document: sheet.entry,
						deleteMe: deleteCallback,
						didSave: deleteCallback,
						instanceConfig: this.props.instanceConfig
					}
				);
			}.bind(this))
		)
	}
});

module.exports = function (buttons, target, instanceConfig) {
	var entrySheets = React.render(React.createElement(EntrySheets, { instanceConfig: instanceConfig }), target);

	buttons.addEventListener('click', function (ev) {
		if (!ev.target.classList.contains('entry_link')) return;
		entrySheets.addSheet(ev.target.getAttribute("data-type"));
	});
};
