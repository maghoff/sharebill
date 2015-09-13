var React = require('react/addons');
var request = require('browser-request');

var entryClasses = {
	"freeform": require('./freeform')
};

var Sheet = React.createClass({
	getInitialState: function () {
		return {
			id: this.props.document._id,
			rev: this.props.document._rev,
			formState: entryClasses[this.props.type].stateFrom(this.props.document),
			saving: false,
			error: null
		};
	},
	submit: function (valid, ev) {
		ev.preventDefault();
		ev.stopPropagation();

		if (!valid) return;

		this.setState({ saving: true });

		var document = this.refs.entryForm.stateAsDocument();
		request.put({
			uri: "post/" + document._id,
			json: true,
			body: document
		}, function (err, xhr, body) {
			if (err) {
				this.setState({ saving: false, error: err.toString() });
				return;
			}
			if (body.error) {
				this.setState({ saving: false, error: body.reason });
				return;
			}
			/*this.setState({
				saving: false,
				_id: body.id,
				_rev: body.rev
			});*/
			this.props.deleteMe();
		}.bind(this));
	},
	focus: function () {
		this.refs.entryForm.focus();
	},
	setFormState: function (change) {
		this.setState(React.addons.update(
			this.state,
			{$merge: {
				formState: React.addons.update(this.state.formState, {$merge: change})
			} }
		));
	},
	render: function () {
		var entryClass = entryClasses[this.props.type];

		var valid_form = entryClass.isValidState(this.state.formState);

		return React.createElement("div", { className: "section" },
			React.createElement("h2", null, "Add a post"),
			React.createElement('form',
				{
					onSubmit: this.submit.bind(this, valid_form && !this.state.saving)
				},
				React.createElement(entryClass, {
					ref: "entryForm",
					instanceConfig: this.props.instanceConfig,
					state: this.state.formState,
					saving: this.state.saving,
					setState: this.setFormState
				}),
				this.state.error ? React.createElement("div", { className: "alert alert-error" }, this.state.error) : "",
				React.createElement("div", null,
					React.createElement("button", {
						className: "btn btn-primary",
						type: "submit",
						disabled: (valid_form && !this.state.saving) ? "" : "disabled"
					}, "Add post"),
					" ",
					React.createElement("button", {
						className: "btn",
						type: "button",
						disabled: this.state.saving ? "disabled" : "",
						onClick: this.props.deleteMe
					}, "Cancel")
				)
			)
		);
	}
});

module.exports = Sheet;
