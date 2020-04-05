// fetcher.js
const $ = require('kakaobase').load();
const components = require('components/loader');

/**
 * Copies cursor to object
 * @param {Cursor} cursor
 * @return {object}
 */
function databaseToObject(cursor) {
    const data = {};
    for(let i = 0; i < cursor.getColumnCount(); i++)
        data[cursor.getColumnName(i)] = cursor.getString(i);
    return data;
}

/**
 * Fetcher
 * @class
 * @type {Fetcher}
 */
const Fetcher = (function() {

    /**
     * Initializes a new instance of Fetcher
     * @property {boolean} safety
     * @constructs Fetcher
     */
    function Fetcher() {
        this.safety = false;
    }

    /**
     * Get user by id
     * @name Fetcher#getUserByID
     * @param id
     * @return {User}
     */
    Fetcher.prototype.getUserByID = function(id) {
        const cursor = $.selectSecondary('SELECT * FROM friends WHERE id = ' + id);
        if(cursor.getCount() < 1) if(this.safety) return null; else throw new ReferenceError('User with id \'' + id + '\' not found');
        cursor.moveToFirst();
        const data = databaseToObject(cursor);
        return new components.User(data);
    };

    /**
     * Get room by id
     * @name Fetcher#getRoomByID
     * @param id
     * @return {Room}
     */
    Fetcher.prototype.getRoomByID = function(id) {
        const cursor = $.selectMaster('SELECT * FROM chat_rooms WHERE id = ' + id);
        if(cursor.getCount() < 1) if(this.safety) return null; else throw new ReferenceError('Room with id \'' + id + '\' not found');
        cursor.moveToFirst();
        const data = databaseToObject(cursor);
        return new components.Room(data);
    };

    /**
     * Get chat by id
     * @name Fetcher#getChatByID
     * @param id
     * @return {Chat}
     */
    Fetcher.prototype.getChatByID = function(id) {
        const cursor = $.selectMaster('SELECT * FROM chat_logs WHERE id = ' + id);
        if(cursor.getCount() < 1) if(this.safety) return null; else throw new ReferenceError('Chat with id \'' + id + '\' not found');
        cursor.moveToFirst();
        const data = databaseToObject(cursor);
        return new components.Chat(data);
    };

    /**
     * Get chat by id
     * @name Fetcher#getChatByIndex
     * @param index
     * @return {Chat}
     */
    Fetcher.prototype.getChatByIndex = function(index) {
        const cursor = $.selectMaster('SELECT * FROM chat_logs WHERE _id = ' + index);
        if(cursor.getCount() < 1) if(this.safety) return null; else throw new ReferenceError('Chat with index \'' + index + '\' not found');
        cursor.moveToFirst();
        const data = databaseToObject(cursor);
        return new components.Chat(data);
    };

    /**
     * Get chat length
     * @name Fetcher#getChatLength
     * @return {number}
     */
    Fetcher.prototype.getChatLength = function() {
        const cursor = $.selectMaster('SELECT count(*) FROM chat_logs');
        if(cursor.getCount() < 1) throw new Error('Unexpected error from method getChatLength');
        cursor.moveToFirst();
        return parseInt(cursor.getString(0));
    };

    return Fetcher;

})();

module.exports = new Fetcher;
