#!/usr/bin/env node
"use strict";

const vorpal = require("vorpal");
const chalk = require("chalk");
const inquirer = require("inquirer");
const clipboardy = require("clipboardy");
const path = require("path");
const LocalStorage = require("node-localstorage").LocalStorage;

/**
* Modules
*/
const {createRandomPassword} = require("./lib/create");
const {hashString} = require("./lib/hash");
const db = require("./lib/database");
const auth = require("./lib/database-auth");

/**
* Variables
*/

const error = chalk.redBright.bold;
const errors = {
	database: error("There was an error accessing the database. Please make sure the database file was not deleted."),
	localStorage: error("Local storage error."),
	masterKey: error("Error: Cannot find masterKey in local storage. Please make sure local storage files were not deleted.")
}

var localStorage = new LocalStorage(path.join(__dirname, "local_storage"));

var paswo = new vorpal().delimiter("paswo:").history("paswo").show().log(chalk.bold.underline.inverse("WELCOME TO PASWO!"));
var paswoDB = new vorpal().delimiter("paswo-db:");

paswoDB.find("exit").remove();

/**
* Commands
*/

paswo
	.command("create [length]", "Generate a random password")
	.option("-s, --special", "Add special characters to random password")
	.action((args, callback) => {
		var addSpecialChars = false;

		if(args.options.special) {
			addSpecialChars = true;
		}

		if(!args.length) {
			args.length = 36;
		}

		createRandomPassword(args.length, addSpecialChars, "sortedWords.txt").then(result => {

			clipboardy.writeSync(result);
			paswo.log(chalk.bold("Copied to clipboard: ") + chalk.hex("#44895F").bold(result));

		}).catch(e => {
			paswo.log(error(e));
		});

		callback();

	});


paswo
	.command("hash", "Hash a string with the chosen algorithm")
	.action((args, callback) => {
		hashString().then(result => {
			clipboardy.writeSync(result);
			paswo.log(chalk.bold("Copied to clipboard: ") + chalk.hex("#446889").bold(result));
			callback();
		}).catch(e => {
			paswo.log(error(e));
			callback();
		});

	});

paswo
	.command("db", "Open password database")
	.action((args, callback) => {

		function openDatabase(masterKey) {
			db.connectDatabase(masterKey, (err)=> {
				if(err) paswo.log(errors.database);
				else paswo.log(chalk.hex("#635E96").bold("Connected to database!"));
			});

			paswoDB.show();
		}

		//if database does not exist, asks the user to create a master key
		if (! db.databaseExists()) {
			auth.createMasterKey().then(key => {
				try {localStorage.setItem("masterKey", auth.hashKey(key))}
				catch(e) {
					paswo.log(errors.localStorage); 
					return callback();
				}

				openDatabase(key);
				callback();
			}).catch(e => {
				paswo.log(error(e));
				callback();
			});
		} else {
			auth.askForMasterKey().then(input => {
				try {
					
					var masterKey = localStorage.getItem("masterKey");
					if(masterKey === null) throw Error();

				} catch(e) {
					paswo.log(errors.masterKey);
					return callback();
				}

				if(!auth.checkMasterKey(input, masterKey)) {
					paswo.log(chalk.hex("#B265A5").bold("Sorry, that is incorrect.")); 
				} else {openDatabase(input)}

				callback();
			}).catch(e => {
				paswo.log(error(e));
				callback();
			});
		}

	});

/**
* Database Commands
*/

paswoDB
	.command("change master key", "Change master key for password database")
	.alias("change key")
	.action((args, callback) => {

		try {
			var masterKey = localStorage.getItem("masterKey");
			if(masterKey === null) throw Error();

		} catch(e) {
			paswoDB.log(errors.masterKey);
			return callback();
		}

		auth.changeMasterKey(masterKey).then(result => {
			if(result) {
				db.changeMasterKey(result, (err) => {
					if(err) paswoDB.log(errors.database);
					else {
						try {localStorage.setItem("masterKey", auth.hashKey(result))}
						catch(e) {
							paswoDB.log(errors.localStorage);
							return callback();
						}

						paswoDB.log(chalk.hex("#583831").bold("Master key changed!")); 
					}

				});

			} else {
				paswoDB.log(chalk.hex("#B265A5").bold("Sorry, that is incorrect.")); 
			}

			callback();

		}).catch(e => {
			paswoDB.log(error(e));
			callback();
		});
	});


paswoDB
	.command("ls", "List all websites in database")
	.alias("list")
	.action((args, callback) => {
		db.listRows((err, result) => {
			if(err) paswoDB.log(errors.database);
			else if(!result.length) paswoDB.log(chalk.hex("#CD8900").bold("No passwords in database."));
			else {
				result.forEach(row => {
					paswoDB.log(chalk.hex("#CD8900").bold(row.website));
				});
			}

			callback();
		});
	});


paswoDB
	.command("add <website>", "Add password to database for specific website")
	.alias("a")
	.action((args, callback) => {
		db.checkRowExistence(args.website, (err, rowExists, password) => {
			if(err) {
				paswoDB.log(errors.database);
				callback();
			} else if(rowExists) {
				paswoDB.log(chalk.red.bold("A password for " + args.website + " already exists. If you would like to update " + 
							"the password for " + args.website + ", please use the 'update' command."));
				callback();
			} else {
				inquirer.prompt([
		 			{
		 				name: "password",
		 				type: "password",
		 				message: "Please enter the password you would like to save for " + args.website + ":",
		 				validate: input => {
		 					if (input.length) return true;
							else return "Please enter a valid string.";
		 				}
		 			}
		 		]).then(input => {
		 			db.insertPassword(args.website, input.password, (err) => {
		 				if(err) paswoDB.log(errors.database);
		 				else paswoDB.log(chalk.hex("#0324A0").bold("Password added!"));
		 				callback();
		 			});

		 		}).catch(e => {
		 			paswoDB.log(error(e));
		 			callback();
		 		});
			}
		});
	});


paswoDB
	.command("get <website>", "Get password for a specific website")
	.alias("g")
	.action((args, callback) => {
		db.getPassword(args.website, (err, result) => {
			if(err) paswoDB.log(errors.database);
			else if (!result) {
				paswoDB.log(chalk.cyan.bold("Can't seem to find a password for " + args.website + "."));
			} else {
				clipboardy.writeSync(result);
				paswoDB.log(chalk.hex("#DC1272").bold("Copied to clipboard."));
			}
			callback();
		});

	});


paswoDB
	.command("update <website>", "Update password for specific website")
	.alias("u")
	.action((args, callback) => {
		db.checkRowExistence(args.website, (err, rowExists, password) => {
			if(err) {
				paswoDB.log(errors.database);
				callback();
			}else if(!rowExists) {
				paswoDB.log(chalk.cyan.bold("Can't seem to find a password for " + args.website + "."));
				callback();
			} else {
				inquirer.prompt([
					{
						name: "newPassword",
						type: "password",
						message: "Please enter a new password for " + args.website + ":",
						validate: input => {
		 					if (input.length) return true;
							else return "Please enter a valid string";
		 				}
					}
				]).then(input => {
					db.updatePassword(args.website, input.newPassword, (err) => {
						if(err) paswoDB.log(errors.database);
						else paswoDB.log(chalk.magenta.bold("Password updated!"));
						callback();
					});
				}).catch(e => {
					paswoDB.log(error(e));
					callback();
				});
			}
		});
	});


paswoDB
	.command("delete <website>", "Delete password for specific website")
	.alias("d")
	.action((args, callback) => {
		db.checkRowExistence(args.website, (err, rowExists, password) => {
			if(err) {
				paswoDB.log(errors.database);
				callback();
			}else if(!rowExists) {
				paswoDB.log(chalk.cyan.bold("Can't seem to find a password for " + args.website + "."));
				callback();
			} else {
				inquirer.prompt([
					{
						name: "confirm",
						type: "confirm",
						message: "Are you sure you want to delete the password for " + args.website + "?"
					}
				]).then(input => {
					if(!input.confirm) paswoDB.log(chalk.hex("#0C3E00").bold("Password is safe."));
					else {
						db.deletePassword(args.website, (err) => {
							if(err) paswoDB.log(errors.database);
							else paswoDB.log(chalk.redBright.bold("Password destroyed."));
						});
					}
					callback();
				}).catch(e => {
					paswoDB.log(error(e));
					callback();
				});
			}
		});
	});


paswoDB
	.command("exit", "Exit the database")
	.action((args, callback) => {
		paswo.show();
		db.closeDatabase((err) => {
			if(err) paswoDB,log(errors.database);
			else {
				paswoDB.log(chalk.yellowBright.bold("Database closed."));
			}
			callback();
		});
	});


