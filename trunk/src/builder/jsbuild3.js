/**
 * Created with JetBrains WebStorm.
 * User: paladin
 * Date: 2/5/13
 * Time: 8:01 PM
 * To change this template use File | Settings | File Templates.
 */

Env.load('api/file.js');
Env.load('api/json2.js');

Env.load('jsbuild3/config.js');
Env.load('jsbuild3/code-block.js');

function main(configPath, jsonConfig) {
    "use strict";

    try {
        var externalConfig = jsonConfig ? JSON.parse(jsonConfig) : {};
    } catch (e) {
        throw new Error("Bad external config provided: " + jsonConfig);
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