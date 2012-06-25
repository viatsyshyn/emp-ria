(function (__API, ria) {
    "use strict";

    function Identifier() {}

    ria.defineConst(Identifier.prototype, {
        /** @see Identifier.prototype.toString */
        toString: function toString() { return '[' + this.constructor.getName() + '#' + this.value + ']'; },
        /** @see Identifier.prototype.valueOf */
        valueOf: function valueOf() { return this.value; }
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

    function getValueOfFunc(value) {
        return function valueOf() { return value; };
    }

    function IdentifierDescriptor(name) {
        this.name = name;
    }

    function buildIdentifier(name) {
        var identifierClass = createEnumConstructor(name);
        ria.extend(identifierClass, Identifier);

        identifierClass.__identifierDescriptor = new IdentifierDescriptor(name);

        var identifierValueClass = createNamedEmptyFunction(name);
        ria.extend(identifierValueClass, identifierClass);

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

    ria.defineConst(__API, {
        /** @class ria.__API.buildIdentifier */
        buildIdentifier: buildIdentifier,
        /** @class ria.__API.isIdentifier */
        isIdentifier: isIdentifier
    })

})(ria.__API, ria);