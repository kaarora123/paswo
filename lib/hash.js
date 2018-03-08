const crypto = require("crypto");
const inquirer = require("inquirer");

/**
* Asks the user for a hash string and a hashing algorithm from the crypto library.
* @return prompt object
*/
const askHashDetails = () => {
	const questions = [
		{
			name: "string",
			type: "input",
			message: "Please enter a string that you would like to hash: ",
			validate: input => {
				if (input.length) return true;
				else return "Please enter a valid string.";
			}

		},

		{
			name: "algorithm",
			type: "list",
			message: "Please pick a hashing algorithm:",
			choices: crypto.getHashes(),
		}

	];

	return inquirer.prompt(questions);
};

/**
* Hashes a string with the user's input and algorithm choice.
* @return string      hashed string
*/
const hashString = async () => {
	try {

		var hash = await askHashDetails();
		return crypto.createHash(hash.algorithm).update(hash.string).digest("hex");

	} catch(e) {throw e}

};

module.exports = {askHashDetails, hashString};