const {getLengthLineNum, getWord} = require("./readWordsFile");

/**
* Gets a random special character from a string of special characters (45% of the time) 
* if addSpecialChars is true.
* @param addSpecialChars    boolean
* @return char/str          a special character, else an empty string
*/
const getSpecialChar = (addSpecialChars) => {
	var specialCharacters = ".,;:'!@#$%^&*-_=+?/|";

	if (addSpecialChars) {
		var randomBool = Math.random() >= 0.45;

		if (randomBool) {
			var i = Math.floor(Math.random() * specialCharacters.length);
			return specialCharacters.charAt(i);
		}
	}

	return "";

};

/**
* Returns a random number between 0 and 9 45% of the time.
* @return integer     a random number between 0 and 9, else an empty string. 
*/
const getRandomNumber = () => {
	var randomBool = Math.random() >= 0.45;

	if (randomBool) {
		var randomNum = Math.floor(Math.random() * 10);
		return randomNum;
	}

	return "";
};

/**
* Calculates the max length that the next random word can be for the random password.
* @param length 					int, the desired length of the random password
* @param randomPasswordLength		int, the current length of the random password
* @param lengthLineNums				object, keys are the length of the words in the 
*										sorted words text file and values are the line 
*										number at which those words are listed
* @return maxLength 				int, the max length the next random word can be
*/
const getMaxLength = (length, randomPasswordLength, lengthLineNums) => {

	var maxLength = length - randomPasswordLength;

	if (maxLength <= 0) return 0;

	/* We need to get the value for max length + 1 because we want the words with the calculated max length to be included in 
	* the search. If a key for max length + 1 does not exist in the object, then we get the key that is the biggest number smaller 
	* than max length + 1.
	* credit: Donagh Hatton -> https://stackoverflow.com/questions/12070757/selecting-biggest-number-smaller-than-a-variable-in-array
	*/
	if (!((maxLength + 1) in lengthLineNums)) {
		maxLength = Math.max.apply(Math, Object.keys(lengthLineNums).filter(function(x) {return x <= (maxLength + 1)})) - 1;
	}

	return maxLength;
};
/**
* Returns the word at the specified index from the sorted words text file.
* @param randomWordIndex	integer between 0 and the length of the file
* @param fileName			string
* @return string 			word from the file at the specified index
*/
const getRandomWord = async (randomWordIndex, fileName) => {
	try {
		return await getWord(randomWordIndex, fileName);
	} catch(e) {
		throw e;
	}
};

/**
* Creates a random password with a given list of words and optional special characters.
* @param length   			int, the desired length of the password
* @param addSpecialChars   	boolean, include special characteres in the password or not
* @param fileName			string, text file of words sorted by length
* @return randomPassword   	string, a randomly generated password
*/
const createRandomPassword = async (length, addSpecialChars, fileName) => {
	var file;

	try {
		file = await getLengthLineNum(fileName);
	} catch (e) {
		throw e;
	}
	//an object
	var lengthLineNums = file.lineNums; 
	//the number of lines in the words text file
	var numLines = file.numLines;

	var longestWordInFile = Math.max.apply(null, Object.keys(lengthLineNums));

	var randomPassword = "";

	while(randomPassword.length < length) {

		//add special char if needed
		randomPassword += getSpecialChar(addSpecialChars);

		//add number
		if(randomPassword.length < length) randomPassword += getRandomNumber();
		else break;

		//add word
		var randomWordIndex;

		var maxLength = getMaxLength(length, randomPassword.length, lengthLineNums);
		if (maxLength === 0) break;


		randomWordIndex = Math.floor(Math.random() * (lengthLineNums[maxLength + 1]));
		randomWordIndex = randomWordIndex !== 0 ? randomWordIndex : 1;

		var randomWord = await getRandomWord(randomWordIndex, fileName);

		randomPassword += randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
	}

	return randomPassword;

};

module.exports = { createRandomPassword };