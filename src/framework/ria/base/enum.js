(function () {
    "use strict";

    function Enum() {}

    Enum.prototype = {
        toString: {
            value: function toString() {
                return '[' + this.key + '#' + this.valueOf() + ' ' + this.constructor.getName() + ']';
            },
            writable: false,
            configurable: false,
            enumerable: true
        }
    };

    function fromValue(value) {
        var statics = this;
        for(var k in statics) {
            if (statics.hasOwnProperty(k)
                    && statics[k] instanceof statics
                    && statics[k].valueOf() === value)
                return statics[k];
        }

        return undefined;
    }

    function createEnumConstructor(name) {
        return (new Function ('return function ' + name + '(value) {' +
                'if (this instanceof ' + name + ')' +
                    'throw Error("Can\'t instantiate Enum");' +
                // this is Enum(value) call, should be type convertion
                'return ' + name + '.fromValue(value);' +
            '}'))();
    }

    function createNamedEmptyFunction(name) {
        return (new Function ('return function ' + name + '() {}'))();
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

    function EnumDescriptor(name, values) {
        this.name = name;
        this.values = values;
    }

    /**
     * DEFINE
     * @class {Enum}
     * @public
     * @param {String} name
     * @param {Object} values
     */
    function buildEnum(name, values) {
        var enumClass = createEnumConstructor(name);
        extend(enumClass, Enum);

        enumClass.__enumDescriptor = new EnumDescriptor(name, values);

        var enumClassValue = createNamedEmptyFunction(name);
        extend(enumClassValue, enumClass);

        for(var k in values) {
            if (values.hasOwnProperty(k)) {
                var v = new enumClassValue();

                Object.defineProperties(v, {
                    __IDENTIFIER__: {
                        value: [name, k].join('#'),
                        writable: false,
                        configurable: false,
                        enumerable: false
                    },
                    key: {
                        value: k,
                        writable: false,
                        configurable: false,
                        enumerable: false
                    },
                    valueOf: {
                        value: getValueOfFunc(values[k]),
                        writable: false,
                        configurable: false,
                        enumerable: false
                    }
                });

                Object.defineProperty(enumClass, k, {
                    value: v,
                    writable: false,
                    configurable: false,
                    enumerable: true
                });
            }
        }

        Object.defineProperties(enumClass, {
            fromValue: {
                value: fromValue,
                writable: false,
                configurable: false,
                enumerable: true
            }
        });

        return enumClass;
    }

    function isEnum(value) {
        return value instanceof Enum || value.__enumDescriptor instanceof EnumDescriptor;
    }

    hwa.__API.buildEnum = buildEnum;
    hwa.__API.isEnum = isEnum;
    hwa.__API.AbstractEnum = Enum;
})();