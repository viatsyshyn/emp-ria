(function(JsBuild, UglifyJs, Env) {
  JsBuild.addDepsCollector(
    /**
     * @param {Array} ast
     * @param {Configuration} config
     * @param {String} path
     * @returns Array
     */
    function HwaRequireDepsCollector(ast, config, path) {
      var params = config.getPluginConfiguration('hwa.base');
      var REQUIRE = params.REQUIRE || 'REQUIRE';
      var deps = [];
      JsBuild.filterFunctionCallStatement(ast, REQUIRE, function (ast) {
        var args = ast[1][2];
        if (args.length != 1) {
          throw Error('Expected call to ' + REQUIRE + ' with only one argument');
        }

        var dep = args[0];
          if (dep[0] === 'string') {
            var value = dep[1];
            if (!value.match(/\.js$/)) {
              value = value.replace(/\./gi, '/') + '.js';
            }
            deps.push(config.resolveFilePath(value));
            return true;
          } else {
            throw Error('Unsupported call to ' + REQUIRE + ' with ' + dep[0] + ' "' + dep[1] + '" in ' + path);
          }
      });

      return deps;
    });

  JsBuild.addAstPreProcessor(
    function (ast, config) {
      var w = UglifyJs.ast_walker(), walk = w.walk;
      return w.with_walkers({
        "call": function(expr, args) {
          if (expr[0] === 'name' && expr[1] === 'NAMESPACE' && args.length == 2 && args[0][0] == 'string') {
            // hwa.__API.defineNamespace
            return ['call', ['dot', ['dot', ['name', 'hwa'], '__API'], 'defineNamespace'], args];
          }
        }
      }, function() {
        return walk(ast);
      });
    });
})(JsBuild, UglifyJs, Env);