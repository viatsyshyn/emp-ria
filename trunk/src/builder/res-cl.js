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
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/\./g, '\\.');
    }

    var contents = File.readFile(path);

    var regex = new RegExp(escape(prefix || '\'') + '([^' + escape(suffix || '\'') + ']+\.[a-z0-9]+)' + escape(suffix || '\''), 'gi');

    Env.print('Searching ' + path + ' with ' + regex);

    var count = 0;
    contents = contents.replace(regex, function (match, path) {
        //Env.print('Match: ' + path);
        if (File.exists(path)) {
            var crc = Hash.crc32(path);
            
            Env.print('Match: "' + match + '", CRC32: ' + crc);
            count++;
            
            var parts = path.split('.');
            var ext = parts.pop();
            var name = parts.join('.');
            return match.replace(path, name + '.' + crc.toString(36) + '.' + ext);
        }

        return match;
    });

    File.saveUtf8File(path, contents);
    Env.print("Processed " + path + ", files: " + count);
}