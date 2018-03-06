const expect = require("chai").expect;
const db = require("./../lib/database");

var testMasterKey = "testMasterKey";
var testWebsite1 = "testWebsite1";
var testWebsite2 = "testWebsite2";
var testPassword1 = "testPassword1";
var testPassword2 = "testPassword2";

//delete database file before testing
describe("Password database", () => {

	describe("connectDatabase", () => {
		it("should create database if file does not exist", (done) => {
			var exists = db.databaseExists();
			expect(exists).to.be.false;

			db.connectDatabase(testMasterKey, (err) => {
				exists = db.databaseExists();
				expect(exists).to.be.true;
				expect(err).to.be.null;
			});

			//close database so we can do next test
			db.closeDatabase((err) => {
				done();
			});

		});

		it("should connect to the database that already exists", (done) => {
			var exists = db.databaseExists();
			expect(exists).to.be.true;

			db.connectDatabase(testMasterKey, (err) => {
				expect(err).to.be.null;
				//tests that the database is open
				db.insertPassword("random", "random", (err) => {
					expect(err).to.be.null;
					done();
				});
			});
		});
	});



	//also tests encryption and decryption
	describe("insertPassword && getPassword", () => {

		it("should insert testPassword1 and get testPassword1", (done) => {
			db.insertPassword(testWebsite1, testPassword1, (err) => {
				expect(err).to.be.null;
				db.getPassword(testWebsite1, (err, output) => {
					expect(output).to.equal(testPassword1);
					done();
				});
			});
		});


		it("should insert testPassword2 and get testPassword2", (done) => {
			db.insertPassword(testWebsite2, testPassword2, (err) => {
				expect(err).to.be.null;
				db.getPassword(testWebsite2, (err, output) => {
					expect(output).to.equal(testPassword2);
					done();
				});
			});
		});

	});

	describe("checkRowExistence", () => {

		it("should return true for rowExists and string for password", (done) => {
			db.checkRowExistence(testWebsite1, (err, rowExists, password) => {
				expect(rowExists).to.be.true;
				expect(password).to.be.a("string")
				done();
			});
		});

		it("should return false for rowExists and null for password", (done) => {
			db.checkRowExistence("randomWebsite", (err, rowExists, password) => {
				expect(rowExists).to.be.false;
				expect(password).to.be.null;
				done();
				
			});
		});

	});


	describe("updatePassword && getPassword", () => {
		it("should update the password for given website", (done) => {
			testPassword1 = "newTestPassword1";
			db.updatePassword(testWebsite1, testPassword1, (err) => {
				expect(err).to.be.null;
				db.getPassword(testWebsite1, (err, output) => {
					expect(output).to.equal(testPassword1);
					done();
				});
			});
		});
	});


	describe("changeMasterKey && listRows", () => {
		it("should encrypt all passwords with new master key", (done) => {

			db.listRows((err, oldRows) => {

				var decryptedPasswordsOld = [];

				oldRows.forEach(row => {
					decryptedPasswordsOld.push(db.decrypt(row.password));
				});

				var newTestMasterKey = "newTestMasterKey";

				db.changeMasterKey(newTestMasterKey, (err) => {

					expect(err).to.be.null;

					db.listRows((err, newRows) => {
						newRows.forEach((row, i) => {
							expect(newRows[i].password).to.not.equal(oldRows[i].password);
							expect(decryptedPasswordsOld[i]).to.equal(db.decrypt(newRows[i].password));
						});

						done();

					});

				});

			});

		});

	});


	describe("deletePassword && getPassword", () => {
		it("should delete password for given website",  (done) => {
			db.deletePassword(testWebsite1, (err) => {
				expect(err).to.be.null;
				db.getPassword(testWebsite1, (err, output) => {
					expect(err).to.be.null;
					done();
				});
			});
		});
	});

	describe("closeDatabase", () => {
		it("should close the connected database", (done) => {
			db.closeDatabase(err => {
				db.getPassword(testWebsite2, (err, output) => {
					expect(err).to.be.an("error");
					done();
				});
			});
		});

	});

});