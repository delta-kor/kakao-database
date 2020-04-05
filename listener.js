// listener.js
const $ = require('./fetcher');

/**
 * Listener
 * @class
 * @type {Listener}
 */
const Listener = (function() {

    /**
     * Initializes a new instance of Listener
     * @constructs Listener
     */
    function Listener() {
        this.lastFetchedIndex = $.getChatLength();
        this.onmessage = null;
    }

    Listener.prototype.fire = function() {
        const chatLength = $.getChatLength();
        if(chatLength > this.lastFetchedIndex) {
            this.lastFetchedIndex = chatLength;
            const target = $.getChatByIndex(chatLength);
            if(target.origin === 'MSG' && this.onmessage) {
                if(this.lastFetchedIndex === chatLength)
                    this.onmessage(target);
            }
        }
    };

    return Listener;

})();

module.exports = new Listener;
