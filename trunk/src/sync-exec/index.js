var FFI = require("ffi"),
    path = require('path');

var isWin32 = process.platform == 'win32',
    arch = process.arch;

//console.info('Platform: ' + process.platform + '/' + process.arch);

module.exports = function() {
    var run;
    if (isWin32) {
        var libPath = path.resolve(__dirname, "./win32/WinSyncExec." + arch + ".dll");
        //console.info('Loading Win32 lib: ' + libPath);
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
    }.bind(this);
}();
