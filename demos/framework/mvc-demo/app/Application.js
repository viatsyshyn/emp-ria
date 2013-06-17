REQUIRE('ria.mvc.Application');
REQUIRE('ria.dom.Dom');

REQUIRE('app.controllers.NotesController');

NAMESPACE('app', function (){

    /** @class app.Application */
    CLASS(
        'Application', EXTENDS(ria.mvc.Application), [
            OVERRIDE, ria.async.Future, function onStart_() {
                return BASE()
                    .then(function (data) {
                        var html = new ria.dom.Dom();
                        html.fromHTML(ASSET('~/assets/jade/index.jade')());
                        var main = new ria.dom.Dom('#main');
                        html.appendTo(main);
                        return data;
                    });
            }
        ]);
});
