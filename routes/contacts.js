const express = require('express');
const router = express.Router();

/*

Contains the get and post functionality for creating a new contact

*/
router.get('/newContact', (req, res) => {
    res.render('newContact');
})

router.post('/newContact', async (req, res) => {
 
    const firstCheck = req.body.firstNameCreate;
    const lastCheck = req.body.lastNameCreate;
   
    const exisitingContact = await req.db.read('Contacts', [
        { column: 'firstName', value: firstCheck},
        { column: 'lastName' , value: lastCheck }
    ]);

    // if exisitingContact has any elements within it, then the incoming contact is already
    // in the data base
    if(exisitingContact.length > 0){
        console.log('Sorry, that contact already exists. Returning you to the homepage');
        const contacts = await req.db.read('Contacts', []);
        res.render('contact', { error: 'This contact already exists.'});
        return;
    }
    
    await req.db.create('Contacts', [
        { column: 'firstName', value: req.body.firstNameCreate },
        { column: 'lastName', value: req.body.lastNameCreate },
        { column: 'phone', value: req.body.phoneNumCreate },
        { column: 'email', value: req.body.emailCreate },
        { column: 'street', value: req.body.streetCreate },
        { column: 'city', value: req.body.cityCreate },
        { column: 'state', value: req.body.stateCreate },
        { column: 'zip', value: req.body.zipCreate },
        { column: 'country', value: req.body.countryCreate },
        { column: 'contactByEmail', value: req.body.emailCheck !== undefined ? 1 : 0 },
        { column: 'contactByPhone', value: req.body.phoneCheck !== undefined ? 1 : 0 },
        { column: 'contactByMail' , value: req.body.mailCheck !== undefined ? 1 : 0 }
    ]);
    
    console.log(`New contact added to the contacts list: ${firstCheck} ${lastCheck}`);
    res.redirect('/');

});

router.get('/', async (req, res) => {
    try{
        // Get all rows from the Contacts table
        const contacts = await req.db.read('Contacts', []);
        res.render('contact', { contacts }); 
    }catch (error){       
        console.error('Error fetching contacts:', error);
        res.render('contact', { error: 'Failed to retrieve contacts.' });        
    }
});

module.exports = router;