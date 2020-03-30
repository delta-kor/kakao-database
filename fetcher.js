// fetcher.js
const $ = require('kakaobase').load();
const components = require('components/loader');

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
     * @return {object}
     */
    Fetcher.prototype.getUserByID = function(id) {
        const cursor = $.selectSecondary('SELECT * FROM friends WHERE id = ' + id);
        if(cursor.getCount() < 1) if(this.safety) return null; else throw new ReferenceError('User with id \'' + id + '\' not found');
        cursor.moveToFirst();
        const data = {};
        for(let i = 0; i < cursor.getColumnCount(); i++)
            data[cursor.getColumnName(i)] = cursor.getString(i);
        return new components.User(data);
    };

    return Fetcher;

})();

module.exports = new Fetcher;
