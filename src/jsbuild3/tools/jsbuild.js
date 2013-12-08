var path = require("path");
var fs = require("fs");
var vm = require("vm");
var sys = require("util");
var FFI = require("ffi");

var isWin32 = process.platform == 'win32';
console.info('Platform: ' + process.platform + '/' + process.arch);

var execSync = function(process) {
  var run;
  if (isWin32) {
      var libPath = path.resolve(__dirname, "WinSyncExec." + process.arch + ".dll");
      console.info('Loading Win32 lib: ' + libPath);
      var dll = FFI.Library(libPath, {
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
}(process);

var JsBuild3 = vm.createContext({
    sys           : sys,
    console       : console,
    require       : require,
    Path          : path,
    fs            : fs,
    UglifyJS      : require("uglify-js"),
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
        "../lib/config.js",
        "../lib/jsbuild3.js",
        "../framework/base/0.common.js",
        "../framework/base/5.annotations.js",
        "../framework/base/5.delegates.js",
        "../framework/base/5.enum.js",
        "../framework/base/5.identifier.js",
        "../framework/base/6.interface.js",
        "../framework/base/8.class.js",
        "../framework/base/9.arrayof.js",
        "../framework/base/9.classof.js",
        "../framework/base/9.exception.js",
        "../framework/base/9.implementerof.js",
        "../framework/syntax/type-hints.js",
        "../lib/syntax/tokenizer.js",
        "../framework/syntax/registry.js",
        "../framework/syntax/parser2.js",
        "../framework/syntax/annotations.js",
        "../framework/syntax/class.js",
        "../framework/syntax/delegate.js",
        "../framework/syntax/exception.js",
        "../framework/syntax/interface.js",
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
        "../lib/assets/jade.js",
        "../lib/assets/txt.js",
        "../lib/assets/json.js"
        ])
    .map(function(file){
            return path.join(path.dirname(fs.realpathSync(__filename)), file);
        })
    .forEach(load_global);

// XXX: perhaps we shouldn't export everything but heck, I'm lazy.
/*for (var i in JsBuild3) {
    if (JsBuild3.hasOwnProperty(i)) {
        console.info('global exports: ', i);
        exports[i] = JsBuild3[i];
    }
}*/

exports.PluginConfiguration = JsBuild3.PluginConfiguration;
exports.ModuleConfiguration = JsBuild3.ModuleConfiguration;
exports.Configuration = JsBuild3.Configuration;
exports.compile = JsBuild3.compile.bind(JsBuild3);
