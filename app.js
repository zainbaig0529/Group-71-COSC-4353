const express = require('express');
var bodyParser=require("body-parser");
const app = express();
const PORT = 3000;
const {body, validationResult} = require('express-validator');

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

	res.status(200).json(
	{
		success: true,
		message: 'Login Successful',
	})

	//Will send to database when set up. For now, checks if data is in valid formats.
});

app.post('/registration.html', function (req, res) {
  console.log(req.body.email);
});

app.post('/profile_management.html',
        body('firstName').isLength({min:1, max:50}).withMessage('Invalid first name'),
		body('lastName').isLength({min:1, max:50}).withMessage('Invalid last name'),
		body('address1').isLength({min:1, max:100}).withMessage('Invalid address 1'),
		body('address2').isLength({min:0, max:100}).withMessage('Invalid address 2'),
		body('city').isLength({min:1, max:100}).withMessage('Invalid city'),
        body('zipcode').isNumeric().isLength({min:5, max:9}).withMessage('Invalid password. Must be at least 8 characters'),
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

    res.status(200).json(
    {
        success: true,
        message: 'All data valid',
    })

    //Will send to database when set up. For now, checks if data is in valid formats.
});

app.post('/fuel_quote_form.html',
		body('gallonsRequested').isLength({min:1}),
		body('deliveryAddress').isLength({min:1, max:100}),
		function(req, res)
{
	const data = {
	price_per_gallon: 1.25,
	total_amount_due: 100,
	};
	
	res.render('fuel_quote_form_results', price_per_gallon, total_amount_due);

    //Will send to database when set up. For now, checks if data is in valid formats.
});


app.listen(3000, function () {
  console.log("Server is running on localhost3000");
});
