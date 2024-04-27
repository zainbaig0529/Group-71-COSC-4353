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
		var query = "SELECT CONCAT(NameFirst, ' ',  NameLast) AS FullName, ClientAddress1 FROM ClientInformation WHERE ClientID=(SELECT UserID FROM UserCredentials WHERE Username=?)";

		database.query(query, req.session.user, function(err, rows)
		{
			if(err) throw err;

			var siteMessage = "";

			if(rows[0].ClientAddress1 == "")
			{
				siteMessage = "Before proceeding, please tell us more about yourself in the Account Information page.";
			}

			res.render(__dirname + "/views/homepage_session.ejs", {full_name: rows[0].FullName, message: siteMessage});
		});
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
		res.render(__dirname + "/views/login.ejs", {error_message:""});
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
		res.render(__dirname + "/views/registration.ejs", {error_message:""});
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

		database.query(query, req.session.user, function(err, result)
		{
			if(err) throw err;
			res.locals.minimum_date = date_min;
			 
			if(result[0].ClientAddress1 === "" || result[0].ClientAddress1 === null)
			{
				res.locals.deliveryAddress = "";
			}
			else
			{
				res.locals.deliveryAddress = result[0].ClientAddress1 + ", " + result[0].ClientCity + ", " + result[0].ClientState + ", " + result[0].ClientZip;
			}

			res.render(__dirname + "/views/fuel_quote_form.ejs", {error_message: ""});
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
			if(results.length == 0)
			{
				res.render(__dirname + "/views/fuel_quote_history_alt.ejs");
			}
			else
			{
				res.render(__dirname + "/views/fuel_quote_history.ejs", {data: results});
			}
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
		var query = "SELECT * FROM ClientInformation WHERE ClientID=(SELECT UserID FROM UserCredentials WHERE Username=?)";

		database.query(query, req.session.user, function(err, rows)
		{
			if(err)
			{
				res.render(__dirname + "/views/profile_management.ejs", {error_message: "An unknown error has occured. Please refresh the page, and try again."});
			}


			res.render(__dirname + "/views/profile_management.ejs", {error_message:"", first_name: rows[0].NameFirst, last_name: rows[0].NameLast, address_1: rows[0].ClientAddress1, address_2: rows[0].ClientAddress2, city:rows[0].ClientCity, state: rows[0].ClientState, zip: rows[0].ClientZip});
		});
	}
	else
	{
		res.redirect("/default_homepage");
	}
});

//fuel price module
app.post('/processfuelform',
		body('gallons').notEmpty().isNumeric().escape(),
		function(req, res, next)
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

app.post('/login',
		body('email').notEmpty().isEmail().escape(), 
		body('password').notEmpty().isLength({min:8}).escape(),
		function (req, res, next) {
			const errors = validationResult(req);

			if(!errors.isEmpty())
			{
				return res.render(__dirname+ "/views/login.ejs", {error_message: "Invalid data submitted"});
			}

			var email = req.body.email;
			var password = req.body.password;
			var query = "SELECT Username, Password FROM UserCredentials WHERE Username=?";
			database.query(query, email, async function(err, results, fields)
			{
				if(err)
				{
					console.log(err);
					return res.render(__dirname + "/views/login.ejs", {error_message: "An unknown error has occured. Please try again."});
				}

				if(results.length == 0)
				{
					return res.render(__dirname + "/views/login.ejs", {error_message: "User not found"});
				}
				else
				{
					var dbUser = results[0].Username;
					var dbPass = results[0].Password;
					var results = await bcrypt.compare(password, dbPass);
					if(email != dbUser || results == false)
					{
						return res.render(__dirname + "/views/login.ejs", {error_message: "User not found"});
					}
					else
					{
						//code inspired from https://expressjs.com/en/resources/middleware/session.html			
				
						//Regenerate the session to give it a new id
						req.session.regenerate(function(err)
						{
							if(err)
							{
								return res.render(__dirname + "/views/login.ejs", {error_message: "An unknown error has occured. Please try again."});
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
    body('email').notEmpty().isEmail().escape(),
    body('password').notEmpty().isLength({ min: 8 }).escape(),
	body('confirm').notEmpty().isLength({ min:8}).escape(),
    function (req, res) {
		const errors = validationResult(req);
	  	if(!errors.isEmpty())
		{
			return res.render(__dirname + "/views/registration.ejs", {error_message: "Invalid Data Submitted"});
		}
		else if(req.body.password != req.body.confirm)
		{
			return res.render(__dirname + "/views/registration.ejs", {error_message: "Passwords do not match"});
		}


		var username = req.body.email;
		var password = req.body.password;

		// Check if email already exists in system
		var query = "SELECT Username, UserID FROM UserCredentials WHERE Username=?";

		database.query(query, username, function(err, result)
		{
			if(err) throw err;
			if(result.length != 0)
			{
				return res.render(__dirname + "/views/registration.ejs", {error_message: "User already exists"});
			}
			else
			{

				
				// function from the official bcrypt documentation
				bcrypt.genSalt(saltRounds, function (err, salt)
				{
					bcrypt.hash(password, salt, function(err, hash)
					{
				
						var query2 = "INSERT INTO UserCredentials (Username, Password) VALUES (?,?)";
						var queryValues = [username, hash];
							database.query(query2, queryValues, function(err, result)
							{
								if(err) throw err;
								//running the same query again to obtain the UserID of the newly created account
								database.query(query, username, function(err2, result2)
								{
									if(err2) throw err2;

									if(result.length == 0)
									{
										console.log('User was not added to UserCredentials table. Delete this user and try again.');
									}
									else
									{
										//create an empty entry for the user in the ClientInformation table
										//delete and convert to trigger if time allows
										var query1 = "INSERT INTO ClientInformation (NameFirst, NameLast, ClientAddress1, ClientAddress2, ClientCity, ClientState, ClientZip, ClientID) VALUES ('New', 'User', '', '', '', '', '', ?)";
										database.query(query1, result2[0].UserID, function(err3, result3)
										{
											if(err3) throw err;

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
    body('NameFirst').isLength({ min: 1, max: 50 }).escape(),
    body('NameLast').isLength({ min: 1, max: 50 }).escape(),
    body('ClientAddress1').isLength({ min: 1, max: 100 }).escape(),
    body('ClientAddress2').isLength({ min: 0, max: 100 }).escape(),
    body('ClientCity').isLength({ min: 1, max: 100 }).escape(),
	body('ClientState').notEmpty().escape(),
    body('ClientZip').isNumeric().isLength({ min: 5, max: 9 }).escape(),

    function (req, res) {
        const errors = validationResult(req);

        if(!errors.isEmpty())
		{
			throw errors;
        	return res.render(__dirname + "/views/profile_management.ejs", {first_name: req.body.NameFirst, last_name: req.body.NameLast, address_1: req.body.ClientAddress1, address_2: req.body.ClientAddress2, city: req.body.ClientCity, state: req.body.ClientState, zip: req.body.ClientZip, error_message: "Form data invalid. Please try again."});
		}

        const firstName = req.body.NameFirst;
		const lastName = req.body.NameLast;
		const address1 = req.body.ClientAddress1;
		const address2 = req.body.ClientAddress2;
		const city = req.body.ClientCity;
		const state = req.body.ClientState;
		const zipcode = req.body.ClientZip;
	
		
        const query = "UPDATE ClientInformation SET NameFirst=?, NameLast=?, ClientAddress1=?, ClientAddress2=?, ClientCity=?, ClientState=?, ClientZip=? WHERE ClientID=(SELECT UserID FROM UserCredentials WHERE Username=?)";
        const values = [firstName, lastName, address1, address2, city, state, zipcode, req.session.user];

        database.query(query, values, async function (err, result) {
            if (err) throw err;
            
			console.log("User profile data added successfully");
            	
			res.redirect('/user_homepage');
        	});
});

app.post('/fuel_quote_form',
    body('GallonsRequested').notEmpty().isNumeric().escape(),
	body('DeliveryAddress').notEmpty().escape(),
	body('OrderDate').notEmpty().escape(),
	body('SuggestedPricePerGallon').notEmpty().isNumeric().escape(),
	body('TotalAmountDue').notEmpty().isNumeric().escape(),
    function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty())
		{
        	return res.render(__dirname + '/views/fuel_quote_form.ejs', {error_message: "Invalid data. Please try again."});
		}

	var GallonsRequested = req.body.GallonsRequested;
	var FuelRate = req.body.SuggestedPricePerGallon;
	var TotalAmountDue = req.body.TotalAmountDue;
	var DeliveryAddress = req.body.DeliveryAddress;
	var DeliveryDate = req.body.OrderDate;
	
        const query = "INSERT INTO FuelQuote (GallonsRequested, FuelRate, TotalPrice, DeliveryAddress, DeliveryDate, CustomerID) VALUES (?, ?, ?, ?, ?,(SELECT UserID From UserCredentials WHERE Username=?))";
        const values = [GallonsRequested, FuelRate, TotalAmountDue, DeliveryAddress, DeliveryDate, req.session.user];

        database.query(query, values, function (err, result) {
            if (err) throw err;
            console.log("Fuel quote data added successfully");
            
			res.redirect('/user_homepage');
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
