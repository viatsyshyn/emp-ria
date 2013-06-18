REQUIRE('ria.templates.CompiledTemplate');

REQUIRE('app.model.Notes');

REQUIRE('app.templates.Note');

NAMESPACE('app.templates', function () {

    /** @class app.templates.Note */
    CLASS(
        [ria.templates.TemplateBind('~/assets/jade/activities/notes.jade')],
        [ria.templates.ModelBind(app.model.Notes)],
        'Notes', EXTENDS(ria.templates.CompiledTemplate), [
            [ria.templates.ModelBind],
            ArrayOf(app.model.Note), 'items'
        ])
});