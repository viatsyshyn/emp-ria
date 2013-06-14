REQUIRE('ria.templates.CompiledTemplate');

REQUIRE('app.model.Note');

NAMESPACE('app.templates', function () {

    /** @class app.templates.Note */
    CLASS(
        [ria.templates.TemplateBind('~/assets/jade/activities/note.jade')],
        [ria.templates.ModelBind(app.model.Note)],
        'Note', EXTENDS(ria.templates.CompiledTemplate), [
            [ria.templates.ModelBind],
            String, 'title',
            [ria.templates.ModelBind],
            String, 'description'
        ])
});