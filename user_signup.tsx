const express = require('express')
const app = express()
const port = 3000
const bodyparser = require("body-parser")
const mysql_connector = require("mysql");
require("dotenv").config();
const dotenv = require("dotenv")
const sha256 = require("sha256")
const jwt = require('jsonwebtoken')
dotenv.config()
// Connrction configuration
const connection = mysql_connector.createConnection({
    host: 'localhost',
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: "sys",
})


const jwt_key = process.env.JWT_KEY
connection.connect()
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }));

//Steps to follow for signup
// 0.Connect to the DB
// 1.Enter name
// 2.Enter  unique username
// 3.set password
// 4.use SHA256 to encrypt password and save it to db
// 5.generate a jwt token and send to the server
// 6.Save the data to the db

//middleware for authentication
function authenticate(req, res, next) {
    const header = req.header['authorization']
    const token = header && header.split(' ')[1]
    console.log(token)
    next()
}

app.post("/", (req, res) => {
    try {
        // const object = JSON.parse(req.body)
        const password = sha256(req.body.password)
        connection.query(`Insert into marketplace_user (username,name,password) values ('${req.body.username}','${req.body.name}','${password.toString()}' )`, function (error, result) {
            console.log("result to the query is " + result)
            console.log(error)
            res.send("success")
        })
    }
    catch (error) {
        console.log(error);
    }

})

app.get("/login", (req, res) => {
    res.send("Welcome to login page")
})
app.post("/login", (req, res) => {
    connection.query(`select * from marketplace_user where username='${req.body.username}' AND password='${req.body.password}'`, function (error, result) {
        if (result != "") {
            console.log(result)
            const token = jwt.sign(req.body.username, jwt_key)
            res.send(token)
        } else {
            console.log(error)
            res.send("username or password is incorrect")
        }
    })
})

app.get("/admin", authenticate, (req, res) => {
    res.send("Welcome admin  !!!!")
})


app.listen(port, () => {
    console.log("I am On !!" + port)
})