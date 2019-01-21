const app = require('./app');
require('dotenv').config();
const mongoose = require('mongoose');
// const Cost = require('./models/cost');
// const User = require('./models/user');
const port = 3000;

var db, db_address,db_name, db_string;


var debugging = true;

if (debugging){
    db_string = process.env.db_string_debug;

} else{
    db_string = process.env.db_string_prod;
}

db_address = process.env.db_user + ":" + process.env.db_password + "@" + db_string;


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


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
