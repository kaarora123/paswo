const fs = require("fs");
const inquirer = require("inquirer");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbFile = path.join(__dirname, "../passwords-db.sqlite");
var db;

var encryptionAlgorithm = "aes-256-cbc";
var key;


/**
* Checks if the password database exists.
* @return boolean
*/
const databaseExists = () => {
	if (fs.existsSync(dbFile)) {
		return true;
	}
	return false;
} 

/**
* Connects the password database and stores the master key for encyrption/decryption.
* @param masterKey      string, used for encryption/decryption
* @param callback		function
* @return err			err if error, null otherwise
*/
const connectDatabase = (masterKey, callback) => {
	db = new sqlite3.Database(dbFile, (err) => {
		if(err) return callback(err);
		createTable();
		key = masterKey;
		return callback(null);
	});
}

/**
* Creates table for passwords.
*/
const createTable = () => {
	db.run("CREATE TABLE IF NOT EXISTS passwords (website TEXT collate nocase, password TEXT)");
}

/**
* Checks if a row for a specific website exists.
* @param website	string
* @param callback	function
* @return string	password from database, if it exists
* @return boolean 	true if the row exists, false otherwise
*/
const checkRowExistence = (website, callback) => {
	db.serialize(() => {
		var stmt = `SELECT password FROM passwords WHERE website = "${website}"`;
		db.get(stmt, (err, row) => {
			if (err) return callback(err, null, null);
			if(typeof row === "undefined") return callback(null, false, null);
			else return callback(null, true, row.password);
		});
	});
}

/**
* Returns an array of all the rows in the database.
* @param callback	function
* @return array of objects
*/
const listRows = (callback) => {
	db.serialize(() => {
		db.all("SELECT * FROM passwords", (err, rows) => {
			if(err) return callback(err, null);
			return callback(null, rows);
		});
	});
}

/**
* Inserts a password and website into the database.
* @param website	string
* @param password   string
* @param callback   function
* @return err		err if error, null otherwise
*/
const insertPassword = (website, password, callback) => {
	var encryptedPassword = encrypt(password); 

	db.serialize(() => {
		var stmt = db.prepare(`INSERT INTO passwords(website, password) VALUES(?, ?)`);
		stmt.run(website, encryptedPassword, (err) => {
			if(err) return callback(err);
			callback(null);
		});

		stmt.finalize();
	});
}

/**
* Encrypts password.
* @param password       string
* @return encrypted 	string, encrypted password
*/
const encrypt = (password) => {
	var cipher = crypto.createCipher(encryptionAlgorithm, key);
	var encrypted = cipher.update(password, "utf8", "hex");
	encrypted += cipher.final("hex");

	return encrypted;

}

/**
* Gets and decrypts password from database for the specific website. Returns
* false if the website is not in the database.
* @param website	string
* @param callback   function
* @return string 	decrypted password, false otherwise
*/
const getPassword = (website, callback) => {
	checkRowExistence(website, (err, rowExists, password) => {
		if(err) callback(err, null);
		if(!rowExists) {
			return callback(null, false);
		} else {
			return callback(null, decrypt(password));
		}
	});
}

/**
* Decrypts password from database.
* @param encryptedPassword	string
* @return decrypted 		string, decrypted password
*/
const decrypt = (encryptedPassword) => {
	var decipher = crypto.createDecipher(encryptionAlgorithm, key);
	var decrypted = decipher.update(encryptedPassword, "hex", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}

/**
* Updates the password for a specific website.
* @param website		string
* @param newPassword	string
* @param callback		function
* @return err			err if error, null otherwise
*/
const updatePassword = (website, newPassword, callback) => {
	var encryptedPassword = encrypt(newPassword);

	db.serialize(() => {
		var stmt = `UPDATE passwords SET password = ? WHERE website = ?`;
		var data = [encryptedPassword, website];
		db.run(stmt, data, (err) => {
			if (err) return callback(err);
			if(typeof callback === "function") callback(null);
		});
	});
}

/**
* Deletes password for specific website.
* @param website	string
* @param callback	function
* @return err		err if error, null otherwise
*/
const deletePassword = (website, callback) => {
	db.serialize(() => {
		var stmt = `DELETE FROM passwords WHERE website = ?`;
		db.run(stmt, website, err => {
			if (err) return callback(err);
			return callback(null); 
		});
	});
}

/**
* Closes the database.
* @param callback	function
* @return err		err if error, null otherwise
*/
const closeDatabase = (callback) => {
	db.close(err => {
		if(err) return callback(err);
		key = "";
		return callback(null);
	});
}

/**
* Encrypts all the passwords in the database using the new master key.
* @param newMasterKey	string
* @param callback		function
* @return boolean		true, if all the passwords were successfully encrypted and updated
*/
const changeMasterKey = (newMasterKey, callback) => {
	listRows((err, result) => {
		if(err) return callback(err);
		var temp = key;
		for(var i = 0; i < result.length; i++) {
				key = temp;
				decryptedPassword = decrypt(result[i].password);
				key = newMasterKey;
				updatePassword(result[i].website, decryptedPassword, (err, result) => {
					if (err) return callback(err);
				});
		}

		callback(null);
	});
}

module.exports = { databaseExists, connectDatabase, createTable, changeMasterKey, checkRowExistence, listRows,
				   insertPassword, getPassword, updatePassword, deletePassword, closeDatabase, decrypt }; 