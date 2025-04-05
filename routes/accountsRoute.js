const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

/*  

Contains the get and post functionality for login, sign-up, and logout 

*/

router.get('/login', (req, res) => {
    const createdMessage = req.query.created;
    const loggedOutMessage = req.query.loggedOut;
    const editDeleteMessage = req.query.editDelete;
    res.render('login', {created: createdMessage, loggedOut: loggedOutMessage, editDelete: editDeleteMessage });
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err){
            console.error('Error loggin out:', err);
            return res.redirect('/')
        }
        res.redirect('/login?loggedOut=You have successfully logged out.');
    })
});

router.post('/login', async (req, res) => {
    const usernameTemp = req.body.username;
    const passwordTemp = req.body.password;

    try {
        // Check if the user exists
        const userExist = await req.db.read('Users', [
            { column: 'username', value: usernameTemp }
        ]);

        // If the user does NOT exist
        if (userExist.length === 0) {
            return res.render('login', { error: "Login Failed" });
        }

        // Extract user information
        const user = userExist[0];

        // Check if the password matches (using bcrypt)
        const passwordMatch = bcrypt.compareSync(passwordTemp, user.password);

        if (passwordMatch) {
            // Successful login
            req.session.user = {
                id: user.id,
                username: user.username
            };
            console.log('User logged in successfully!');
            res.redirect('/');
        } else {
            // Incorrect password
            res.render('login', { error: "Incorrect password. Please try again." });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.render('login', { error: 'Failed to retrieve user information from database.' });
    }
});

router.post('/signup', async (req, res) => {

    // First thing we'll do, is collect the data from the req
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const usernameTemp = req.body.usernameTemp;
    const passwordTemp = req.body.passwordTemp;
    const confirmPassTemp = req.body.confirmPassTemp;

    // Check to see if the password and confirm password match
    if(passwordTemp !== confirmPassTemp){
        // If we're here, they don't match, so send it back
        console.log('Passwords do not match. Please re-enter matching passwords');
        res.render('signup', { error: 'Passwords do not match. Please try again '});
        return 
    }

    // If we're here, the passwords match and we can continue
    // Next, we'll check if the username already exists
    try{
        const userNameCheck= await req.db.read('Users', [
            { column: 'username', value: usernameTemp}
        ]);
    
        if(userNameCheck.length > 0){
            // if we're here, we found an exisiting user with same username
            console.log('Exisiting user with matching username found in data base');
            res.render('signup', { error: 'Exisiting user with matching username exists. Please try different username'});
            return;
        }
    
        // if we're here, than password and username are good to continue
        // hash and salt the password is next
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(passwordTemp, salt);
    
        // Now, we can enter the new user in the users database
        await req.db.create('Users', [
            { column: 'firstName', value: firstName},
            { column: 'lastName', value: lastName},
            { column: 'username', value: usernameTemp},
            { column: 'password', value: hashedPassword}
        ]);
    
        console.log(`New user created ${userNameCheck}`);
        res.redirect(`/login?created=Account created. Please login`);
    }catch(error){
        console.error('Error creating the user', error);
        res.render('signup', {error: 'Failed to create user, please try again.'});
    }
});

module.exports = router;