REQUIRE('ria.templates.CompiledTemplate');

NAMESPACE('ria.templates', function () {

    /** @class ria.templates.CompiledTemplate */
    CLASS(
        'CompiledTemplate', [
            OVERRIDE, String, function render() {
                return this._tpl(this.getContext_());
            }
        ]);
});