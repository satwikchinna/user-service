const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
var bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
app.use(bodyParser.json());
const { MongoClient } = require("mongodb");
const port = 3000;
const { v4: uuidv4 } = require("uuid");
const url = "mongodb+srv://tribe:tribe@cluster0.9b4n2.mongodb.net/test";
const client = new MongoClient(url);
const dbName = "tribe";

app.post(
  "/signup",
  body("email").isEmail(),
  body("username").isLength({ min: 5 }),
  body("password").isLength({ min: 5 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const users = client.db(dbName).collection("users");
      const existingUser = await users.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ error: "email already registered" });
      }
      let testAccount = await nodemailer.createTestAccount();
      var transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      await users.insertOne({
        userId: uuidv4(),
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
      });

      message = {
        from: "satwikchinna97@gmail.com",
        to: req.body.email,
        subject: "Welcome to invest with tribe",
        text: `Hello ${req.body.username} ,
        Welcome to the tribe , you're successfully registered with us. Get ready for an delightful experience`,
      };
      transporter.sendMail(message, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      });
      res.status(201).json({ success: "user registered successfuly" });
    } catch (error) {
      next(error.message);
    }
  }
);
async function connect() {
  await client.connect();
  console.log("Connected successfully to server");

  return "done.";
}
connect().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
});
