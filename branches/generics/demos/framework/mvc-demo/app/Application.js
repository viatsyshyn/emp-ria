REQUIRE('ria.mvc.Application');
REQUIRE('ria.dom.jQueryDom');

REQUIRE('app.controls.ActionLinkControl');
REQUIRE('app.controls.DatePickerControl');

REQUIRE('app.controllers.NotesController');

NAMESPACE('app', function (){

    /** @class app.Application */
    CLASS(
        'Application', EXTENDS(ria.mvc.Application), [
            OVERRIDE, ria.async.Future, function onStart_() {
                return BASE()
                    .then(function (data) {
                        new ria.dom.Dom()
                            .fromHTML(ASSET('~/assets/jade/index.jade')())
                            .appendTo('#main');
                        return data;
                    });
            }
        ]);
});
