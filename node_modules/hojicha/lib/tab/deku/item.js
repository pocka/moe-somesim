'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _deku = require('deku');

var render = function render(_ref) {
	var props = _ref.props;
	var children = _ref.children;

	var checkbox_id = 'hojicha--tab--item--radio--' + props.name;
	return (0, _deku.element)(
		'div',
		{ 'class': 'hojicha--tab--item' },
		(0, _deku.element)('input', { name: props.group, type: 'radio', checked: props.default, 'class': 'hojicha--tab--item--radio', id: checkbox_id }),
		(0, _deku.element)(
			'label',
			{ 'class': 'hojicha--tab--item--label', 'for': checkbox_id },
			props.title
		),
		(0, _deku.element)(
			'div',
			{ 'class': 'hojicha--tab--item--panel' },
			(0, _deku.element)(
				'div',
				{ 'class': 'hojicha--tab--item--contents' },
				children
			)
		)
	);
}; /** @jsx element */


exports.default = render;
