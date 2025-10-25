const express = require("express")
const bcrypt = require("bcrypt")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")
const path = require("path")
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect("mongodb+srv://guichnicolas:njgy6lBj1LUKAxkx@cluster0.yvhlh.mongodb.net/")

const AccountSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    session: String,
    rankPoints: {type: Number, default: 5000},
    lobbyId: {type: String, default: null}
})

const Account = mongoose.model("rpsaccounts", AccountSchema)

const LobbySchema = new mongoose.Schema({
    ownerId: String,
    ownerName: String,
    opponentId: {type: String, default: null},
    opponentName: {type: String, default: ""}
})

const Lobby = mongoose.model("rpslobbies", LobbySchema)

app.get("/", (req, res) => {
    res.send("Main")
})

app.post("/signUp", async (req, res) => {
    if (req.body.username != "" || req.body.password != "" || req.body.email != "") {
        let account = await Account.find({username: req.body.username})
        if (account.length > 0) {
            res.json({success: false, message: "Username already taken!"})
        } else {
            const salt = await bcrypt.genSalt(10)
            let acc = new Account({
                username: req.body.username,
                password: await bcrypt.hash(req.body.password, salt),
                email: req.body.email
            })
            acc.save()
            res.json({success: true})
        }
        
    } else {
        res.json({success: false, message: "Please fill out all fields!"})
    }
})

app.post("/logIn", async (req, res) => {
    let acc = await Account.find({username: req.body.username})
    if (acc.length > 0 && bcrypt.compare(req.body.password, acc[0].password)) {
        res.json({accountData: acc[0], success: true})
    } else {
        res.json({success: false})
    }
})

app.post("/session", async (req, res) => {
    let acc = await Account.find({_id: req.body.accountId})
    if (acc.length > 0) {
        res.json({success: true})
    } else {
        res.json({success: false})
    }
})

app.post("/createLobby", async (req, res) => {
    let acc = await Account.find({_id: req.body.accountId})
    let lobby = new Lobby({
        ownerId: acc[0]._id,
        ownerName: acc[0].username
    })
    await lobby.save()
    acc[0].lobbyId = lobby._id
    await acc[0].save()
    res.json({success: true, lobbyId: lobby._id})
})

app.get("/getLobbies", async (req, res) => {
    let lobbyList = await Lobby.find()
    res.json({lobbies: lobbyList})
})

app.post("/getLobby", async (req, res) => {
    let lobbyList = await Lobby.find({_id: req.body.lobbyId})
    res.json({lobby: lobbyList[0]})
})

app.post("/joinLobby", async (req, res) => {
    let acc = await Account.find({_id:req.body.accountId})
    acc[0].lobbyId = req.body.lobbyId
    acc[0].save()
    res.json({success: true})
})

//write a /getLobbies get request
//send back a list of available lobbies for people to join

//then in React GameLobby write a compoment did mount function
//it will do 2 things
//1) get all available lobbies and list them out
//2) check local storage and see if this user is already in a lobby, if they are show a blank page instead

app.listen(3001)