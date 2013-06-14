REQUIRE('ria.templates.Template');

NAMESPACE('ria.templates', function () {

    /** @class ria.templates.CompiledTemplate */
    CLASS(
        'CompiledTemplate', EXTENDS(ria.templates.Template), [
            OVERRIDE, String, function render() {
                return this._tpl(this.getContext_());
            }
        ]);
});