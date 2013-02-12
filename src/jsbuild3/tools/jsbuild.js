var path = require("path");
var fs = require("fs");
var vm = require("vm");
var sys = require("util");

var JsBuild3 = vm.createContext({
    sys           : sys,
    console       : console,
    Path          : path,
    fs            : fs,
    UglifyJS      : require("../node_modules/uglify-js/tools/node")
});

function load_global(file) {
    file = path.resolve(path.dirname(module.filename), file);
    try {
        var code = fs.readFileSync(file, "utf8");
        return vm.runInContext(code, JsBuild3, file);
    } catch(ex) {
        // XXX: in case of a syntax error, the message is kinda
        // useless. (no location information).
        sys.debug("ERROR in file: " + file + " / " + ex);
        process.exit(1);
        return null;
    }
}

    ([
        "../lib/jsbuild3.js",
        "../lib/syntax/compiler.js",
        "../lib/syntax/ns.js",
        "../lib/syntax/identifier.js",
        "../lib/syntax/enum.js",
        "../lib/syntax/class.js"
        ])
    .map(function(file){
            return path.join(path.dirname(fs.realpathSync(__filename)), file);
        })
    .forEach(load_global);

// XXX: perhaps we shouldn't export everything but heck, I'm lazy.
for (var i in JsBuild3) {
    if (JsBuild3.hasOwnProperty(i)) {
        exports[i] = JsBuild3[i];
    }
}
