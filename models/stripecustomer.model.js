'use strict';

var mongoose = require( 'mongoose' );
var config = require( '../config' );


var stripeCustomerSchema = mongoose.Schema( {
    userid: String,
    stripecustomerid: String,
    amount : Number,
    currency : String
});

var stripeCustomer = mongoose.model( 'stripeCustomer', stripeCustomerSchema );

module.exports = stripeCustomer;
