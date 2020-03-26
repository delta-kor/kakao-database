// kakaobase.js
importPackage(java.lang);
importPackage(android.database.sqlite);

/**
 * @typedef {Object} SQLiteDatabase
 * @property {function(string):Cursor} rawQuery
 * @property {function(string):SQLiteDatabase,null,number} openDatabase
 * @link https://developer.android.com/reference/android/database/sqlite/SQLiteDatabase
 */

/**
 * @typedef {Object} Cursor
 * @property {function():number} getColumnCount
 * @link https://developer.android.com/reference/android/database/Cursor
 */

/**
 * Kakaobase
 * @class
 * @type {Kakaobase}
 */
const Kakaobase = (function() {

    /**
     * Kakaotalk database location
     * @type {string}
     */
    const databaseLocation = '/data/data/com.kakao.talk/databases';

    /**
     * Initializes a new instance of Kakaobase
     * @constructs Kakaobase
     * @property {?SQLiteDatabase} masterDatabase
     */
    function Kakaobase() {
        this.masterDatabase = null;
        this.secondaryDatabase = null;
    }

    /**
     * Grant superuser permission
     * @name Kakaobase#grantPermission
     * @return Kakaobase
     */
    Kakaobase.prototype.grantPermission = function() {
        const process = Runtime.getRuntime().exec('su -c "chmod -R 777 ' + databaseLocation + '"');
        process.waitFor();
        return this;
    };

    /**
     * Load master, secondary database
     * @name Kakaobase#loadDatabase
     * @return Kakaobase
     */
    Kakaobase.prototype.loadDatabase = function() {
        this.masterDatabase = SQLiteDatabase.openDatabase(databaseLocation + '/KakaoTalk.db', null, 1);
        this.secondaryDatabase = SQLiteDatabase.openDatabase(databaseLocation + '/KakaoTalk2.db', null, 1);
        return this;
    };

    /**
     * Select data from master database
     * @name Kakaobase#selectMaster
     * @param {string} query
     * @return {Cursor}
     */
    Kakaobase.prototype.selectMaster = function(query) {
        return this.masterDatabase.rawQuery(query);
    };

    /**
     * Select data from secondary database
     * @name Kakaobase#selectSecondary
     * @param {string} query
     * @return {Cursor}
     */
    Kakaobase.prototype.selectSecondary = function(query) {
        return this.secondaryDatabase.rawQuery(query);
    };

    return Kakaobase;

})();

module.exports = new Kakaobase;
