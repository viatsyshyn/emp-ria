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
     * @returns Function
     */
    ria.__API.ifc = function(ifc, name, methods) {
        ifcRegister[name] = ifc;
        ifc.__META = new InterfaceDescriptor(name, methods);
        return ifc;
    };

    ria.__API.Interface = new (function InterfaceBase() {});

    ria.__API.isInterface = function (ifc) {
        return ifc && (ifc.__META instanceof InterfaceDescriptor);
    };

    ria.__API.implements = function (value, ifc) {
        return (value.__META || ria.__API.getConstructorOf(value).__META).ifcs.indexOf(ifc) >= 0;
    };

})();
