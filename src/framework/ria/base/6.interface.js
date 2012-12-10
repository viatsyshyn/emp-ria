(function () {
    "use strict";

    /**
     * @param {String} name
     * @param {Array} methods
     * @constructor
     */
    function InterfaceDescriptor(name, methods) {
        this.name = name;
        this.methods = {};
        methods.forEach(function (method) {
            this.methods[method[0]] = {
                retType: method[1],
                argsNames: method[3],
                argsTypes: method[2]
            }
        }.bind(this));
    }

    ria.__API.InterfaceDescriptor = InterfaceDescriptor;

    var ifcRegister = {};

    /**
     * @param {String} name
     * @return {Function}
     */
    ria.__API.getInterfaceByName = function (name) {
        return ifcRegister[name];
    };

    /**
     * @param {Function} ifc
     * @param {String} name
     * @param {Array} methods
     */
    ria.__API.ifc = function(ifc, name, methods) {
        ifcRegister[name] = ifc;

        ifc.__META = new InterfaceDescriptor(name, methods);
    };

    ria.__API.isInterface = function (ifc) {
        return ifc.__META instanceof InterfaceDescriptor;
    };

})();
