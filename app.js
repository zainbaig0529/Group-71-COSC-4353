const express = require('express');
var bodyParser = require("body-parser");
const app = express();
const PORT = 3000;
const {body, validationResult} = require('express-validator');
const session = require('express-session');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');
const MySQLStore = require('express-mysql-session')(session);
const {v1: uuidv1} = require('uuid');

//create connection to MySQL
const options = {
	host: 'group-71-cosc-4353.c902yu2q8xbp.us-east-2.rds.amazonaws.com',
	user:'admin',
	password: 'cosc4353',
	database: 'Group_71_COSC_4353'
};

const database = mysql.createConnection(options);
database.connect(function(err)
{
	if(err) throw err;
	console.log("Database connection successful!");
});

//Initialise session management
const sessionStore = new MySQLStore(
						 {
						 	clearExpired: true,
							endConnectionOnClose: true,
							disableTouch: false
						 }, database);

app.use(session(
{
	genid: function(req)
	{
		return uuidv1();
	},
	name: 'Cougarville Gas Cookie',
	secret: 'change me later',
	store: sessionStore,
	resave: false,
	saveUninitialized: false,
	cookie: {secure: true,
			 httpOnly: true
			}
}));

app.set('view engine','ejs');

//tell app where to find static content
app.use(express.static('public'));
app.use(express.static('assets'));
app.use(express.static('src'));

//middleware for login page
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/homepage.html");
});

app.post('/login.html',
		body('email').isEmail().withMessage('Invalid email'), 
		body('password').isLength({min:8}).withMessage('Invalid password. Must be at least 8 characters'),
		function (req, res) {
    const errors = validationResult(req);

	if(!errors.isEmpty())
	{
		return res.status(400).json(
		{
			success: false,
			errors:errors.array()
		});
	}

	var email = req.body.email;
	var password = req.body.password;
	var query = "SELECT Username, Password FROM UserCredentials WHERE Username=" + email + " AND Password=" + password;

	database.query(query, function(err, result)
	{
		if(err) throw err;

		if(result[0].Username == "" || result[0].Password == "")
		{
			console.log("not found");
			res.redirect('/login.html');
		}

		console.log("successfully found record");
	});

	//Will send to database when set up. For now, checks if data is in valid formats.
});

app.post('/registration.html',
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Invalid password. Must be at least 8 characters'),
    function (req, res) {
    const errors = validationResult(req);
  if(!errors.isEmpty())
  {
        return res.status(400).json(
        {
            success: false,
            errors:errors.array()
        });
    }


	var username = req.body.email;
    var password = req.body.password;
    var query = "INSERT INTO UserCredentials (Username, Password) VALUES ('" + username + "', MD5('" + password + "'))";

    database.query(query, function(err, result)
    {
        if(err) throw err;
        console.log("Values added to user credentials table successfully");
    });

	res.redirect('/login.html');
	
});

app.post('/profile_management.html',
    body('NameFirst').isLength({ min: 1, max: 50 }).withMessage('Invalid first name'),
    body('NameLast').isLength({ min: 1, max: 50 }).withMessage('Invalid last name'),
    body('ClientAddress1').isLength({ min: 1, max: 100 }).withMessage('Invalid address 1'),
    body('ClientAddress2').isLength({ max: 100 }).withMessage('Invalid address 2'),
    body('ClientCity').isLength({ min: 1, max: 100 }).withMessage('Invalid city'),
    body('ClientState').notEmpty().withMessage('State is required'),
    body('ClientZip').isNumeric().isLength({ min: 5, max: 9 }).withMessage('Invalid zipcode. Must be between 5 and 9 digits'),

    function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { NameFirst, NameLast, ClientAddress1, ClientAddress2, ClientCity, ClientState, ClientZip } = req.body;


        const query = "INSERT INTO ClientInformation (NameFirst, NameLast, ClientAddress1, ClientAddress2, ClientCity, ClientState, ClientZip) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [NameFirst, NameLast, ClientAddress1, ClientAddress2 || null, ClientCity, ClientState, ClientZip];

        database.query(query, values, function (err, result) {
            if (err) {
                console.error("Error inserting client information:", err);
                return res.status(500).json({
                    success: false,
                    message: 'Error inserting client information'
                });
            }
            console.log("Client information added successfully");
            return res.status(200).json({
                success: true,
                message: 'Client information submitted successfully'
            });
        });
    });




/*app.post('/profile_management.html',
    body('firstName').isLength({ min: 1, max: 50 }).withMessage('Invalid first name'),
    body('lastName').isLength({ min: 1, max: 50 }).withMessage('Invalid last name'),
    body('address1').isLength({ min: 1, max: 100 }).withMessage('Invalid address 1'),
    body('address2').isLength({ min: 0, max: 100 }).withMessage('Invalid address 2'),
    body('city').isLength({ min: 1, max: 100 }).withMessage('Invalid city'),
    body('zipcode').isNumeric().isLength({ min: 5, max: 9 }).withMessage('Invalid zipcode. Must be between 5 and 9 digits'),

    function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { firstName, lastName, address1, address2, city, zipcode } = req.body;

        // Insert user profile data into the database
        const query = "INSERT INTO UserCredentials (FirstName, LastName, Address1, Address2, City, Zipcode) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [firstName, lastName, address1, address2, city, zipcode];

        database.query(query, values, function (err, result) {
            if (err) {
                console.error("Error inserting user profile data:", err);
                return res.status(500).json({
                    success: false,
                    message: 'Error inserting user profile data'
                });
            }
            console.log("User profile data added successfully");
            // Send response with success message
            return res.status(200).json({
                success: true,
                message: 'User profile submitted successfully'
            });
        });
    }); */


app.post('/fuel_quote_form.html',
    body('GallonsRequested').isNumeric().withMessage('Gallons requested must be a number'),
    function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { GallonsRequested, ClientOutOfState, ClientNew } = req.body;

        console.log("GallonsRequested:", GallonsRequested);
        console.log("ClientOutOfState:", ClientOutOfState);
        console.log("ClientNew:", ClientNew);

        // Insert fuel quote data into the database
        const query = "INSERT INTO FuelQuote (GallonsRequested, ClientOutOfState, ClientNew) VALUES (?, ?, ?)";
        const values = [GallonsRequested, ClientOutOfState, ClientNew];

        database.query(query, values, function (err, result) {
            if (err) {
                console.error("Error inserting fuel quote data:", err);
                return res.status(500).json({
                    success: false,
                    message: 'Error inserting fuel quote data'
                });
            }
            console.log("Fuel quote data added successfully");
            // Send response with success message
            return res.status(200).json({
                success: true,
                message: 'Fuel quote submitted successfully'
            });
        });
    });





https.createServer(
	{
		key: fs.readFileSync("ssl_certs/key.pem"),
		cert: fs.readFileSync("ssl_certs/cert.pem"),
	},
	app).listen(PORT, function () {
  console.log("Server is running on localhost3000");
});
