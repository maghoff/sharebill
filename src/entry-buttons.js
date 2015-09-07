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

module.exports = function (buttons, target, instanceConfig) {
	buttons.addEventListener('click', function (ev) {
		if (!ev.target.classList.contains('entry_link')) return;

		var box = document.createElement("div");
		box.classList.add("section");
		target.appendChild(box);

		var entry = {
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

		function deleteCallback() {
			box.parentNode.removeChild(box);
		}

		var component = entryTypes[ev.target.getAttribute("data-type")](box, entry, instanceConfig, deleteCallback);

		component.focus();
	});
};
