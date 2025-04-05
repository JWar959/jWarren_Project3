
require('dotenv').config();
const Database = require('./index');
const bcrypt = require('bcryptjs');

/*
John Warren
CMPS 369
Web Application Development
Project 2
*/

const db = new Database();
db.initialize().then( async () => {

    console.log('Database initialization complete!');
    // call the default admin function here
    await addDefaultUser(db);

}).catch(err => {
    console.error('Database initialization failed:', err);
});

const pug = require('pug');
const express = require('express');
const session = require('express-session');

// We can add the default user in here
async function addDefaultUser(db){
    
    // assign the default user name and password first
    const adminUsername = 'cmps369';
    const adminPassword = 'rcnj';

    // Check to see if the user exists 
    const existingUser = await db.read('Users',[
        { column: 'username', value: adminUsername}
    ]);

    if(existingUser.length === 0){
        // If we're here, then we have a new user
        // We'll need to hash and salt next.
       const salt = bcrypt.genSaltSync(10);
       const hashedPassword = bcrypt.hashSync(adminPassword, salt);
       
       // Now, we can safely add the admin user to the Database
       await db.create('Users', [
        { column: 'firstName', value: 'Admin'},
        { column: 'lastName', value: 'User'},
        { column: 'username', value: adminUsername },
        { column: 'password', value: hashedPassword }
       ]);

       console.log(`Default admin account created: %{adminUserName}`);
    }
    else{
        // If we're here, the account already exists
        console.log(`Admin account already exists ${adminUsername}`);
    }
}

const app = express();

app.use(express.urlencoded({extended : true})); 
app.set('view engine', 'pug');

// Use Middleware to attach db to requests
app.use((req, res, next) => {
    req.db = db;
    next();
})

// Session setup
app.use(session({
    secret: 'cmps369',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Allow pug templates the user's data if the session exists
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = {
            id: req.session.user.id,
            email: req.session.user.email
        };
    }
    next();
});

// connect the routes that we split into a seperate folder
app.use('/accounts', require('./routes/accountsRoute'));
app.use('/contact', require('./routes/contactsRoute'));
app.use('/', require('./routes/accountsRoute'));
app.use('/', require('./routes/contacts'));

app.listen(8080, () => {
    console.log('App listening on port 8080');
});