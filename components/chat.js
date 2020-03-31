// chat.js
const $ = require('kakaobase').load();
const json = require('./json');

function parseUTCSecondDate(query) {
    return new Date(new Date(0).setUTCSeconds(query));
}

/**
 * @typedef constructor
 * @property {string} _id - number-like
 * @property {string} id - big-number-like
 * @property {string} type - number-like
 * @property {string} chat_id - big-number-like
 * @property {string} user_id - big-number-like
 * @property {string} message - encrypted or {}
 * @property {?string} attachment - encrypted-nullable or {}
 * @property {string} created_at - date-utc-second-format-like
 * @property {string} deleted_at - date-format-like or 0
 * @property {string} v - json-like
 */

/**
 * Chat
 * @class
 * @type Chat
 */
const Chat = (function() {

    /**
     * Initializes a new instance of Chat
     * @param {constructor} constructor
     * @property {number} index
     * @property {string} id
     * @property {string} type
     * @property {string} room
     * @property {string} sender
     * @property {object} v
     * @property {string} origin
     * @property {string} content
     * @property {?object} attachment
     * @property {Date} time
     * @property {boolean} isDeleted
     * @property {?Date} deletedTime
     * @constructs Chat
     */
    function Chat(constructor) {
        this.index = parseInt(constructor._id);
        this.id = constructor.id;
        this.type = constructor.type;
        this.room = constructor.chat_id;
        this.sender = constructor.user_id;
        this.v = json.parse(constructor.v);
        const decrypt = cipher => {
            $.initializeDecryption(this.v.enc, this.sender);
            return $.decrypt(cipher, this.sender.toString() + this.v.enc.toString(), true);
        };
        this.origin = this.v.origin;
        this.content = decrypt(constructor.message);
        this.attachment = json.parse(decrypt(constructor.attachment));
        this.time = parseUTCSecondDate(constructor.created_at);
        this.isDeleted = constructor.deleted_at !== '0';
        this.deletedTime = this.isDeleted ? new Date(this.deletedTime) : null;
    }

    return Chat;

})();

module.exports = Chat;
