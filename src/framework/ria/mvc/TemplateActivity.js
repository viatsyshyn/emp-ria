REQUIRE('ria.mvc.DomActivity');

REQUIRE('ria.templates.Template');

NAMESPACE('ria.mvc', function () {

    /** @class ria.mvc.TemplateBind */
    ANNOTATION(
        function TemplateBind(tpl) {});

    /** @class ria.mvc.PartialUpdateRuleActions */
    ENUM('PartialUpdateRuleActions', {
        Prepend: 'prepend',
        Replace: 'replace',
        Append: 'append'
    });

    /** @class ria.mvc.PartialUpdateRule */
    ANNOTATION(
        [[Function, String, String, ria.mvc.PartialUpdateRuleActions]],
        function PartialUpdateRule(tpl, msg_, selector_, action_) {});

    /** @class ria.mvc.TemplateActivity */
    CLASS(
        'TemplateActivity', EXTENDS(ria.mvc.DomActivity), [

            function $(){
                BASE();
            },

            [[ria.reflection.ReflectionClass]],
            OVERRIDE, VOID, function processAnnotations_(ref) {
                BASE(ref);

                if (!ref.isAnnotatedWith(ria.mvc.TemplateBind))
                    throw new ria.mvc.MvcException('ria.mvc.TemplateActivity expects annotation ria.mvc.TemplateBind');

                var tpls = ref.findAnnotation(ria.mvc.TemplateBind).pop().tpl;
                if (!Array.isArray(tpls))
                    tpls = [tpls];

                if (tpls.some(function (_) { return _ === undefined; }))
                    throw new ria.mvc.MvcException(ref.getName() + " is annotated with ria.mvc.TemplateBind"
                        + ', but some templates classes appears to be not loaded: ['
                        + tpls.map(function (_) { return ria.__API.getIdentifierOfType(_); }) + ']');

                this._templateClasses = tpls.map(function (tpl) {
                    var tplRef = new ria.reflection.ReflectionClass(tpl);
                    if (!tplRef.extendsClass(ria.templates.Template))
                        throw new ria.mvc.MvcException(ref.getName() + " is annotated with ria.mvc.TemplateBind"
                            + ', but templates ' + tplRef.getName() + ' is not descedant of ria.templates.Template');

                    return tplRef.instantiate();
                });

                this._partialUpdateRules = ref.findAnnotation(ria.mvc.PartialUpdateRule)
                    .map(function (_) {
                        if (_.tpl === undefined)
                            throw new ria.mvc.MvcException(ref.getName() + " is annotated with ria.mvc.PartialUpdateRule"
                                + ', but some templates classes appears to be not loaded.');

                        var tplRef = new ria.reflection.ReflectionClass(_.tpl);
                        if (!tplRef.extendsClass(ria.templates.Template))
                            throw new ria.mvc.MvcException(ref.getName() + " is annotated with ria.mvc.PartialUpdateRule"
                                + ', but templates ' + tplRef.getName() + ' is not descedant of ria.templates.Template');

                        return {
                            tpl: tplRef.instantiate(),
                            msg: _.msg_ || null,
                            selector: _.selector_ || null,
                            action: _.action_ || ria.mvc.PartialUpdateRuleActions.Replace
                        };
                    });

                if (this._partialUpdateRules.length < 1 && this._templateClasses.length == 1) {
                    this._partialUpdateRules.push({
                        tpl: this._templateClasses[0],
                        msg: null,
                        selector: null,
                        action: ria.mvc.PartialUpdateRuleActions.Replace
                    })
                }
            },

            OVERRIDE, ria.dom.Dom, function onDomCreate_() {
                return new ria.dom.Dom().fromHTML('<div></div>');
            },

            ria.templates.Template, function doFindTemplateForModel_(model) {
                var matches = this._templateClasses.filter(function (_) {
                    return model instanceof _.getModelClass();
                });

                if (matches.length == 0)
                    throw new ria.mvc.MvcException('Found no template that can render ' + ria.__API.getIdentifierOfValue(model));

                if (matches.length > 1)
                    throw new ria.mvc.MvcException('Found multiple templates that can render ' + ria.__API.getIdentifierOfValue(model)
                        + ', matches ' + matches.map(function (_) { return ria.__API.getIdentifierOfValue(_) }));

                return matches.pop();
            },

            [[ria.templates.Template, Object, String]],
            VOID, function onPrepareTemplate_(tpl, model, msg_) {},

            OVERRIDE, VOID, function onRender_(model) {
                BASE(model);
                var tpl = this.doFindTemplateForModel_(model);
                this.onPrepareTemplate_(tpl, model);
                tpl.assign(model);
                tpl.renderTo(this.dom.empty());
            },

            Object, function doFindTemplateForPartialModel_(model, msg) {
                var matches = this._partialUpdateRules.filter(function (_) {
                    return (_.msg === null || _.msg == msg)
                        && (model instanceof _.tpl.getModelClass());
                });

                if (matches.length == 0)
                    throw new ria.mvc.MvcException('Found no template that can render ' + ria.__API.getIdentifierOfValue(model) + ' with message ' + msg);

                if (matches.length > 1)
                    throw new ria.mvc.MvcException('Found multiple templates that can render ' + ria.__API.getIdentifierOfValue(model) + ' with message ' + msg
                        + ', matches ' + matches.map(function (_) { return ria.__API.getIdentifierOfValue(_) }));

                return matches.pop();
            },

            OVERRIDE, VOID, function onPartialRender_(model, msg_) {
                BASE(model, msg_);
                var rule = this.doFindTemplateForPartialModel_(model, msg_ || '');

                var tpl = rule.tpl;
                this.onPrepareTemplate_(tpl, model, msg_);
                tpl.assign(model);
                var dom = new ria.dom.Dom().fromHTML(tpl.render());

                var target = this.dom;
                if (rule.selector)
                    target = target.find(rule.selector);

                switch (rule.action) {
                    case ria.mvc.PartialUpdateRuleActions.Prepend: dom.prependTo(target); break;
                    case ria.mvc.PartialUpdateRuleActions.Append: dom.appendTo(target); break;
                    default: dom.appendTo(target.empty());
                }
            }
        ]);
});