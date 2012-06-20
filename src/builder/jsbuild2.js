"use strict";

/**
 * @class PluginConfiguration
 * @constructor
 * @param {String} path
 * @param {Configuration} config
 */
function PluginConfiguration(path, config) {
  this.path = File.absPath(path);
  this.config = config;
}

PluginConfiguration.prototype = {
  init: function () {
    try {
      Env.load(this.path);
    } catch (e) {
      throw Error('Can not load plugin from "' + this.path + '" due: ' + e);
    }
  }
};

/**
 * @class ModuleConfiguration
 * @constructor
 * @param {Object} params
 * @param {Configuration} config
 */
function ModuleConfiguration(params, config) {
  this.prepend = [].slice.call(params.prepend || []);
  this.exclude = [].slice.call(params.exclude || []);
  this.options = Lang.mixin({}, params.options || {});
  this.name = params.name;
  this.inFile = params['in'];
  this.outFile = params['out'];
  this.appDir = params.appDir ? File.absPath(config.getBasePath() + (params.appDir || 'app')) + '/' : null;
  this.assetDir = params.assetDir ? File.absPath(config.getBasePath() + (params.assetDir || 'assets')) + '/' : null;
}

ModuleConfiguration.prototype = {
  /** @returns {String[]} */
  getPrepend: function () { return this.prepend; },
  /** @returns {String[]} */
  getExclude: function () { return this.exclude; },
  /** @returns Object */
  getOptions: function () { return this.options; },
  /** @returns String */
  getName: function () { return this.name; },
  /** @returns String */
  getInFile: function () { return this.inFile; },
  /** @returns String */
  getOutFile: function () { return this.outFile; },
  /** @returns String */
  getAppDir: function () { return this.appDir; },
  /** @returns String */
  getAssetDir: function () { return this.assetDir; }
};

/**
 * @class Configuration
 * @constructor
 * @param {String} path
 * @param {Object} externalConfig
 */
function Configuration(path, externalConfig) {
  this.path = path;
  var config = JSON.parse(File.readFile(path));

  this.basePath = File.parent(path) + '/';

  this.appDir = File.absPath(this.basePath + (config.appDir || 'app')) + '/';
  this.assetDir = File.absPath(this.basePath + (config.assetDir || 'assets')) + '/';

  this.options = Lang.mixin({}, config.options || {});
  this.moduleConfig = null;
  this.externalConfig = Lang.mixin({}, externalConfig || {});

  var that = this;
  this.plugins = (config.plugins || []).map(function (plugin) { return new PluginConfiguration(that.basePath + plugin, that); });
  this.modules = (config.modules || []).map(function (module) { return new ModuleConfiguration(module, that); });
}

Configuration.prototype = {
  /** @returns String */
  getBasePath: function () { return this.basePath; },
  /** @returns String */
  getAppDir: function () { return this.moduleConfig.getAppDir() || this.appDir; },
  /** @returns String */
  getAssetDir: function () { return this.moduleConfig.getAssetDir() || this.assetDir; },
  /** @returns ModuleConfiguration[] */
  getModules: function () { return [].slice.call(this.modules); },
  /** @returns PluginConfiguration[] */
  getPlugins: function () { return [].slice.call(this.plugins); },
  /** @returns String */
  resolveFilePath: function (name) { return File.absPath(this.getAppDir() + name); },
  /** @returns String */
  resolveAssetPath: function (name) { return File.absPath(this.getAssetDir() + name); },
  /**
   * @param {String} name
   * @returns Object
   */
  getPluginConfiguration: function (name) {
    var cfg = Lang.mixin(Lang.mixin(Lang.mixin({}, this.externalConfig), this.moduleConfig.getOptions() || {}), this.options);
    return cfg.hasOwnProperty(name) ? cfg[name] : {};
  },
  /** @param {ModuleConfiguration} config */
  setModuleConfig: function (config) { this.moduleConfig = config; }
};

/**
 * @param {String} path
 * @param {Array} ast
 * @param {CodeBlockDescriptor[]} deps
 */
function CodeBlockDescriptor(path, ast, deps) {
  /** @var String */
  this.path = path;
  /** @var Array */
  this.ast = ast;
  /** @var CodeBlockDescriptor[] */
  this.deps = [].slice.call(deps);
}

CodeBlockDescriptor.prototype = {
  /**
   * @returns Array
   */
  getGluedAst: function () {
    var memory = {};
    var flattened = [];

    /**
     * @param {CodeBlockDescriptor} module
     */
    (function topologicalSort(module) {
      if (memory.hasOwnProperty(module.path)) return;
      module.deps.forEach(topologicalSort);
      memory[module.path] = true;
      flattened.push(module);
    })(this);

    return ['toplevel', Array.prototype.concat.apply([], flattened.map(function (module) {
      return module.ast[1];
    }))];
  }
};

var JsBuild = (function () {
  var fileHandlers = {};
  var depsCollectors = [];
  var astPreProcessors = [];
  var astPostProcessors = [];

  var JsBuild = {
    /**
     * @param {String} ext
     * @param {Function} handler
     */
    setFileHandler:function (ext, handler) { fileHandlers[ext] = handler; },
    /**
     * @param {Function} collector
     */
    addDepsCollector:function (collector) { depsCollectors.unshift(collector); },
    /**
     * @param {Function} processor
     */
    addAstPreProcessor:function (processor) { astPreProcessors.unshift(processor); },
    /**
     * @param {Function} processor
     */
    addAstPostProcessor:function (processor) { astPostProcessors.unshift(processor); },
    /**
     *
     * @param {String} path
     * @param {Configuration} config
     * @private
     * @returns CodeBlockDescriptor
     */
    loadModule:function (path, config, memorization) {
      if (memorization.hasOwnProperty(path))
        return memorization[path];

      var ext = File.getExtension(path);
      if (!fileHandlers.hasOwnProperty(ext))
        throw Error('Can not load "' + path + '". No file handler found for ' + ext);

      if (!File.exists(path))
        throw Error('Can not find path "' + path + '"');

      try {
        var content = fileHandlers[ext](File.readFile(path), config, path);
      } catch (e) {
        throw Error('Can not load content of "' + path + '" due: ' + e);
      }

      try {
        var ast = UglifyJs.parse(content);
      } catch (e) {
        throw Error('Can not parse content of "' + path + '" due: ' + e);
      }

      var deps = [];
      depsCollectors.forEach(function (collector) {
        deps = [].concat.apply(deps, collector(ast, config, path));
      });

      deps = deps.map(function (dep) {
        return JsBuild.loadModule(dep, config, memorization);
      });

      return memorization[path] = new CodeBlockDescriptor(path, ast, deps);
    },
    /**
     *
     * @param {String} path
     * @param {Configuration} config
     * @returns string
     */
    compile:function (path, config) {
      var code = this.loadModule(path, config, {});

      var ast = code.getGluedAst();
      astPreProcessors.forEach(function (processor) { ast = processor(ast, config) || ast; });

      var uglifyjsParams = config.getPluginConfiguration('uglifyjs');
      if (uglifyjsParams.mangle === true)
        ast = UglifyJs.ast_mangle(ast, !!uglifyjsParams.mangle_toplevel);
      if (uglifyjsParams.squeeze === true)
        ast = UglifyJs.ast_squeeze(ast, uglifyjsParams.squeeze_options || {});
      if (uglifyjsParams.squeeze_more === true)
        ast = UglifyJs.ast_squeeze_more(ast);

      astPostProcessors.forEach(function (processor) { ast = processor(ast, config) || ast; });
      return UglifyJs.gen_code(ast, uglifyjsParams.pretty || false);
    },
    filterFunctionCallStatement: function (ast, fnName, handler) {
      ast[1] = ast[1].filter(function(ast) {
        if (ast[0] == 'stat' && ast[1][0] == 'call' && ast[1][1][0] == 'name' && ast[1][1][1] == fnName)
          return !handler(ast);
        return true;
      });
      return ast;
    }
  };

  JsBuild.setFileHandler('js', function JsFileHandler(content, config) { return content; });

  JsBuild.addAstPreProcessor(function (ast, config) {
    ast[1] = ast[1].filter(function(ast) { return !(ast[0] == 'stat' && ast[1][0] == 'string' && ast[1][1] == 'use strict'); });
    return ast;
  });

  return JsBuild;
})();

Env.load('api/file.js');
Env.load('api/lang.js');
Env.load('api/json2.js');
Env.load('uglifyjs.js');

function main(configPath, jsonConfig) {
  
  try {
    var externalConfig = jsonConfig ? JSON.parse(jsonConfig) : {};
  } catch (e) { 
    throw new Error("Bad external config provided: " + args[3]);
  }

  try {
    configPath = configPath || 'jsbuild.json';
    configPath = File.absPath(File.exists(configPath) ? configPath : Env.CurrentDirectory + '/' + configPath);
    var config = new Configuration(configPath, externalConfig);
  } catch (e) {
    throw new Error("Build file " + configPath + " is malformed: " + e);
  }

  config.getPlugins().forEach(/** @param {PluginConfiguration} plugin */ function (plugin) {
    plugin.init();
  });

  config.getModules().forEach(/** @param {ModuleConfiguration} module */ function (module) {
    config.setModuleConfig(module);

    Env.print('Processing: ' + module.getName());
    var inPath = config.resolveFilePath(module.getInFile());

    var fileContents = [];
    module.getPrepend().forEach(function (prepend) {
      var path = config.resolveFilePath(prepend);
      fileContents.push('/** @path ' + prepend + ' */');
      fileContents.push(File.readFile(path));
    });

    fileContents.push(JsBuild.compile(inPath, config));

    var outPath = File.absPath(config.getBasePath() + module.getOutFile());

    var jsbuildParams = config.getPluginConfiguration("jsbuild");
    File.saveUtf8File(outPath, fileContents.join(jsbuildParams.separator || ';'));
  });
}
