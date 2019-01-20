// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var costSchema = new Schema({
  amount: {type: Number, required: true},
  label: {type: String, required: true},
  possesive: {type: String, required: true},
  date_string: {type: String, required: true},
  date:{type: Date, required:true}
});

costSchema.pre('save', function(next) {
  
  // change the updated_at field to current date
  this.label = this.label.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

  // if created_at doesn't exist, add to that field
  // if (!this.created_at)
  //   this.created_at = currentDate;

  next();
});


// the schema is useless so far
// we need to create a model using it
var Cost_Model = mongoose.model('Cost', costSchema);

// make this available to our users in our Node applications
module.exports = Cost_Model;