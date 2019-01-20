const express = require('express')
const app = express()
const port = 3000
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
// grab the user model
const Cost = require('./models/cost');
require('dotenv').config();

var db, db_address,db_name, db_string;




var debugging = false

if (debugging){
    db_string = process.env.db_string_debug

} else{
    db_string = db_string = process.env.db_string_prod
}

db_address = process.env.db_user + ":" + process.env.db_password + "@" + db_string


mongoose.set('bufferCommands', false);

mongoose.connection.on("open", function(ref) {
    return console.log("Connected to mongo server!");
});

mongoose.connection.on("error", function(err) {
    console.log("Could not connect to mongo server!");
    return console.log(err.message);
});

try {
    mongoose.connect("mongodb://" + db_address);
    db = mongoose.connection;
    console.log("Started connection on " + ("mongodb://" + "Atlas") + ", waiting for it to open...");
} catch (err) {
    console.log(("Setting up failed to connect to " + db_address), err.message);
}


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', (req, res) => {

    res.render("pages/index")


})

app.get("/dashboard", (req, res) => {

    // res.render("pages/dash")
    getStats(loadData,req,res)


})



app.listen(port, () => console.log(`Example app listening on port ${port}!`))


app.post('/submit', function(req, res) {

    const data = getData(req.body.text)

    if (data.length == 1) {
        res.send([data[0], "error"])
    } else {
        logCost(data[0], data[1], data[2], data[3], data[4], req, res)
    }


});

function loadData(stats,req, res) {

    // get all the users
    Cost.find({}, null, {sort: {date: -1}}, function(err, costs) {
        if (err) throw err;

        // object of all the users
        console.log(costs[3]);
        res.render("pages/dash", {costs:costs, totals:stats});
    });

}

function getStats(callback,req,res) {

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
            loadData(result,req,res)

        }
    });


}


function logCost(amount, label, possesive, today,today_string, req, res) {


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

            res.send(["❌ " + err, "error"])

        } else {

            console.log('Cost created!  ' + newEntry);
            res.send(["✓ " + amount + " euro was spent on " + label + " on the " + today_string, "success"])
        }
    });


}

const standardSpendings = { "starbucks": 5.45, "marios": 4.0, "digitalocean": 5.0, "hosting": 5.0, "delivery": 0.5 };
const recurringSpending = { "Netflix": 9.99, "Spotify": 9.99, "iCloud Storage": 9.99 };
// Netflix: 20th 
// Spotify: 17th
// iCloud: 30th 

function getData(string) {


    var possesive = ""

    var amount = string.match(/[+-]?([0-9]*[.])?[0-9]+/g);

    if (string.split(" ").length == 1) {
        var today_string = makeDate();
        var today = new Date();
        string = string.toLowerCase()

        if (standardSpendings[string] != undefined) {
            const label = string.charAt(0).toUpperCase() + string.slice(1)
            return ([standardSpendings[string], label, "me", today, today_string])
        } else {
            return ["❓ Please Provide The Amount"]
        }




    } else if (amount == null) {
        amount = "❓ Please Provide The Amount"
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
        var today_string = makeDate();
        var today = new Date();
        return_statement = ""

        // logCost(amount,label,possesive,today)
        // return_statement += amount + " euro was spent on " + label + " on the " + today
        // return (return_statement);
        return ([amount, label, possesive, today, today_string])

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
    return today
}