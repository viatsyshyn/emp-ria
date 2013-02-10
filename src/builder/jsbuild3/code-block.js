/**
 * Created with JetBrains WebStorm.
 * User: paladin
 * Date: 2/10/13
 * Time: 12:17 PM
 * To change this template use File | Settings | File Templates.
 */

(function (global) {

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

    global.CodeBlockDescriptor = CodeBlockDescriptor;

})(this);