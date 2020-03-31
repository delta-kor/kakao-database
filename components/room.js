// room.js
const $ = require('kakaobase').load();
const json = require('./json');

function parseUTCSecondDate(query) {
    return new Date(new Date(0).setUTCSeconds(query));
}

/**
 * @typedef constructor
 * @property {string} _id - number-like
 * @property {string} id - big-number-like
 * @property {string} type - OD | OM | MultiChat | PlusChat
 * @property {string} members - array-like -> big-number
 * @property {string} active_member_ids - array-like -> big-number-like
 * @property {?string} last_message - encrypted-nullable
 * @property {string} last_updated_at - date-utc-second-format-like
 * @property {string} v - json-like
 * @property {string} active_members_count - number-like
 * @property {?string} meta - json-like-nullable
 * @property {?string} private_meta - json-like-nullable
 * @property {?string} link_id - number-like-nullable
 * @property {?string} moim_meta - json-like-nullable
 */

/**
 * Room
 * @class
 * @type Room
 */
const Room = (function() {

    /**
     * Initializes a new instance of Room
     * @param {constructor} constructor
     * @property {number} index
     * @property {string} id
     * @property {string} type
     * @property {string[]} members
     * @property {?string} lastMessage
     * @property {Date} activeTime
     * @property {number} count
     * @property {?object} meta
     * @property {?object} privateMeta
     * @property {?string} linkID
     * @property {?object} notice
     * @property {object} v
     * @constructs Room
     */
    function Room(constructor) {
        this.v = json.parse(constructor.v);
        const decrypt = cipher => $.decrypt(cipher, parseInt(this.v.enc));
        this.index = parseInt(constructor._id);
        this.id = constructor.id;
        this.type = (function(q) {
            switch(q) {
                case 'OD': return Room.Type.OPEN_1VS1;
                case 'OM': return Room.Type.OPEN_MULTI;
                case 'PlusChat': return Room.Type.PLUS_CHAT;
                case 'MultiChat': return Room.Type.MULTI_CHAT;
                default: return Room.Type.UNKNOWN;
            }
        })(constructor.type);
        this.members = json.parse(constructor.active_member_ids);
        this.lastMessage = decrypt(constructor.last_message);
        this.activeTime = parseUTCSecondDate(constructor.last_updated_at);
        this.count = parseInt(constructor.active_members_count);
        this.meta = json.parse(constructor.meta);
        this.privateMeta = json.parse(constructor.private_meta);
        this.linkID = constructor.link_id;
        this.notice = json.parse(constructor.moim_meta);
    }

    Room.Type = {
        'OPEN_1VS1': Symbol('open_1vs1'),
        'OPEN_MULTI': Symbol('open_multi'),
        'PLUS_CHAT': Symbol('plus_chat'),
        'MULTI_CHAT': Symbol('multi_chat'),
        'UNKNOWN': Symbol('unknown')
    };

    return Room;

})();

module.exports = Room;
