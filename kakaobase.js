// kakaobase.js
importPackage(java.lang);

/**
 * Kakaobase
 * @class
 * @type {Kakaobase}
 */
const Kakaobase = (function() {

    /**
     * Initializes a new instance of Kakaobase
     * @constructs Kakaobase
     */
    function Kakaobase() {
        this.masterDatabase = null;
        this.secondaryDatabase = null;
    }

    /**
     * Grant superuser permission
     * @name Kakaobase#grantPermission
     * @type void
     */
    Kakaobase.prototype.grantPermission = function() {
        const process = Runtime.getRuntime().exec('su -c "chmod -R 777 /data/data/com.kakao.talk/databases"');
        process.waitFor();
    };

    return Kakaobase;

})();
