(function () {
    "use strict";

    function Identifier() {}

    Object.defineProperty(Identifier.prototype, 'toString', {
        value: function toString() {
            return '[' + this.constructor.getName() + '#' + this.value + ']';
        },
        writable: false,
        configurable: false,
        enumerable: true
    });

    Object.defineProperty(Identifier.prototype, 'valueOf', {
        value: function valueOf() {
            return this.value;
        },
        writable: false,
        configurable: false,
        enumerable: true
    });

    function fromValue(value) {
        if (value instanceof this)
            return value;

        var statics = this.values;
        if (!statics.hasOwnProperty(value))
            statics[value] = new this.impl(value);

        return statics[value];
    }

    function createEnumConstructor(name) {
        return (new Function ('return function ' + name + '(value) {' +
                'if (this instanceof ' + name + ')' +
                    'throw Error("Can\'t instantiate Identifier");' +
                // this is Enum(value) call, should be type convertion
                'return ' + name + '.fromValue(value);' +
            '}'))();
    }

    function createNamedEmptyFunction(name) {
        return (new Function ('return function ' + name + '(value) { this.value = value; }'))();
    }

    function inheritFrom(superClass) {
        function InheritanceProxyClass() {}
        InheritanceProxyClass.prototype = superClass.prototype;
        return new InheritanceProxyClass();
    }

    function extend(subClass, superClass) {
        subClass.prototype = inheritFrom(superClass);
        subClass.prototype.constructor = subClass;
    }

    function getValueOfFunc(value) {
        return function valueOf() { return value; };
    }

    function IdentifierDescriptor(name) {
        this.name = name;
    }

    /**
     * DEFINE
     * @class {Identifier}
     * @public
     * @param {String} name
     * @param {Object} values
     */
    function buildIdentifier(name) {
        var identifierClass = createEnumConstructor(name);
        extend(identifierClass, Identifier);

        identifierClass.__identifierDescriptor = new IdentifierDescriptor(name);

        var identifierValueClass = createNamedEmptyFunction(name);
        extend(identifierValueClass, identifierClass);

        Object.defineProperties(identifierClass, {
            fromValue: {
                value: fromValue,
                writable: false,
                configurable: false,
                enumerable: true
            },
            impl: {
                value: identifierValueClass,
                writable: false,
                configurable: false,
                enumerable: false
            },
            values: {
                value: [],
                writable: false,
                configurable: false,
                enumerable: false
            }
        });

        return identifierClass;
    }

    function isIdentifier(value) {
        return value instanceof Identifier || value.__identifierDescriptor instanceof IdentifierDescriptor;
    }

    hwa.__API.buildIdentifier = buildIdentifier;
    hwa.__API.isIdentifier = isIdentifier;
})();