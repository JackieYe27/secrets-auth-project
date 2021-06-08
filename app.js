import express from "express";
import mongoose from "mongoose";

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("we're connected!");
});

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req,res) => {
    res.render("home");
});

app.get("/login", (req,res) => {
    res.render("login");
});

app.get("/register", (req,res) => {
    res.render("register");
});
app.get("/logout", (req,res) => {
    res.redirect("/");
});

app.post("/register", (req,res) => {
    const {username, password} = req.body;
    const newUser = new User ({
        email: username,
        password: password
    });
    newUser.save((err) => {
        if (err) console.log(err);
        else res.render("secrets");
    });
});

app.post("/login", (req,res) => {
    const {username, password} = req.body
    User.findOne({email: username}, (err, foundUser) => {
        if(err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
    })
})


app.listen("3000", ()=> console.log("Server is running on port 3000"));
