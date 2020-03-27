// kakaobase.js
importPackage(java.lang);
importPackage(java.util);
importPackage(java.security);
importPackage(javax.crypto);
importPackage(javax.crypto.spec);
importPackage(android.database.sqlite);

/**
 * @typedef {Object} SQLiteDatabase
 * @property {function(string):Cursor, ?Array<string>} rawQuery
 * @property {function(string):SQLiteDatabase, null, number} openDatabase
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
     * Encryption salt prefix
     * @type {string[]}
     */
    const salty = ['', '', '12', '24', '18', '30', '36', '12', '48', '7', '35', '40', '17', '23', '29', 'isabel', 'kale', 'sulli', 'van', 'merry', 'kyle', 'james', 'maddux', 'tony', 'hayden', 'paul', 'elijah', 'dorothy', 'sally', 'bran'];
    /**
     * Encryption password
     * @type {number[]}
     */
    const password = [0, 22, 0, 8, 0, 9, 0, 111, 0, 2, 0, 23, 0, 43, 0, 8, 0, 33, 0, 33, 0, 10, 0, 16, 0, 3, 0, 3, 0, 7, 0, 6, 0, 0];
    /**
     * Array to java byte array
     * @param {Array} array
     */
    function toJavaByteArray(array) {
        const byteArray = java.lang.reflect.Array.newInstance(Byte.TYPE, array.length);
        for(let index in array)
            byteArray[index] = new Integer(array[index]).byteValue();
        return byteArray;
    }

    /**
     * Initializes a new instance of Kakaobase
     * @constructs Kakaobase
     * @property {?SQLiteDatabase} masterDatabase
     * @property {?SQLiteDatabase} secondaryDatabase
     * @property {?string} id
     * @property {Object} idCache
     * @property {Object} keyCache
     * @property {boolean} isPermissionGranted
     * @property {boolean} isDatabaseLoaded
     */
    function Kakaobase() {
        this.masterDatabase = null;
        this.secondaryDatabase = null;
        this.id = null;
        this.idCache = {};
        this.keyCache = {};
        this.isPermissionGranted = false;
        this.isDatabaseLoaded = false;
    }

    /**
     * Grant superuser permission
     * @name Kakaobase#grantPermission
     * @return Kakaobase
     */
    Kakaobase.prototype.grantPermission = function() {
        const process = Runtime.getRuntime().exec('su -c ""chmod -R 777 ' + databaseLocation + '""');
        process.waitFor();
        this.isPermissionGranted = true;
        return this;
    };

    /**
     * Load master, secondary database
     * @name Kakaobase#loadDatabase
     * @return Kakaobase
     */
    Kakaobase.prototype.loadDatabase = function() {
        if(!this.isPermissionGranted) throw new ReferenceError('Database cannot be loaded until permission is granted');
        this.masterDatabase = SQLiteDatabase.openDatabase(databaseLocation + '/KakaoTalk.db', null, 1);
        this.secondaryDatabase = SQLiteDatabase.openDatabase(databaseLocation + '/KakaoTalk2.db', null, 1);
        this.isDatabaseLoaded = true;
        return this;
    };

    /**
     * Select data from master database
     * @name Kakaobase#selectMaster
     * @param {string} query
     * @param {?Array<string>=} param
     * @return {Cursor}
     */
    Kakaobase.prototype.selectMaster = function(query, param) {
        if(!this.isDatabaseLoaded) throw new ReferenceError('Database cannot be queried before it is loaded');
        param = param || null;
        return this.masterDatabase.rawQuery(query, param);
    };

    /**
     * Select data from secondary database
     * @name Kakaobase#selectSecondary
     * @param {string} query
     * @param {?Array<string>=} param
     * @return {Cursor}
     */
    Kakaobase.prototype.selectSecondary = function(query, param) {
        if(!this.isDatabaseLoaded) throw new ReferenceError('Database cannot be queried before it is loaded');
        param = param || null;
        return this.secondaryDatabase.rawQuery(query, param);
    };

    /**
     * Load user id
     * @copyright 2019 supersunkist
     * @link https://github.com/supersunkist/rhinoKakaoTalkDBDecrypter
     * @name Kakaobase#loadID
     * @return Kakaobase
     */
    Kakaobase.prototype.loadID = function() {
        const cursor = this.selectSecondary('SELECT user_id FROM open_profile');
        if(cursor.getColumnCount() === 0) throw new ReferenceError('Failed to load user id');
        cursor.moveToFirst();
        this.id = cursor.getString(0);
        return this;
    };

    /**
     * Yield crypto key with user id
     * @copyright 2019 supersunkist
     * @link https://github.com/supersunkist/rhinoKakaoTalkDBDecrypter
     * @name Kakaobase#yieldCryptoKey
     * @param {number} encIndex
     * @return Array
     */
    Kakaobase.prototype.yieldCryptoKey = function(encIndex) {

        /**
         * Adjust value
         * @param a
         * @param aOff
         * @param b
         */
        function adjust(a, aOff, b) {
            let x = (b[b.length - 1] & 0xff) + (a[aOff + b.length - 1] & 0xff) + 0x1;
            a[aOff + b.length - 1] = x % 0x100;
            x = x >> 0x8;
            for (let i = b.length - 2; i >= 0; i--) {
                x = x + (b[i] & 0xff) + (a[aOff + i] & 0xff);
                a[aOff + i] = x % 0x100;
                x = x >> 0x8;
            }
        }

        /**
         * Copy array
         * @param srcArr
         * @param srcPos
         * @param destArr
         * @param destPos
         * @param length
         * @return void
         */
        function copyArray(srcArr, srcPos, destArr, destPos, length) {
            for (let i = 0; i < length; i++)
                destArr[destPos + i] = srcArr[srcPos + i]
        }

        /**
         * Construct array with size and fill
         * @param {number} size
         * @param fill
         */
        function constructAndFillArray(size, fill) {
            const preArray = new Array(size);
            preArray.fill(fill);
            return preArray;
        }

        // Generate encryption salt
        if(this.id === null) throw new ReferenceError('Key cannot be yielded before id loaded');
        let salt = (salty[encIndex] + this.id).slice(0, 16);
        salt = salt + '\0'.repeat(16 - salt.length);
        salt = new java.lang.String(salt).getBytes('UTF-8').slice();

        // Constants
        const iterations = 2;
        const keySize = 32;
        const blockSize = 64;
        const digestSize = 20;

        // ByteArray
        const hashByte = constructAndFillArray(blockSize, 1);
        const saltByte = constructAndFillArray(blockSize * Math.floor((salt.length + blockSize - 1) / blockSize), 0);
        for (let index in saltByte)
            saltByte[index] = salt[index % salt.length];
        const passwordByte = constructAndFillArray(blockSize * Math.floor((password.length + blockSize - 1) / blockSize), 0);
        for (let index in passwordByte)
            passwordByte[index] = password[index % password.length];
        const passwordHashByte = saltByte.concat(passwordByte);
        const passwordHash = constructAndFillArray(blockSize, 0);

        const size = Math.floor((keySize + digestSize - 1) / digestSize);
        const decryptKey = constructAndFillArray(keySize, 0);

        // Key yielding
        for (let index = 1; index <= size; index++) {
            let hasher = MessageDigest.getInstance("SHA-1");
            hasher.update(toJavaByteArray(hashByte));
            hasher.update(toJavaByteArray(passwordHashByte));
            let hash = hasher.digest();

            for (let iterate = 1; iterate < iterations; iterate++) {
                hasher = MessageDigest.getInstance("SHA-1");
                hasher.update(hash);
                hash = hasher.digest();
            }

            for (let iterate = 0; iterate !== passwordHash.length; iterate++)
                passwordHash[iterate] = hash[iterate % hash.length];

            for (let iterate = 0; iterate !== passwordHashByte.length / blockSize; iterate++)
                adjust(passwordHashByte, iterate * blockSize, passwordHash);

            if (index === size)
                copyArray(hash, 0, decryptKey, (index - 1) * digestSize, decryptKey.length - ((index - 1) * digestSize));
            else
                copyArray(hash, 0, decryptKey, (index - 1) * digestSize, hash.length);
        }

        return decryptKey;
    };

    /**
     * Add id crypto key to idCache
     * @name Kakaobase#initializeDecryption
     * @return {Kakaobase}
     */
    Kakaobase.prototype.initializeDecryption = function() {
        for(let i = 24; i <= 32; i++)
            this.idCache[i] = this.yieldCryptoKey(i);
        return this;
    };

    /**
     * Decrypt encrypted message with encrypt type
     * @name Kakaobase#decrypt
     * @param {string} cipher
     * @param {number} encIndex
     * @param {boolean} isFromKeyCache
     * @return {string}
     */
    Kakaobase.prototype.decrypt = function(cipher, encIndex, isFromKeyCache) {
        isFromKeyCache = isFromKeyCache || false;
        const key = new SecretKeySpec(toJavaByteArray(this[isFromKeyCache ? 'keyCache' : 'idCache'][encIndex]), 'AES');
        const vector = new IvParameterSpec(toJavaByteArray([15, 8, 1, 0, 25, 71, 37, 220, 21, 245, 23, 224, 225, 21, 12, 53]));
        const encrypted =  android.util.Base64.decode(cipher, 0);
        const decrypter = new Cipher.getInstance('AES/CBC/PKCS5PADDING');
        decrypter.init(2, key, vector);
        return new java.lang.String(decrypter.doFinal(encrypted), 'UTF-8').slice();
    };

    /**
     * Load kakaobase
     * @name Kakaobase#load
     * @return {Kakaobase}
     */
    Kakaobase.prototype.load = function() {
        this.grantPermission();
        this.loadDatabase();
        this.loadID();
        this.initializeDecryption();
        return this;
    };

    return Kakaobase;

})();

module.exports = new Kakaobase;
