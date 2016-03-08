var test = require('tape')

var svgAttributeNS
test('require module', function (t) {
  svgAttributeNS = require('./')
  t.equal(typeof svgAttributeNS, 'function')
  t.end()
})

test('non-svg attributes', function (t) {
  t.equal(svgAttributeNS('href'), null)
  t.throws(function () {
    svgAttributeNS('yeah:nah')
  }, /prefix "yeah" is not supported by SVG\.$/)
  t.end()
})

test('svg attributes with null namespace', function (t) {
  t.equal(svgAttributeNS('cx'), null)
  t.end()
})

test('svg attributes with namespaces', function (t) {
  t.equal(svgAttributeNS('xlink:href'), 'http://www.w3.org/1999/xlink')
  t.equal(svgAttributeNS('xml:space'), 'http://www.w3.org/XML/1998/namespace')
  t.equal(svgAttributeNS('ev:event'), 'http://www.w3.org/2001/xml-events')
  t.end()
})
