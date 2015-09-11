var React = require('react/addons');
var moment = require('moment');

var entryTypes = {
	"freeform": require('./freeform')
};

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

var Sheet = React.createClass({
	render: function () {
		return React.createElement("div", { className: "section" },
			React.createElement("h2", null, "Add a post"),
			this.props.children
		);
	}
});

function keepInView(domNode) {
	var request;

	function scroller() {
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

		request = requestAnimationFrame(scroller);
	}

	scroller();

	return {
		stop: function () {
			cancelAnimationFrame(request);
			scroller();
			cancelAnimationFrame(request);
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
			var scroller = keepInView(this.refs[document._id].getDOMNode().parentNode);
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
				var constructor = entryTypes[sheet.type];
				var deleteCallback = function () { this.removeSheet(index); }.bind(this);
				return React.createElement(
					Sheet, { key: sheet.entry._id },
					constructor(sheet.entry, this.props.instanceConfig, deleteCallback)
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

	if (!instanceConfig.isReady()) instanceConfig.whenReady(function () {
		entrySheets.setState({});
	});
};
