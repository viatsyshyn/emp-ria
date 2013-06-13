NAMESPACE('app.model', function () {
    "use strict";
    /** @class app.model.Note*/
    CLASS(
        'Note', [
            String, 'Title',
            String, 'Description'
        ])
});