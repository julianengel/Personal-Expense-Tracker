const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cost = require('./../models/cost');
const User = require('./../models/user');




router.get('/register', (req, res) => {

    res.render("pages/register")


});

router.get("/dashboard", (req, res) => {


    User.findById(req.session.userId)
        .exec(function(error, user) {
            if (error) {
                res.send(error);
            } else {
                if (user === null) {
                    res.render("pages/register");
                } else {
                    console.log(user._id)
                    getStats(loadData, req, res);
                }
            }
        });


});

router.get("/", (req, res) => {

    User.findById(req.session.userId)
        .exec(function(error, user) {
            if (error) {
                res.send(error)
            } else {
                if (user === null) {
                    res.render("pages/register");
                } else {
                    res.render("pages/index", { debud: true })
                }
            }
        });





})

// router.get('/profile', function (req, res) {

// console.log(req.session)

// // req.session.userID = "blah"
// const uniqueId = req.sessionID
// res.send(`Hit home page. Received the unique id: ${uniqueId}\n`)

// })

// GET route after registering
router.get('/profile', function(req, res, next) {
    User.findById(req.session.userId)
        .exec(function(error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    return next(err);
                } else {
                    console.log(user._id)
                    return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
                }
            }
        });
});



// GET for logout logout
router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.post('/returned', (req,res)=>{
  
  console.log(req.body)
  
})


router.post("/createUser", (req, res) => {
    if (req.body.email &&
        req.body.username &&
        req.body.password) {
        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
        }
        //use schema.create to insert data into the db
        User.create(userData, function(err, user) {
            if (err) {
                return res.send(err)
            } else {
                req.session.userId = user._id;
                req.session.cookie.expires = false;
                return res.redirect('/');
            }
        });
    } else if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function(error, user) {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                res.send(err);
            } else {
                req.session.userId = user._id;
                req.session.cookie.expires = false;
                return res.redirect('/');
            }
        });
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        res.send(err)
    }


})



// app.listen(port, () => console.log(`Example app listening on port ${port}!`))


router.post('/submit', function(req, res) {

    const data = getData(req.body.text);

    if (data.length == 1) {
        res.send([data[0], "error"]);
    } else {
        logCost(data[0], data[1], data[2], data[3], data[4], req, res);
    }


});

function loadData(stats, req, res) {

    // get all the users
    Cost.find({}, null, { sort: { date: -1 } }, function(err, costs) {
        if (err) throw err;

        // object of all the users
        console.log(costs[3]);
        res.render("pages/dash", { costs: costs, totals: stats });
    });

}

function getStats(callback, req, res) {

    Cost.aggregate([{
        $group: {
            _id: "$possesive",
            average_spending_amount: { $avg: "$amount" },
            total_spending_amount: { $sum: "$amount" },
            total_entries: { $sum: 1 }
        }
    }], function(err, result) {
        if (err) {
            console.log("Error: " + err);
        } else {
            // console.log(result);
            loadData(result, req, res);

        }
    });


}


function logCost(amount, label, possesive, today, today_string, req, res) {


    // create a new user
    var newEntry = Cost({
        amount: amount,
        label: label,
        possesive: possesive,
        date: today,
        date_string: today_string
    });
    // save the user
    newEntry.save(function(err) {
        if (err) {

            res.send(["❌ " + err, "error"]);

        } else {

            console.log('Cost created!  ' + newEntry);
            res.send(["✓ " + amount + " euro was spent on " + label + " on the " + today_string, "success"]);
        }
    });


}

const standardSpendings = { "starbucks": 5.45, "marios": 4.0, "digitalocean": 5.0, "hosting": 5.0, "delivery": 0.5 };
const recurringSpending = { "Netflix": 9.99, "Spotify": 9.99, "iCloud Storage": 9.99 };
// Netflix: 20th 
// Spotify: 17th
// iCloud: 30th 

function getData(string) {


    var possesive, today_string, today;

    var amount = string.match(/[+-]?([0-9]*[.])?[0-9]+/g);

    if (string.split(" ").length == 1) {
        today_string = makeDate();
        today = new Date();
        string = string.toLowerCase();

        if (standardSpendings[string] != undefined) {
            const label = string.charAt(0).toUpperCase() + string.slice(1);
            return ([standardSpendings[string], label, "me", today, today_string]);
        } else {
            return ["❓ Please Provide The Amount"];
        }




    } else if (amount == null) {
        amount = "❓ Please Provide The Amount";
        return [amount];
    } else {
        amount = amount[0];

        var separators = ['on', 'for', 'to', 'On', 'For', 'To'];

        var foundRemainder = string.split(new RegExp(separators.join('|'), 'g'));

        var label = foundRemainder[1].substr(1);


        if (foundRemainder.length >= 3) {
            possesive = foundRemainder[2].substr(1);
        } else {
            possesive = "me";
        }
        today_string = makeDate();
        today = new Date();
        return_statement = "";

        // logCost(amount,label,possesive,today)
        // return_statement += amount + " euro was spent on " + label + " on the " + today
        // return (return_statement);
        return ([amount, label, possesive, today, today_string]);

    }



}

function makeDate() {


    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = dd + '/' + mm + '/' + yyyy;
    return today;
}


module.exports = router;