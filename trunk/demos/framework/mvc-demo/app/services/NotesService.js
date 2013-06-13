/**
 * Created with JetBrains WebStorm.
 * User: viatsyshyn
 * Date: 04.06.13
 * Time: 16:30
 * To change this template use File | Settings | File Templates.
 */

REQUIRE('app.services.Base');
REQUIRE('ria.async.Future');
REQUIRE('app.model.Note');

NAMESPACE('app.services', function () {
    "use strict";

    /** @class app.services.NotesService */
    CLASS(
        'NotesService', EXTENDS(app.services.Base), [
            ria.async.Future, function getNotes() {
                return this.get('data/notes.json', ArrayOf(app.model.Note));
            }
        ])
});