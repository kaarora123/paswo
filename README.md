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

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo/paswo.png">

#### Generate a random pasword: 

You can specify the length and use the flag -s or --special to include special characters in the password.

```paswo: create ```

```paswo: create [length] -s ```

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo/create.png">

#### Hash a string with the chosen hashing algorithm:

```paswo: hash```

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo/hash-choosing.png">
<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo/hash-complete.png">

#### Open database:

The ```db``` command will switch to ```paswo-db``` and connect to your database where you can access your passwords.

```paswo: db```

##### Create a master key:

If the database file does not exist, using ```db``` will ask you to create a new master key for your database and create the database file.

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo/create-master-key.png">

##### Use master key to open your database:

If the database file does exist, using ```db``` will ask for your master key to connect to your database.

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo/open-db.png">

### Database Commands

After you successfully open your database, you have access to your stored passwords.

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo-db/paswo-db.png">

#### Change master key:

```paswo-db: change master key ```

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo-db/change-master-key.png">

#### Add password for a specific website:

```paswo-db: add <website> ```

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo-db/add.png">

#### View websites you have added passwords for:

```paswo-db: ls```

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo-db/ls.png">

#### Get the password for a specific website:

```paswo-db: get <website>```

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo-db/get.png">

#### Update the password for a specific website:

```paswo-db: update <website> ```

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo-db/update.png">

#### Delete the password for a specific website:

```paswo-db: delete <website>```

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo-db/delete.png">

#### Close database and exit paswo-db:

```paswo-db: exit```

<img src="https://raw.githubusercontent.com/kaarora123/paswo/master/media/paswo-db/exit.png">

-----

### License

MIT

