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
const port = process.env.PORT || 5000;

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
    origin: "www.cubextimer.com",
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
    passport.authenticate("local", (err, user, info) => {
        if (err) throw err;
        if (!user) res.status(409).send("No User Exists");
        else {
            req.logIn(user, err => {
                if (err) throw err;
                res.send("Successfully Authenticated");
            });
        }
    })(req, res, next);
});

app.post("/register", (req, res) => {
    User.findOne({ username: req.body.username  }, async (err, doc) => {
        if (err) throw err;
        if (doc) res.status(409).send("User already exists");
        if (!doc) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                email: req.body.email,
                username: req.body.username,
                password: hashedPassword,
                timeRegistered: new Date(),
                timeData: []
            });
            await newUser.save();
            res.send("User Created");
        }
    });
});

app.post("/update", (req, res) => {
    User.findOneAndUpdate({username: req.body.username}, {timeData: req.body.timeData}, async (err, doc) => {
        if (err) throw err;
    })
})

app.get("/user",  (req, res)=>{
    res.send(req.user);
});

app.get('/logout', function(req, res){
    req.logout();
    //res.redirect('/');
    res.send("Logged Out");
});

// Start server
app.listen(port, ()=>{
    console.log(`ready on ${port}`);
});
