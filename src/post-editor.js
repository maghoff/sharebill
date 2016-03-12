var React = require('react/addons');
var request = require('browser-request');
var FreeformEntry = require('./freeform');

var PostEditor = React.createClass({
	getInitialState: function () {
		return {
			id: this.props.document._id,
			rev: this.props.document._rev,
			formState: FreeformEntry.stateFrom(this.props.document),
			saving: false,
			deleted: false,
			error: null,
			notice: null
		};
	},
	submit: function (valid, ev) {
		ev.preventDefault();
		ev.stopPropagation();

		if (!valid) return;

		this.setState({ saving: true });

		var doc = this.refs.entryForm.stateAsDocument();
		doc._id = this.state.id;
		doc._rev = this.state.rev;

		request.put({
			uri: "post/" + doc._id,
			json: true,
			body: doc
		}, function (err, xhr, body) {
			if (err) {
				this.setState({ saving: false, error: err.toString() });
				return;
			}
			if (body.error) {
				this.setState({ saving: false, error: body.reason });
				return;
			}
			this.setState({
				saving: false,
				id: body.id,
				rev: body.rev
			});
			this.props.didSave();
		}.bind(this));
	},
	deleteDocument: function (ev) {
		ev.preventDefault();
		ev.stopPropagation();

		this.setState({ saving: true });

		var doc = this.refs.entryForm.stateAsDocument();
		doc._id = this.state.id;
		doc._rev = this.state.rev;

		request(
			{
				method: "DELETE",
				uri: "post/" + doc._id,
				json: true,
				headers: { "If-Match": doc._rev }
			},
			function (err, xhr, body) {
				if (err) {
					this.setState({ saving: false, error: err.toString() });
					return;
				}
				if (body.error) {
					this.setState({ saving: false, error: body.reason });
					return;
				}
				this.setState({
					deleted: true,
					saving: false,
					notice: "Document has been deleted",
					id: body.id,
					rev: body.rev
				});
			}.bind(this)
		);
	},
	reset: function (ev) {
		ev.preventDefault();
		ev.stopPropagation();

		this.setState({ formState: FreeformEntry.stateFrom(this.props.document) });
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
		var entryClass = FreeformEntry;

		var valid_form = entryClass.isValidState(this.state.formState);

		return React.createElement("div", { className: "section" },
			React.createElement('form',
				{
					onSubmit: this.submit.bind(this, valid_form && !this.state.saving)
				},
				React.createElement(entryClass, {
					ref: "entryForm",
					instanceConfig: this.props.instanceConfig,
					state: this.state.formState,
					saving: this.state.saving || this.state.deleted,
					setState: this.setFormState
				}),
				this.state.error ? React.createElement("div", { className: "alert alert-error" }, this.state.error) : "",
				this.state.notice ? React.createElement("div", { className: "alert alert-notice" }, this.state.notice) : "",
				React.createElement("div", null,
					React.createElement("button", {
						className: "btn btn-primary",
						type: "submit",
						disabled: (valid_form && !this.state.saving && !this.state.deleted) ? "" : "disabled"
					}, "Save"),
					" ",
					React.createElement("button", {
						className: "btn",
						type: "reset",
						disabled: (this.state.saving || this.state.deleted) ? "disabled" : "",
						onClick: this.reset,
					}, "Reset"),
					" ",
					React.createElement("button", {
						className: "btn btn-danger",
						type: "button",
						disabled: (this.state.saving || this.state.deleted) ? "disabled" : "",
						onClick: this.deleteDocument
					}, "Delete")
				)
			)
		);
	}
});

function initPostEditor(domNode, doc, instanceConfig) {
	React.render(
		React.createElement(
			PostEditor, {
				document: doc,
				deleteMe: function () {},
				didSave: function () {},
				instanceConfig: instanceConfig
			}
		),
		domNode
	);
}

module.exports = initPostEditor;
module.exports.PostEditor = PostEditor;
