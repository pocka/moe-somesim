var test = require('tape'),
    crel = require('crel'),
    naturalSelection = require('../'),
    supportedTypes = ['text', 'search', 'tel', 'url', 'password'],
    unsupportedTypes = ['number', 'email', 'time', 'color', 'month', 'range', 'date'];

function testUnsupportedElement(element){
    test(element.type, function(t){
        t.plan(3);

        var selectionStart;


        t.ok(naturalSelection(element) === false, 'Got correct result');

        try {
            selectionStart = element.selectionStart;
            t.fail('should error');
        }
        catch(error) {
            t.pass('selectionStart is not supported');
        }
        t.ok(selectionStart == null, 'selectionStart is undefined ');
    });
}

function testSupportedElement(element){
    test(element.type, function(t){
        t.plan(2);

        t.ok(naturalSelection(element), 'Got correct result');
        t.ok(element.selectionStart === 0, 'Element is supported');
    });
}

var supportedElements = supportedTypes.map(function(type){
    return crel('input', {type:type});
});

var unsupportedElements = unsupportedTypes.map(function(type){
    return crel('input', {type:type});
});

supportedElements.forEach(testSupportedElement);
unsupportedElements.forEach(testUnsupportedElement);
