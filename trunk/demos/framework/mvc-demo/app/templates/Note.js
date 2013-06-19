REQUIRE('app.templates.JadeTemplate');

REQUIRE('app.model.Note');

NAMESPACE('app.templates', function () {

    /** @class app.templates.Note */
    CLASS(
        [ria.templates.TemplateBind('~/assets/jade/activities/note.jade')],
        [ria.templates.ModelBind(app.model.Note)],
        'Note', EXTENDS(app.templates.JadeTemplate), [
            [ria.templates.ModelBind],
            app.model.NoteId, 'id',
            [ria.templates.ModelBind],
            String, 'title',
            [ria.templates.ModelBind],
            String, 'description',

            Boolean, 'renderLink'
        ])
});