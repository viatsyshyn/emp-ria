/*
 * {%= name %}
 * {%= homepage %}
 *
 * Copyright (c) {%= grunt.template.today('yyyy') %} {%= author_name %}
 * Licensed under the {%= licenses.join(', ') %} license{%= licenses.length === 1 ? '' : 's' %}.
 */

'use strict';

module.exports = function (grunt) {

  var Hash = require("../lib/crc32");

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  var CRC_ENCODE = 36;

  function escape(v) {
    return v
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\./g, '\\.');
  }

  function cacheBuster(name, content) {
    var crc = Hash.crc32(content, false).toString(CRC_ENCODE);

    grunt.log.debug('Match: "%s", CRC32: %s', name, crc);

    var parts = name.split('.');
    var ext = parts.pop();
    return parts.join('.') + '.' + crc + '.' + ext;
  }

  function buster(regex, basePath, file) {
    var contents = grunt.file.read(basePath + '/' + file);

    grunt.log.ok('Searching in "%s" with %s', file, regex);

    var count = 0;
    contents = contents.replace(regex, function (match, path) {
      //console.log('Match: "%s"', path);
      path = path.split('?').shift();

      if (grunt.file.exists(basePath + '/' + path)) {
          count++;
          return match.replace(path, cacheBuster(path, grunt.file.read(basePath + '/' + path)));
      }

      return match;
    });

    grunt.log.ok('Processed "%s", updates: %s', file, count);
    return contents;
  }

  grunt.registerMultiTask('cachebuster', 'Adds crc32 to references of css, js, images', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      prefix: '"',
      suffix: '"'
    });

    var prefix = options.prefix,
        suffix = options.suffix;

    var regex = new RegExp(escape(prefix || '\'') + '([^' + escape(suffix || '\'') + ']+\\.[a-z0-9]+)' + escape(suffix || '\''), 'gi');

    this.files.forEach(function (files) {
      var output = files.src.map(buster.bind(this, regex, files.cwd)).join();
      grunt.file.write(files.dest, output);
    });
  });

};
