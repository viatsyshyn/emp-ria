/**
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@emp-game.com
 * @date: 21.06.12
 */

(function (ria, global) {
    "use strict";

    ria.__API.transports = ria.__API.transports || {};

    function ScriptTagTransport(src, callback) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute('type', 'text/javascript');
        script_tag.setAttribute('src', src);

        script_tag.onload = script_tag.onreadystatechange = function() {
            if(!this.readyState
                || this.readyState == "loaded"
                || this.readyState == "complete") {

                callback(true, script_tag.innerText);
            }
        };

        document.getElementsByTagName('head')[0].appendChild(script_tag);
    }

    /** @class ria.__API.transports.ScriptTagTransport */
    ria.__API.transports.ScriptTagTransport = ScriptTagTransport;

    var new_xhr = ria.__EMPTY;
    if (global.XMLHttpRequest) {
        new_xhr = function () {
            try { return  new XMLHttpRequest(); } catch (e){}
        };
    } else if (global.ActiveXObject) {
        try {
            new ActiveXObject('Msxml2.XMLHTTP');
            new_xhr = function () {
                try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch (e){}
            };
        } catch (e){
            new_xhr = function () {
                try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch (e){}
            };
        }
    }

    function AjaxTransport(src, callback) {
        var xhr = new_xhr();

        if (xhr) {
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        callback(true, this.responseText, this);
                    } else {
                        callback(false, this.status, this);
                    }
                }
            };
            xhr.open("GET", src, true);
            xhr.send(null);
        } else {
            throw Error('Ajax not enabled');
        }

        xhr = null;
    }

    /** @class ria.__API.transports.AjaxTransport */
    ria.__API.transports.AjaxTransport = AjaxTransport;

})(ria, ria.global);