const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require("./user")

const app = express();
const port = 5000;

mongoose.connect("mongodb+srv://Menthol:Dz020210@cubex-main.gdxri.mongodb.net/test?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    ()=>{
        console.log("Mongoose is connected");
    }
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.use(session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true
}))

app.use(cookieParser("secretcode"))

app.use(passport.initialize());
app.use(passport.session());

require("./passportConfig")(passport);
// --------------------------------------------------------------------------- 

// Routes
app.post("/login", (req, res, next) => {
    console.log("yeet");
    passport.authenticate("local", (err, user, info) => {
        if (err) throw err;
        if (!user) res.send("No User Exists");
        else {
            req.logIn(user, err => {
                if (err) throw err;
                res.send("Successfully Authenticated");
                console.log(req.user);
            });
        }
    })(req, res, next);
});

app.post("/register", (req, res) => {
    User.findOne({username: req.body.username}, async (err, doc) => {
        if (err) throw err;
        if (doc) res.send("User already exists");
        if (!doc) {
            const hashedPass = await bcrypt.hash(req.body.password, 10); 
            const newUser = new User({
                username: req.body.username,
                password: hashedPass
            });
            await newUser.save();
            res.send ("User Created");
        }
       
    })
})

app.get("/user", (req, res)=>{
    res.send(req.user);
});

// Start server
app.listen(port, ()=>{
    console.log(`ready on ${port}`);
});
