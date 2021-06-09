import dotenv from "dotenv";
dotenv.config()
import express from "express";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
// const saltRounds = 10;

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("we're connected!");
});

const userSchema = new mongoose.Schema ({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// Adding new level of security with mongoose encryption
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req,res) => {
    res.render("home");
});

app.get("/login", (req,res) => {
    res.render("login");
});

app.get("/register", (req,res) => {
    res.render("register");
});

app.get("/secrets", (req,res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req,res) => {
    req.logout();
    res.redirect("/");
});

app.post("/register", (req,res) => {
    const {username, password} = req.body;
    // bcrypt.hash(password, saltRounds, function(err, hash) {
    //     // Store hash in your password DB.
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         const newUser = new User ({
    //             email: username,
    //             password: hash
    //         });
    //         newUser.save((err) => {
    //             if (err) console.log(err);
    //             else res.render("secrets");
    //         });
    //     }
    // });
    User.register({username: username}, password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", (req,res) => {
    // const {username, password} = req.body
    // User.findOne({email: username}, (err, foundUser) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         if (foundUser) {
    //             bcrypt.compare(password, foundUser.password, function(err, result) {
    //                 if(result === true) {
    //                     res.render("secrets");
    //                 }
    //             });
    //         }
    //     }
    // })
    const {username, password} = req.body;
    const user = new User({
        username:username,
        password:password
    });
    req.login(user, (err) => {
        if(err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    })
})


app.listen("3000", ()=> console.log("Server is running on port 3000"));
