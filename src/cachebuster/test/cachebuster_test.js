'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.cachebuster = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  css: function(test) {
    test.expect(1);

      var actual = grunt.file.read('tmp/test.css');
      var expected = grunt.file.read('test/expected/test.css');
      test.equal(actual, expected, 'should describe what the default behavior is.');

      test.done();
  },
  html: function(test) {
    test.expect(1);

      var actual = grunt.file.read('tmp/test.html');
      var expected = grunt.file.read('test/expected/test.html');
      test.equal(actual, expected, 'should describe what the default behavior is.');

      test.done();
  },
  html_uri: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/test_uri.html');
    var expected = grunt.file.read('test/expected/test_uri.html');
    test.equal(actual, expected, 'should describe what the default behavior is.');

    test.done();
  },
  js: function(test) {
    test.expect(1);

      var actual = grunt.file.read('tmp/test.js');
      var expected = grunt.file.read('test/expected/test.js');
      test.equal(actual, expected, 'should describe what the default behavior is.');

      test.done();
  }
};
