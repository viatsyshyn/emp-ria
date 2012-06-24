(function (__API) {
    "use strict";

    var Modifiers = __API.Modifiers;
    // declared to create Exception itself
    /** @class ria.__API.Exception */
    __API.Exception = hwa.__API.ClassDescriptor.build([Modifiers.ABSTRACT, 'Exception', [
        [String],
        Modifiers.PUBLIC, function __constructor(message) {
            this.__constructor(message, null);
        },

        [String, Object],
        Modifiers.PUBLIC, function __constructor(message, inner) {
            this.internal = Error(message);
            this.innerExcetion_ = inner;
        },

        Modifiers.PUBLIC, String, function toString() {
            var constructor = hwa.__API.getConstructorOf(this);
            var s = [constructor.__IDENTIFIER__ || constructor.getName()
                || 'Exception', ': ', this.internal.message].join('');

            if ((this.internal instanceof Error) && this.internal.stack)
                s += '\n' + this.internal.stack;

            if (this.innerExcetion_)
                s += '\nCause by: ' + this.innerExcetion_.toString();

            if ((this.innerExcetion_ instanceof Error) && this.innerExcetion_.stack)
                s += '\n' + this.innerExcetion_.stack;

            return s;
        }
    ]]);
})(ria.__API);
