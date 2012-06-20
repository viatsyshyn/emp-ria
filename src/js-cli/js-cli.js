var Env = {
  IncludePath: [],
  load: function (path) {
    if ((new java.io.File(path)).exists()) 
      return this(path);

    for each(var root in Env.IncludePath) {
      if ((new java.io.File(root + '/' + path)).exists()) 
        return this(root + '/' + path);
    }
    
    throw Error ('Failed to load "' + path + '": File not found. Include path: "' + Env.IncludePath.join(';') + '"');
  }.bind(this['load']),
  
  print:this['print']
};

try {
  (function (args) {
    "use strict";
    
    function absPath(fileObj) {
      if (typeof fileObj === "string")
        fileObj = new java.io.File(fileObj);

      return (fileObj.getAbsolutePath() + "").replace(/\\/g, "/");
    }

    Env.RhinoRoot = absPath(args.shift());
    Env.IncludePath.unshift(Env.RhinoRoot + '/library');
    
    Env.CurrentDirectory = absPath(args.shift());
    Env.IncludePath.unshift(Env.CurrentDirectory);

    do {
        var arg = args.shift();
        if (arg == '--include') {
            var includePath = args.shift();
            for each(var path in includePath.split(';').reverse()) {
                Env.IncludePath.unshift(absPath(Env.CurrentDirectory + '/' + path));
            }
            continue;
        }

        args.unshift(arg);
        break;
    } while (true);

    var appModule = args.shift();
    Env.load(Env.CurrentDirectory + '/' + appModule);
    
    if (this['main'] === undefined) 
      throw Error('main() not found in "' + appModule + '"');
    
    return main.apply(this, args.slice());
  })([].slice.call(this['arguments']));
} catch (e) {
  Env.print(e.toString());
  Env.print(e.stack);
}