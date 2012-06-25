/**
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@emp-game.com
 * @date: 21.06.12
 */

(function (__API, ria, global) {
    "use strict";

    function ScriptTagTransport(src, callback) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute('type', 'text/javascript');
        script_tag.setAttribute('src', src);

        script_tag.onload = script_tag.onreadystatechange = function() {
            if(!this.readyState
                || this.readyState == "loaded"
                || this.readyState == "complete") {

                callback(true, script_tag.innerText, script_tag);
            }
        };

        document.getElementsByTagName('head')[0].appendChild(script_tag);
    }

    var new_xhr = (function () {
        //noinspection JSUnresolvedVariable
        if (global.XMLHttpRequest)
            return function () { try { return  new XMLHttpRequest(); } catch (e){} };

        //noinspection JSUnresolvedVariable
        if (!global.ActiveXObject)
            return ria.__EMPTY;

        try {
            new ActiveXObject('Msxml2.XMLHTTP');
            return function () { try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch (e){} }
        } catch (e){
            return function () { try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch (e){} }
        }
    })();

    function AjaxTransport(src, callback, body$, method$) {
        var xhr = new_xhr();
        if (!xhr)
            throw Error('Ajax not enabled');

        /** @this XMLHttpRequest */
        xhr.onreadystatechange = function () { (this.readyState == 4) && callback(this.status == 200, this.responseText, this); };
        xhr.open(method$ ? method$ : body$ ? "POST" : "GET", src, true);
        xhr.send(body$ || null);
        xhr = null;
    }

    /** @class ria.__API.transports */
    ria.defineConst(__API, 'transports', {});

    ria.defineConst(__API.transports, {
        /** @class ria.__API.transports.ScriptTagTransport */
        ScriptTagTransport: ScriptTagTransport,
        /** @class ria.__API.transports.AjaxTransport */
        AjaxTransport: AjaxTransport
    })

})(ria.__API, ria, ria.global);