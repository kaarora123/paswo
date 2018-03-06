const inquirer = require("inquirer");
const bcrypt = require("bcrypt");
const chalk = require("chalk");


/**
* Asks the user to create a master key for their password database.
* @return masterKey    string
*/
const createMasterKey = async () => {
	const masterKeyDetails = [
		{
			name: "masterKey",
			type: "password",
			message: "Please set a strong master key for your password database. Do NOT forget this key!",
			validate: input => {
				if (input.length) return true;
				else return "Please enter a valid string.";
			}
		},

		{
			name: "verifyKey",
			type: "password",
			message: "Please verify your key: ",
			validate: input => {
				if (input.length) return true;
				else return "Please enter a valid string.";
			}
		}

	]

	try {
		var input = await inquirer.prompt(masterKeyDetails);

		if(input.masterKey === input.verifyKey) {
			return input.masterKey;
		} else {
			console.log(chalk.red.bold("Keys did not match. Please try again."));
			return createMasterKey();
		}

	} catch(e) {throw e}

}

/**
* Asks the user to enter the master key to open their password database.
* @return masterKey     string, master key input
*/
const askForMasterKey = async () => {
	try {
		var input = await inquirer.prompt([
				{
					name: "masterKey",
					type: "password", 
					message: "Please enter your master key: ",
					validate: input => {
						if (input.length) return true;
						else return "Please enter a valid string.";
					}
				}
			]);

		return input.masterKey;
	} catch(e) {throw e}
}


/**
* Hashes the master key using bcrypt.
* @param key      string
* @return hash    string, hashed master key
*/
const hashKey = (key) => {
	var saltRounds = 10;
	var salt = bcrypt.genSaltSync(saltRounds);
	var hash = bcrypt.hashSync(key, salt);
	return hash;
}

/**
* Checks to see if the input key is correct.
* @param inputMasterKey		string, user's input
* @param hashedMasterKey	string, stored hashed key
* @return boolean
*/
const checkMasterKey = (inputMasterKey, hashedMasterKey) => {
	return bcrypt.compareSync(inputMasterKey, hashedMasterKey);
}

/**
* Allows the user to change their database password. If user inputs
* incorrect current master key (for verification), returns false.
* @param masterKey 		string, current master key
* @return newMasterKey 	string
*/
const changeMasterKey = async (masterKey) => {

	try {
		var input = await askForMasterKey();

		if (!checkMasterKey(input, masterKey)) {
			return false;
		} else {
			var newMasterKey = await createMasterKey();
			return newMasterKey;
		}

	} catch(e) {throw e}

}


module.exports = {createMasterKey, askForMasterKey, hashKey, checkMasterKey, changeMasterKey};