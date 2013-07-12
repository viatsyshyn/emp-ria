REQUIRE('ria.templates.Exception');
REQUIRE('ria.templates.ConverterFactories');
REQUIRE('ria.dom.Dom');

REQUIRE('ria.reflection.ReflectionClass');

/** @namespace hwax.templates */
NAMESPACE('ria.templates', function () {
    "use strict";

    function appendTo(content, to) {
        var dom = new ria.dom.Dom();
        dom.fromHTML(content).appendTo(to);
    }

    /**
     * @class ria.templates.ModelBind
     * @param {String} name
     * @param {Function} converter_
     */
    ANNOTATION(
        function ModelBind(name_, converter_) {});

    /**
     * @class ria.templates.TemplateBind
     * @param {String} tpl
     */
    ANNOTATION(
        function TemplateBind(tpl) {});

    /** @class ria.templates.Template */
    CLASS(ABSTRACT,
        'Template', [
            Number, 'collectionIndex',
            Array, 'collection',

            function $() {
                this._modelClass = null;
                this._bindings = [];
                this._bundle = '';
                this._tpl = null;
                this._model = null;
                this.bind_();
            },

            VOID, function bind_() {
                var self = ria.reflection.ReflectionClass(this.getClass());

                // Bind template
                if (!self.isAnnotatedWith(ria.templates.TemplateBind))
                    throw new ria.templates.Exception('Template class is not bound to template. Please use '
                        + ria.__API.getIdentifierOfType(ria.templates.TemplateBind));

                this._tpl = self.findAnnotation(ria.templates.TemplateBind).pop().tpl;

                // Bind model
                if (!self.isAnnotatedWith(ria.templates.ModelBind))
                    throw new ria.templates.Exception('Template class is not bound to model. Please use '
                        + ria.__API.getIdentifierOfType(ria.templates.ModelBind));

                this._modelClass = self.findAnnotation(ria.templates.ModelBind).pop().name_;
                if (this._modelClass === undefined)
                    throw new ria.templates.Exception('Template class is bound to model. But model not loaded');

                if (!ria.__API.isClassConstructor(this._modelClass))
                    return ;

                var model = ria.reflection.ReflectionClass(this._modelClass);

                var selfProperties = self.getPropertiesReflector(),
                    bindings = this._bindings;

                selfProperties
                    .filter(function (_) { return _.isAnnotatedWith(ria.templates.ModelBind); })
                    .forEach(function (property) {
                        var modelBind = property.findAnnotation(ria.templates.ModelBind).pop();
                        var modelPropertyName = modelBind.name_ || property.getShortName();
                        var modelProperty = model.getPropertyReflector(modelPropertyName);
                        if (modelProperty == null)
                            throw ria.templates.Exception('Property "' + modelPropertyName + '" not found in model ' + model.getName());

                        var converter = modelBind.converter_;
                        if (converter !== undefined) {
                            var ref = ria.reflection.ReflectionClass(converter.converter);
                            if (!ref.implementsIfc(ria.templates.IConverter))
                                throw new ria.templates.Exception('Converter class ' + ref.getName() + ' expected to implement '
                                    + ria.__API.getIdentifierOfType(ria.templates.IConverter));

                            converter = bind.converter;
                        }

                        bindings.push({
                            sourceProp: modelProperty,
                            destProp: property,
                            converter: converter
                        });
                    });
            },

            Function, function getModelClass() {
                return this._modelClass;
            },

            VOID, function assign(model) {

                if (ria.__API.isArrayOfDescriptor(this._modelClass) && !Array.isArray(model)) {
                    throw ria.templates.Exception('Expected instance of '
                        + ria.__API.getIdentifierOfType(this._modelClass) + ' but got '
                        + ria.__API.getIdentifierOfValue(model));
                } else if (ria.__API.isClassConstructor(this._modelClass) && !(model instanceof this._modelClass)) {
                    throw ria.templates.Exception('Expected instance of '
                        + ria.__API.getIdentifierOfType(this._modelClass) + ' but got '
                        + ria.__API.getIdentifierOfValue(model));
                }

                this._model = model;

                var convertWith = this.convertWith,
                    scope = this;

                this._bindings.forEach(function (_) {
                    var value = _.sourceProp.invokeGetterOn(model);
                    if (_.converter) {
                        value = convertWith(value, _.converter);
                    }
                    _.destProp.invokeSetterOn(scope, value);
                });
            },

            VOID, function options(options) {

                if ('function' == typeof options.block) {
                    this.setBlock(options.block);
                }

                delete options.block;

                if ('undefined' !== typeof options.collection) {
                    this.setCollection(options.collection);
                }
                delete options.collection;

                if ('number' === typeof options.collectionIndex) {
                    this.setCollectionIndex(options.collectionIndex);
                }
                delete options.collectionIndex;

                var ref = ria.reflection.ReflectionClass(this.getClass()), scope = this;
                var handled = {};
                options = ria.__API.clone(options);
                ref.getPropertiesReflector()
                    .filter(function (_) { return !_.isAnnotatedWith(ria.templates.ModelBind); })
                    .forEach(function (property) {
                        var key = property.getShortName();
                        if (options.hasOwnProperty(key)) {
                            property.invokeSetterOn(scope, options[key]);
                            delete options[key];
                        }
                    });

                Object.getOwnPropertyNames(options).forEach(function (k) {
                    throw new ria.templates.Exception('Unknown property ' + k + ' in template ' + ref.getName());
                });
            },

            ABSTRACT, String, function render() {},

            VOID, function renderTo(to) {
                appendTo(this.render(), to);
            },

            VOID, function renderBuffer() {
                this._bundle += this.render();
            },

            String, function flushBuffer() {
                var buffer = this._bundle;
                this._bundle = '';
                return buffer;
            },

            VOID, function flushBufferTo(to) {
                appendTo(this.flushBuffer(), to);
            },

            SELF, function getInstanceOfTemplate_(tplClass, options_) {
                var tpl = new tplClass;

                if (!(tpl instanceof SELF))
                    throw new Exception('Can render model only with ' + hwax.templates.Template.__IDENTIFIER__);

                options_ && tpl.options(options_);

                return tpl;
            },

            [[Object, Function, Object]],
            String, function renderWith(data, tplClass, options_) {
                var tpl = this.getInstanceOfTemplate_(tplClass, options_ || {});

                if (!Array.isArray(data)) {
                    data = [data];
                } else {
                    tpl.setCollection(data);
                }

                data.forEach(function (_, i) {
                    tpl.assign(_);
                    tpl.setCollectionIndex(i);
                    tpl.renderBuffer();
                });

                return tpl.flushBuffer();
            },

            [[Object, Function]],
            Object, function convertWith(value, clazz) {
                return ria.templates.ConverterFactories.create(clazz).convert(clazz);
            },

            Object, function getContext_() {
                return this;
            }
        ]);
});