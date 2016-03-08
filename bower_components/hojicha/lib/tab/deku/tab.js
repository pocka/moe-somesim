"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _deku = require("deku");

var render = function render(_ref) {
	var props = _ref.props;
	var children = _ref.children;

	return (0, _deku.element)(
		"div",
		{ id: "hojicha--tab--container--" + props.name, "class": "hojicha--tab--container" },
		children
	);
}; /**@jsx element*/


exports.default = render;
