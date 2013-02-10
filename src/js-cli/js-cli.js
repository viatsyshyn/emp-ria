var Env = {
  IncludePath: [],

  resolve: function (path) {
      if ((new java.io.File(path)).exists())
          return path;

      for each(var root in Env.IncludePath) {
          if ((new java.io.File(root + '/' + path)).exists())
              return root + '/' + path;
      }

      return null;
  },

  load: function (path) {
    var resolved = Env.resolve(path);
    if (!resolved)
      throw Error ('Failed to load "' + path + '": File not found. Include path: "' + Env.IncludePath.join(';') + '"');

    return this( resolved );
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
    
    function fileExists(fileObj) {
      if (typeof fileObj === "string")
        fileObj = new java.io.File(fileObj);

      return fileObj.exists();
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
                Env.IncludePath.unshift(absPath(fileExists(path) ? path : Env.CurrentDirectory + '/' + path));
            }
            continue;
        }

        args.unshift(arg);
        break;
    } while (true);

    var appModule = args.shift();
    Env.load(fileExists(appModule) ? appModule : Env.CurrentDirectory + '/' + appModule);
    
    if (this['main'] === undefined) 
      throw Error('main() not found in "' + appModule + '"');
    
    return main.apply(this, args.slice());
  })([].slice.call(this['arguments']));
} catch (e) {
  Env.print(e.toString());
  Env.print(e.stack);
}