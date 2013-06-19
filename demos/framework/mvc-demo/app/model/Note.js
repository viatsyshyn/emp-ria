NAMESPACE('app.model', function () {
    "use strict";
    /** @class app.model.Note*/
    CLASS(
        'Note', [
            Number, 'id',
            [ria.serialize.SerializeProperty('Title')],
            String, 'title',
            [ria.serialize.SerializeProperty('Description')],
            String, 'description'
        ]);
});