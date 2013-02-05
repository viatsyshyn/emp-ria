/**
 * Created with JetBrains WebStorm.
 * User: paladin
 * Date: 2/5/13
 * Time: 8:33 PM
 * To change this template use File | Settings | File Templates.
 */

Env.load('api/file.js');
Env.load('api/json2.js');
Env.load('api/hash.js');

function main(path, prefix, suffix) {
    "use strict";

    function escape(v) {
        return v
            .replace(/\(/gi, '\\(')
            .replace(/\)/gi, '\\)')
            .replace(/\./gi, '\\.')
            .replace(/'/gi,  '\\\'');
    }

    var contents = File.readFile(path);

    var regex = new RegExp(escape(prefix || '') + '([a-z0-9\.-_\/]+\.[a-z0-9]+)' + escape(suffix || ''), 'gi');

    contents = contents.replace(regex, function (match, path) {
        if (File.exists(path)) {
            var crc = Hash.crc32(path);
            var parts = path.split('.');
            var ext = parts.pop();
            var name = parts.join('.');
            return (prefix || '') + name + '.' + crc + '.' + ext + (suffix || '');
        }

        return match
    });

    Env.print(contents);
}