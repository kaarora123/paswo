const expect = require("chai").expect;
const crypto = require("crypto");
const stdin = require("mock-stdin").stdin();
const {hashString} = require("./../lib/hash");
const {createRandomPassword} = require("./../lib/create");

describe("create and hash functions", () => {

	describe("create", () => {

		it("should return a string that has a length of 36 and no special chars", (done) => {

			createRandomPassword(36, false, "sortedWords.txt").then(result => {

				var stringDict = {};

				for(var i = 0; i < result.split("").length; i++) {
					if (stringDict.hasOwnProperty(result[i])) {
						stringDict[result[i]]++;
					} else {
						stringDict[result[i]] = 1;
					}
				}
				expect(result).to.have.lengthOf(36);
				expect(stringDict).to.have.any.keys("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
				expect(stringDict).to.not.have.any.keys(".", ",", ";", ":,", "'", "!", "@", "#", "$", "%", "^", "&", "*", "-", "_", "=", "+", "?", "/", "|");
				done();
			});

		});


		it("should return a string that has a length of 20 and special chars",  (done) => {

			createRandomPassword(20, true, "sortedWords.txt").then(result => {
				var stringDict = {};

				for(var i = 0; i < result.split("").length; i++) {
					if (stringDict.hasOwnProperty(result[i])) {
						stringDict[result[i]]++;
					} else {
						stringDict[result[i]] = 1;
					}
				}

				expect(result).to.have.lengthOf(20);
				expect(stringDict).to.have.any.keys("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
				expect(stringDict).to.have.any.keys(".", ",", ";", ":,", "'", "!", "@", "#", "$", "%", "^", "&", "*", "-", "_", "=", "+", "?", "/", "|");
				done();

			});

		});

		it("should throw an error because file does not exist", (done) => {
			createRandomPassword(36, false, "words.txt").then(result => {
				expect(result).to.be.false;
			}).catch(e => {
				expect(e).to.equal("An error occurred while trying to open words.txt.");
				done();
			});
		});

	});


	//help from: https://glebbahmutov.com/blog/unit-testing-cli-programs/
	describe("hash", () => {
		var keys = {
			up: "\u001b[A",
			down: "\u001b[B"
		};

		function mockResponse(string, numDown) {
			function getAlgorithm(numDown) {

				var i = numDown;
				var algorithm;
				var interval = setInterval(moveDown, 1);

				function moveDown() {
					if(i > 1) {
						algorithm = keys.down;
					} else {
						algorithm = "\n";
					}
					stdin.send(algorithm);

					if(i === 1) {clearInterval(interval)}

					i--;
				}
			}


			process.nextTick(() => {
				stdin.send([
					string,
					"\n"
				]);
			});

			getAlgorithm(numDown);
		}

		it("should hash an input string with an input algorithm", () => {
			mockResponse("test", 23);
			return hashString()
				.then(response => {
					expect(response).to.equal(crypto.createHash("md5").update("test").digest("hex"));
				});
		});

		it("should ask for a string again due to an empty response", () => {
			process.nextTick(() => {
				stdin.send([
					"",
					"\n"
				]);
			});
			mockResponse("test", 46);
			return hashString()
				.then(response => {
					expect(response).to.equal(crypto.createHash("whirlpool").update("test").digest("hex"));
				});
		});

		it("should return to the beginning of the algorithm list if moved down too much", () => {
			mockResponse("test", 100);
			return hashString()
				.then(response => {
					expect(response).to.equal(crypto.createHash("RSA-RIPEMD160").update("test").digest("hex"));
				});
		});

	});
});
