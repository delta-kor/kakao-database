// user.js
const $ = require('kakaobase').load();
const json = require('./json');

/**
 * @typedef constructor
 * @property {string} _id - number-like
 * @property {string} id - big-number-like
 * @property {string} type - number-like
 * @property {string} name - encrypted
 * @property {?string} profile_image_url - encrypted-nullable
 * @property {?string} full_profile_image_url - encrypted-nullable
 * @property {?string} original_profile_image_url - encrypted-nullable
 * @property {?string} status_message - encrypted-nullable
 * @property {?string} chat_id - 0 or big-number-like
 * @property {string} v - encrypted or {}
 * @property {string} board_v - encrypted or {}
 * @property {?string} nick_name - encrypted-nullable or blank
 * @property {string} involved_chat_ids - array-like -> big-number-like
 * @property {string} enc - number-like
 * @property {string} created_at - date-format-like
 */

/**
 * User
 * @class
 * @type User
 */
const User = (function() {

    /**
     * Initializes a new instance of User
     * @param {constructor} constructor
     * @property {number} index
     * @property {string} id
     * @property {Symbol} type
     * @property {string} name
     * @property {?string} image.fit
     * @property {?string} image.half
     * @property {?string} image.original
     * @property {?string} statusMessage
     * @property {string[]} room
     * @property {object} v
     * @property {object} boardV
     * @property {Date} createdTime
     * @constructs User
     */
    function User(constructor) {
        const decrypt = cipher => $.decrypt(cipher, parseInt(constructor.enc));
        this.index = parseInt(constructor._id);
        this.id = constructor.id;
        this.type = (function(q) {
            switch(q) {
                case '2': return User.Type.FRIEND;
                case '-999999': return User.Type.UNRELATED;
                case '1000': return User.Type.OPEN;
                case '-1889': return User.Type.OPEN;
                default: return User.Type.UNKNOWN;
            }
        })(constructor.type);
        this.name = decrypt(constructor.nick_name) || decrypt(constructor.name);
        this.image = {
            fit: decrypt(constructor.profile_image_url),
            half: decrypt(constructor.full_profile_image_url),
            original: decrypt(constructor.original_profile_image_url)
        };
        this.statusMessage = decrypt(constructor.status_message);
        this.room = json.parse(constructor.involved_chat_ids);
        this.v = json.parse(decrypt(constructor.v));
        this.boardV = json.parse(decrypt(constructor.board_v));
        this.createdTime = new Date(constructor.created_at);
    }

    User.Type = {
        'FRIEND': Symbol('user_friend'),
        'UNRELATED': Symbol('user_unrelated'),
        'OPEN': Symbol('user_open'),
        'UNKNOWN': Symbol('user_unknown')
    };

    return User;

})();

module.exports = User;
