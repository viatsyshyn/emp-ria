var JsBuild3 = require("./tools/jsbuild"),
    fs = require('fs');

module.exports = function (configPath, modules) {
    "use strict";

    var CFG = new JsBuild3.Configuration(JSON.parse(fs.readFileSync(configPath)), configPath);

    for (var plugin in CFG.getPlugins()) {
        console.info(plugin.path);
    }

    var MODULES = modules;
    var toBuild = CFG.getModules();
    if (MODULES.length) {
        MODULES = MODULES.filter(function (_) {
            return _ != null;
        });
        toBuild = toBuild.filter(function (module) {
            return MODULES.indexOf(module.getName()) >= 0;
        });
    }

    toBuild.forEach(/** @param {ModuleConfiguration} module */ function (module) {
        CFG.setModuleConfig(module);

        console.info('Processing: ' + module.getName());

        var fileContents = JsBuild3.compile(module.getInFile() || module.getAppClass(), CFG, module.getAppClass());
        var outPath = Path.resolve(CFG.getBasePath() + module.getOutFile());

        var jsbuildParams = CFG.getPluginConfiguration("jsbuild");
        fs.writeFileSync(outPath, fileContents.join(jsbuildParams.separator || ';'), "utf-8");
    });

    console.info("done");
};