const { open } = require("sqlite");
const bcrypt = require("bcrypt");
const path = require("path");

const dbPath = path.join(__dirname, "userdata.db");
console.log(dbPath);

const hashedPassword = bcrypt.hash("ravi@23", 10);

const createUserQuery = `INSERT INTO user(username, name, password) VALUES ('ravi23','ravikiran','${hashedPassword}')`;

const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database(dbPath);

db.run(createUserQuery);

db.close();
