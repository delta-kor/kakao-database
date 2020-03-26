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
     * @return void
     */
    Kakaobase.prototype.grantPermission = function() {
        const process = Runtime.getRuntime().exec('su -c "chmod -R 777 ' + databaseLocation + '"');
        process.waitFor();
    };

    /**
     * Load master, secondary database
     * @name Kakaobase#loadDatabase
     * @return void
     */
    Kakaobase.prototype.loadDatabase = function() {
        this.masterDatabase = SQLiteDatabase.openDatabase(databaseLocation + '/Kakaotalk.db', null, 1);
        this.secondaryDatabase = SQLiteDatabase.openDatabase(databaseLocation + '/Kakaotalk2.db', null, 1);
    };

    return Kakaobase;

})();

exports.kakaobase = Kakaobase;
