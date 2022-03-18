const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const dbPath = path.join(__dirname, "userdata.db");

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3004, () => {
      console.log("Server Running at http://localhost:3004");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(-1);
  }
};
initializeDBAndServer();

// Login

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  console.log(username);
  console.log(password);
  // check if the username exists
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `;
  const dbUser = await database.get(selectUserQuery);
  if (!dbUser) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordMatched) {
      response.status(400);
      response.send("Invalid password");
    } else {
      const payload = { username };
      const jwtToken = jwt.sign(payload, "MY_SECRET_KEY");
      response.send({ jwtToken });
    }
  }
});

// Authentication Middleware
const authenticateUser = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (!authHeader) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwtToken = authHeader.split(" ")[1];
    jwt.verify(jwtToken, "MY_SECRET_KEY", (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.username = payload.username;
        next();
      }
    });
  }
};

// Insert data

app.post("/files/upload/", authenticateUser, async (request, response) => {
  const userFiles = request.body;
  const values = userFiles.map(
    (eachFile) =>
      `("${eachFile.userId}", ${eachFile.id}, ${eachFile.title}, ${eachFile.body})`
  );

  const valuesString = values.join(",");

  const uploadUserFilesQuery = `
    INSERT INTO
      file (user_id, id, title, body)
    VALUES
        ${valuesString};`;

  const dbResponse = await db.run(uploadUserFilesQuery);
  response.send("Success");
});

// get user files
app.get("/userfiles/", authenticateUser, async (request, response) => {
  const data = await db.all(`
    SELECT * FROM userData order by id
    `);
  response.send({ data });
});

module.exports = app;
