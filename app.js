
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');
const userModel = require('./models/user');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const { default: mongoose } = require('mongoose');


const app = express();
const port = 3000; 
const path = require('path');


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());




const Ticket = require('./models/ticket'); // Import the Ticket model


app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(express.static('public'));


const url = 'mongodb://localhost:27017/mydatabase';




mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Failed to connect to MongoDB', error));

// Define a simple route




// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get('/', (req, res)=>{
  res.render('home');
});


app.post('/create', async (req, res)=>{
  //pahle to user data post krega from form
  let {name, email, password} = req.body;

  // yahan pe email check hoga db me hai ki nahi
  let emailcheck = await userModel.findOne({email});

  // agr email already hai to 
  if (emailcheck){
      res.send("User Already Registered..");
  }

  //agr email nhi hai to account create
  bcrypt.hash(password, 10, async function(err, hash) {
  var userData = await userModel.create({
      name,
      email,
      password: hash
  })

  let token = jwt.sign({email}, "mysecretkey");
  res.cookie("token", token);
  res.send("User Created...");
  
  });
});

app.get('/logout', (req,res)=>{
  res.cookie("token", "");
  res.redirect('/');
})

app.get('/login', (req, res)=>{
  res.render('login');
})


app.post('/validate', async (req,res)=>{
  // email check hoga db me hai ki nhi
  let useremail = await userModel.findOne({email: req.body.email});

  // agr email nahi hai to ....
  if(!useremail) return res.send("Something Went wrong....")

      // agr email hai to ab passcheck hoga
      bcrypt.compare(req.body.password, useremail.password, (err, result)=>{
         
          //agr pass shi h
          if(result == true){
              let token = jwt.sign({email: useremail}, "mysecretkey");
              res.cookie("token", token);
              res.status(200).send('You Can login');
          }else{
             res.render("chatbot")
          }
      })
});

app.get('/profile', isLoggedIn, (req, res)=>{
  console.log(req.user);
  res.render('login');
})

app.get('/ticket',(req,res,next)=>
  {
  res.render('ticket')
  
})

function isLoggedIn(req, res, next){
  if(req.cookies.token === ""){
      res.send('You need to login to access this page');
  }else{
      let data = jwt.verify(req.cookies.token, "mysecretkey");
      req.user = data;
      next();
  }
}



app.get('/chatbot', (req, res) => {
res.render("chatbot.ejs");
  });
  