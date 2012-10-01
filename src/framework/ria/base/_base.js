/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 14.09.12
 * Time: 21:45
 * To change this template use File | Settings | File Templates.
 */

ria = ria || {};
ria.__API = ria.__API || {};

(function () {
    "use strict";

    function TypeOf(type) {}

    /**
     * @param {String} name
     * @constructor
     */
    function InterfaceDescriptor(name) {
        this.name = name;
    }

    /**
     * @param impl Ignotered
     * @param name
     * @param ret
     * @param argsTypes
     * @param argsNames
     * @param anns
     */
    InterfaceDescriptor.prototype.addMethod = function (impl, name, ret, argsTypes, argsNames, anns) {};

    ria.__API.InterfaceDescriptor = InterfaceDescriptor;

    /**
     * @param {String} name
     * @return {Function}
     */
    ria.__API.ifc = function(name) {
        function InterfaceProxy() {
            // TODO instantiate anonymous implementation
            return null;
        }

        InterfaceProxy.__META = new InterfaceDescriptor(name);

        return InterfaceProxy;
    };

})();
