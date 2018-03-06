# Paswo

Paswo is a [Vorpal](https://github.com/dthree/vorpal) command line application that can generate, hash, and manage passwords.

I made this to practice Javascript/Node.js and learn a bit about SQL. 

**Disclaimer: Paswo has only been tested on Mac OS X.**

Please feel free to leave any suggestions or report any bugs.

Thanks!

## Install

```
npm install -g paswo
```

## Usage

### Paswo Commands

Type ```paswo``` into your command line.

![alt text](/media/paswo/paswo.png?raw=true)

#### Generate a random pasword: 

You can specify the length and use the flag -s or --special to include special characters in the password.

```paswo: create ```

```paswo: create [length] -s ```

![alt text](/media/paswo/create.png?raw=true)

#### Hash a string with the chosen hashing algorithm:

```paswo: hash```

![alt text](/media/paswo/hash-choosing.png?raw=true)

![alt text](/media/paswo/hash-complete.png?raw=true)

#### Open database:

The ```db``` command will switch to ```paswo-db``` and connect to your database where you can access your passwords.

```paswo: db```

##### Create a master key:

If the database file does not exist, using ```db``` will ask you to create a new master key for your database and create the database file.

![alt text](/media/paswo/create-master-key.png?raw=true)

##### Use master key to open your database:

If the database file does exist, using ```db``` will ask for your master key to connect to your database.

![alt text](/media/paswo/open-db.png?raw=true)

### Database Commands

After you successfully open your database, you have access to your stored passwords.

![alt text](/media/paswo-db/paswo-db.png?raw=true)

#### Change master key:

```paswo-db: change master key ```

![alt text](/media/paswo-db/change-master-key.png)

#### Add password for a specific website:

```paswo-db: add <website> ```

![alt text](/media/paswo-db/add.png?raw=true)

#### View websites you have added passwords for:

```paswo-db: ls```

![alt text](/media/paswo-db/ls.png?raw=true)

#### Get the password for a specific website:

```paswo-db: get <website>```

![alt text](/media/paswo-db/get.png?raw=true)

#### Update the password for a specific website:

```paswo-db: update <website> ```

![alt text](/media/paswo-db/update.png?raw=true)

#### Delete the password for a specific website:

```paswo-db: delete <website>```

![alt text](/media/paswo-db/delete.png?raw=true)

#### Close database and exit paswo-db:

```paswo-db: exit```

![alt text](/media/paswo-db/exit.png?raw=true)


-----

### License

MIT

