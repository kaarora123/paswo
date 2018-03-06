const fs = require("fs");
const path = require("path");
const readline = require("readline");


/*
* Reads a text file line by line of words sorted by length.
* @param fileName	string, text file of words sorted by length
* @return an object including:
* 		lineNums  an object that stores the line numbers at which words with a specific length are listed in the text file 
* 		numLines  an integer, the number of lines in the text file
*/
const getLengthLineNum = (fileName) => {
	return new Promise((resolve, reject) => {
		//stores the line number at which words with a specific word length are listed in the text file
		//ex. lengthLineNums[1] = 1 -> at line 1, words with length 1 are listed,
		//lengthLineNums[3] = 143 -> at line 143, words with length 3 are listed
		var lengthLineNums = {};
		//keeps track of the greatest length seen so far in the file
		var currentLength = 0;
		//keeps track of the current line in the file
		var currentLine = 1;

		const rl = readline.createInterface({
			input: fs.createReadStream(path.join(__dirname, "../" + fileName)),
		});

		rl.input.on("error", error => {reject("An error occurred while trying to open " + fileName + ".")});

		rl.on("line", line => {
			//if the current word's length is greater than the greatest length seen so far
			if (line.length > currentLength) {
				//add the currentLine num to the array
				lengthLineNums[line.length] = currentLine;

				currentLength = line.length;
			}

			currentLine++;

		})

		rl.on("close", () => {
			 return resolve({lineNums: lengthLineNums, numLines: currentLine});
		});

		rl.on("error", reject);

	})

}

/**
* Gets a word from the text file at the specified line. 
* @param randomLine    int
* @param fileName	string, text file of words sorted by length
* @return line         string
*/
const getWord = (randomLine, fileName) => {
	return new Promise((resolve, reject) => {
		var currentLine = 0;
		var word;

		const rl = readline.createInterface({
			input: fs.createReadStream(path.join(__dirname, "../" + fileName)),
		});

		rl.input.on("error", error => {reject("An error occurred while trying to open " + fileName + ".")});

		rl.on("line", line => {
			currentLine++;
			if(currentLine === randomLine) {
				word = line;
				rl.close();
			}
		});

		rl.on("close", () => {
			return resolve(word);
		})

		rl.on("error", reject);

	})

}

module.exports = {getLengthLineNum, getWord};