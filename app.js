const express = require('express');
const app = express();
const PORT = 3000;
const {body, validationResult} = require('express-validator');
const session = require('express-session');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');
const MySQLStore = require('express-mysql-session')(session);
const {v1: uuidv1} = require('uuid');
const md5 = require('md5');
const bodyParser = require('body-parser');

//Variables for encryption
const bcrypt = require('bcrypt');
const saltRounds = 10;

//Create connection to MySQL
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
app.use(express.static('views'));

app.use(bodyParser.urlencoded({extended:true}));

//Renders a user page if signed in
app.get("/user_homepage",  function (req, res) {
	
	if(req.session.user)
	{
		res.sendFile(__dirname + "/public/homepage_session.html");
	}
	else
	{
		res.redirect("/default_homepage");
	}
});

//renders the default page when not signed in
app.get("/default_homepage", function (req, res) {
	
	if(!req.session.user)
	{
		res.sendFile(__dirname + "/public/homepage.html");
	}
	else
	{
		res.redirect("/user_homepage");
	}
});

//redirect from the root page based on user authentication
app.get("/", function(req, res)
{
	if(!req.session.user)
	{
		res.redirect("/default_homepage");
	}
	else
	{
		res.redirect("/user_homepage");
	}
});

// render pages on request
app.get('/login', function(req, res)
{
	if(!req.session.user)
	{
		res.sendFile(__dirname + "/public/login.html");
	}
	else
	{
		res.redirect("/user_homepage");
	}
});

app.get('/register', function(req, res)
{
	if(!req.session.user)
	{
		res.sendFile(__dirname + "/public/registration.html");
	}
	else
	{
		res.redirect("/user_homepage");
	}
});

//removes a user session from the database, and returns a user to the default homepage.
//In that order.
app.get('/logout', function(req, res)
{
	// code inspired from https://expressjs.com/en/resources/middleware/session.html
	req.session.user = null;
	req.session.save(function(err)
	{
		if(err)
		{
			next(err);
		}

		req.session.regenerate(function (err)
		{
			if(err)
			{
				next(err);
			}

			res.redirect("/default_homepage");
		});
	});
});

app.get('/fuel_quote_form', function(req, res)
{
	if(req.session.user)
	{
		// code to ge today's date from https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
		var date_min = new Date();
		var dd = String(date_min.getDate()).padStart(2,0);
		var mm = String(date_min.getMonth() + 1).padStart(2,0);
		var yyyy = String(date_min.getFullYear());

		date_min = yyyy + "-" + mm + "-" + dd;

		const query="SELECT ClientAddress1, ClientCity, ClientState, ClientZip From ClientInformation WHERE ClientID IN (SELECT UserID FROM UserCredentials WHERE Username=?)"
		const val = req.session.user;

		database.query(query, val, function(err, result)
		{
			if(err) throw err;
			res.locals.minimum_date = date_min;
			res.locals.deliveryAddress = result[0].ClientAddress1 + ", " + result[0].ClientCity + ", " + result[0].ClientState + ", " + result[0].ClientZip;
			res.render(__dirname + "/views/fuel_quote_form.ejs");
		});
	}
	else
	{
		res.redirect("/default_homepage");
	}
});

app.get('/fuel_quote_history', function(req, res)
{
	if(req.session.user)
	{
		
		var query = "SELECT * FROM FuelQuote WHERE CustomerID=(SELECT UserID FROM UserCredentials WHERE Username=?)";
	

		database.query(query, req.session.user, function(err, results)
		{
			if(err) throw err;
			res.render(__dirname + "/views/fuel_quote_history.ejs", {data: results});
		});

	}
	else
	{

		res.redirect("/default_homepage", {data: results});
	}
});

app.get('/profile_management', function(req, res)
{
	
	if(req.session.user)
	{
		res.sendFile(__dirname + "/public/profile_management.html");
	}
	else
	{
		res.redirect("/default_homepage");
	}
});

app.post('/processfuelform', function(req, res, next)
{
	
	var query1 = "select count(CustomerID) as quotes from FuelQuote where CustomerID=(select UserID from UserCredentials where Username=?)"

	var query2 = "select ClientState from ClientInformation where ClientID=(select UserID from UserCredentials where Username=?)"

	var locationFactor = 0.04;
	var historyFactor = 0.00;
	var gallonFactor = 0.03;
	const profitFactor = 0.1;
	const currentPrice = 1.50;
	
	database.query(query1, req.session.user, function(err1, rows1, var1)
	{
		if(err1) throw err1;

		database.query(query2, req.session.user, function(err2, rows2, var2)
		{
			if(err2) throw err2;

			if(rows2[0].ClientState == "TX")
			{
				locationFactor = 0.02;
			}

			if(rows1[0].quotes == 0)
			{
				historyFactor = 0.01;
			}

			if(req.body.gallons > 1000)
			{
				gallonFactor = 0.02;
			}
			
			var margin = currentPrice * (locationFactor - historyFactor + gallonFactor + profitFactor);

			var suggestedPrice = currentPrice + margin;

			var totalDue = req.body.gallons * suggestedPrice;

			var suggestedString = suggestedPrice + "$" + totalDue;

			res.send(suggestedString);
		});
	});

});

//process info sent from pages
app.post('/login',
		body('email').isEmail().withMessage('Invalid email'), 
		body('password').isLength({min:8}).withMessage('Invalid password. Must be at least 8 characters.'),
		function (req, res, next) {
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
	var query = "SELECT Username, Password FROM UserCredentials WHERE Username='" + email + "'";
	database.query(query, async function(err, results, fields)
	{
		if(err)
		{
			throw err;
		}

		if(results.length == 0)
		{
			console.log("Data not found in database.");
			res.redirect('/login');
		}
		else
		{
			var dbUser = results[0].Username;
			var dbPass = results[0].Password;
			var results = await bcrypt.compare(password, dbPass);
			if(email != dbUser || results == false)
			{
				console.log("Data does not match any records in database");
				res.redirect('/login');
			}
			else
			{
				//code inspired from https://expressjs.com/en/resources/middleware/session.html			
		
				//Regenerate the session to give it a new id
				req.session.regenerate(function(err)
				{
					if(err)
					{
						next(err);
					}
						
					//attach user's ID to session
					req.session.user = dbUser;

					//save session before redirect
					req.session.save(function(err)
					{
						if(err)
						{
							next(err);
						}
		
						res.redirect('/user_homepage');
					});
				});			
		
			}
		}
	});
});

app.post('/register',
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

	// Check if email already exists in system
	var query = "SELECT Username, UserID FROM UserCredentials WHERE Username='" + username + "'";

	database.query(query, function(err, result)
	{
		if(err) throw err;
		if(result.length != 0)
		{
			console.log('User already exists!');
			res.redirect('/register');
		}
		else
		{

			
			// function from the official bcrypt documentation
			bcrypt.genSalt(saltRounds, function (err, salt)
			{
				bcrypt.hash(password, salt, function(err, hash)
				{
			
					var query2 = "INSERT INTO UserCredentials (Username, Password) VALUES ('" + username + "', '" + hash + "')";

    					database.query(query2, function(err, result)
    					{
        					if(err) throw err;

							database.query(query, function(err, result2)
							{
								if(err) throw err;

								if(result.length == 0)
								{
									console.log('User was not added to UserCredentials table. Delete this user and try again.');
								}
								else
								{

									var query1 = "INSERT INTO ClientInformation (NameFirst, NameLast, ClientAddress1, ClientAddress2, ClientCity, ClientState, ClientZip, ClientID) VALUES ('', '', '', '', '', '', '', '" + result2[0].UserID + "')";
									database.query(query1, function(err, result3)
									{
										if(err) throw err;

										console.log("Blank entries created in ClientInformation table.");
									});
								}

							});

        					console.log("Values added to user credentials table successfully");
							res.redirect('/login');
    					});
				});
			});
		}
	});
});

app.post('/profile_management',
    body('NameFirst').isLength({ min: 1, max: 50 }).withMessage('Invalid first name'),
    body('NameLast').isLength({ min: 1, max: 50 }).withMessage('Invalid last name'),
    body('ClientAddress1').isLength({ min: 1, max: 100 }).withMessage('Invalid address 1'),
    body('ClientAddress2').isLength({ min: 0, max: 100 }).withMessage('Invalid address 2'),
    body('ClientCity').isLength({ min: 1, max: 100 }).withMessage('Invalid city'),
	body('ClientState').notEmpty().withMessage('Invalid State'),
    body('ClientZip').isNumeric().isLength({ min: 5, max: 9 }).withMessage('Invalid zipcode. Must be between 5 and 9 digits'),

    function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const firstName = req.body.NameFirst;
		const lastName = req.body.NameLast;
		const address1 = req.body.ClientAddress1;
		const address2 = req.body.ClientAddress2;
		const city = req.body.ClientCity;
		const state = req.body.ClientState;
		const zipcode = req.body.ClientZip;
	
		
		const query2 = "SELECT UserID FROM UserCredentials WHERE Username='" + req.session.user + "'";
		database.query(query2, function(err, upperResult)
		{
			if(err) throw err;
			
        	// Insert user profile data into the database
        	const query = "UPDATE ClientInformation SET NameFirst=?, NameLast=?, ClientAddress1=?, ClientAddress2=?, ClientCity=?, ClientState=?, ClientZip=? WHERE ClientID=?";
        	const values = [firstName, lastName, address1, address2, city, state, zipcode, upperResult[0].UserID];

        	database.query(query, values, async function (err, result) {
            	if (err) {
                	console.error("Error inserting user profile data:", err);
                	return res.status(500).json({
                    	success: false,
                    	message: 'Error inserting user profile data'
                	});
            	}
            	console.log("User profile data added successfully");
            	
				res.redirect('/user_homepage');
        	});
    });
});

app.post('/fuel_quote_form',
    body('GallonsRequested').isNumeric().withMessage('Gallons requested must be a number'),
    function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

	var GallonsRequested = req.body.GallonsRequested;
	var FuelRate = req.body.SuggestedPricePerGallon;
	var TotalAmountDue = req.body.TotalAmountDue;
	var DeliveryAddress = req.body.DeliveryAddress;
	var DeliveryDate = req.body.OrderDate;
        // Insert fuel quote data into the database
        const query = "INSERT INTO FuelQuote (GallonsRequested, FuelRate, TotalPrice, DeliveryAddress, DeliveryDate, CustomerID) VALUES (?, ?, ?, ?, ?,(SELECT UserID From UserCredentials WHERE Username=?))";
        const values = [GallonsRequested, FuelRate, TotalAmountDue, DeliveryAddress, DeliveryDate, req.session.user];

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
