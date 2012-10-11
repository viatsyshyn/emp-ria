ria = ria || {};
ria.__API = ria.__API || {};

(function () {
    "use strict";

    /**
     * @param {String} name
     * @param {Array} methods
     * @constructor
     */
    function InterfaceDescriptor(name, methods) {
        this.name = name;
        this.methods = methods;
    }

    ria.__API.InterfaceDescriptor = InterfaceDescriptor;

    /**
     * @param {String} name
     * @param {Array} methods
     * @return {Function}
     */
    ria.__API.ifc = function(name, methods) {
        function InterfaceProxy() {
            throw Error ('Can not instantiate interface');
        }

        InterfaceProxy.__META = new InterfaceDescriptor(name, methods);

        return InterfaceProxy;
    };

    ria.__API.isInterface = function (ifc) {
        return ifc.__META instanceof InterfaceDescriptor;
    }

})();
