var path = require("path");
var fs = require("fs");
var vm = require("vm");
var sys = require("util");
var FFI = require("ffi");

var execSync = function() {
  var isWin = !!process.platform.match(/^win/);

  var run;
  if (isWin) {
      var dll = FFI.Library(path.resolve(__dirname, "WinSyncExec.dll"), {
        "WinExecSync": ["int32", ["string", "string"]]
      });

      run = dll.WinExecSync;
  } else {
      var libc = new FFI.Library(null, {
          "system": ["int32", ["string"]]
      });

      run = function (cmd, wdir) {
          // set current dir
          libc.system(cmd);
          // read ret code
          return 0;
      }
  }

  return function(cmd, dir) {
    var code = run(cmd, dir);
    if (code) {
      throw Error("Error " + code + " executing " + cmd)
    }
  };
}();

var JsBuild3 = vm.createContext({
    sys           : sys,
    console       : console,
    Path          : path,
    fs            : fs,
    UglifyJS      : require("uglify-js"),
    Jade          : require("jade"),
    execSync      : execSync
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
        "../../framework/ria/base/0.common.js",
        "../../framework/ria/base/5.annotations.js",
        "../../framework/ria/base/5.delegates.js",
        "../../framework/ria/base/5.enum.js",
        "../../framework/ria/base/5.identifier.js",
        "../../framework/ria/base/6.interface.js",
        "../../framework/ria/base/8.class.js",
        "../../framework/ria/base/9.arrayof.js",
        "../../framework/ria/base/9.classof.js",
        "../../framework/ria/base/9.exception.js",
        "../../framework/ria/base/9.implementerof.js",
        "../../framework/ria/syntax/type-hints.js",
        "../lib/syntax/tokenizer.js",
        "../../framework/ria/syntax/registry.js",
        "../../framework/ria/syntax/parser2.js",
        "../../framework/ria/syntax/annotations.js",
        "../../framework/ria/syntax/class.js",
        "../../framework/ria/syntax/delegate.js",
        "../../framework/ria/syntax/exception.js",
        "../../framework/ria/syntax/interface.js",
        "../lib/syntax/compiler.js",
        "../lib/syntax/common.js",
        "../lib/syntax/ns.js",
        "../lib/syntax/identifier.js",
        "../lib/syntax/enum.js",
        "../lib/syntax/delegate.js",
        "../lib/syntax/annotation.js",
        "../lib/syntax/interface.js",
        "../lib/syntax/class.js",
        "../lib/syntax/exception.js",
        "../lib/syntax/post.js",
        "../lib/require/deps.js",
        "../lib/require/assets.js",
        "../lib/assets/jade.js"
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
