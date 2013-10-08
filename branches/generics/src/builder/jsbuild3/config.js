/**
 * Created with JetBrains WebStorm.
 * User: paladin
 * Date: 2/10/13
 * Time: 12:14 PM
 * To change this template use File | Settings | File Templates.
 */

(function (global) {

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


    global.PluginConfiguration = PluginConfiguration;
    global.ModuleConfiguration = ModuleConfiguration;
    global.Configuration = Configuration;
})(this);