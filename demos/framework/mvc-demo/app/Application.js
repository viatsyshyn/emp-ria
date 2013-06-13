REQUIRE('ria.mvc.Application');

REQUIRE('app.controllers.NotesController');

NAMESPACE('app', function (){

    /** @class app.Application */
    CLASS(
        'Application', EXTENDS(ria.mvc.Application), []);
});
