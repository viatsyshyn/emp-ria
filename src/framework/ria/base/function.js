(function () {
    "use strict";

    function parseName(fn) {
        return (fn.substring(9).match(/[a-z0-9_]+/i) || [])[0] || '';
    }

    function getName() {
        return this.name || parseName(this.toString());
    }

    Function.prototype.getName
        || (Function.prototype.getName = getName);

    /**
     * @see Function.prototype.getParameters
     */
    Function.prototype.getParameters
        || (Function.prototype.getParameters = function getParameters() {
            var body = this.toString().substring(8);
            var start = body.indexOf('(');
            var end = body.indexOf(')', start);
            var params = body.substring(start + 1, end);
            return params.length > 0 ? params.replace(/ /g, '').split(',') : [];
        });

    /**
     * @see Function.prototype.getParametersCount
     */
    Function.prototype.getParametersCount
        ||(Function.prototype.getParametersCount = function getParametersCount() {
            return this.length || this.getParameters().length;
        });

    /**
     * @see Function.prototype.hasVarArgs
     */
    Function.prototype.hasVarArgs
        || (Function.prototype.hasVarArgs = function hasVarArgs() {
            return this.getParameters().pop() == 'var_args';
        });

    /**
     * @see Function.prototype.getRequiredParametersCount
     */
    Function.prototype.getRequiredParametersCount
        ||(Function.prototype.getRequiredParametersCount = function getRequiredParametersCount() {
            return this.getParametersCount() - (this.hasVarArgs() ? 1 : 0);
        });

    /**
     * @see Function.prototype.getBody
     */
    Function.prototype.getBody
        ||(Function.prototype.getBody = function getBody() {
            var body = this.toString();
            var braceStart = body.indexOf('{');
            return body.substring(braceStart);
        });

    Array.isArray = Array.isArray || function (value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    };
})();