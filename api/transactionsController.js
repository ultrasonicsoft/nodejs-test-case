'use strict';

var Transactions = require( '../models/transactions.model.js' );
var config = require( '../config' );
var Stripe = require( 'stripe' )( config.stripeApiKey );
var StripeCustomer = require('../models/stripecustomer.model.js');

exports.index = function( req, res, next ) {
    if ( req.body ) {
        var transaction = new Transactions( {
            name: req.body.name
        } );
        transaction.save( function( err, trans ) {
            if ( err ) {
                return console.log( err );
            }
            res.status( 200 ).end();
        } );
    }
};

exports.createTransaction = function( req, res, next ) {
    var userid = req.body.userid;    
    StripeCustomer.findOne({userid : userid},function(err, customer){
        if ( err ) {
            return res.render('error', {message : err, error : {status : 500, stack : ''}});
        } 
        var createCharge =  function(customerid, amount, currency){
            Stripe.charges.create({
                amount: amount,
                currency: currency,
                customer: customerid
            }).then(function(charge){
                if(!charge){
                    return res.render('error', {message : err, error : {status : 500, stack : ''}});
                }
                var transaction = new Transactions({
                    transactionId: charge.id,
                    amount: charge.amount,
                    created: charge.created,
                    currency: charge.currency,
                    description: charge.description,
                    paid: charge.paid,
                    sourceId: charge.source.id
                });
                transaction.save( function( err ) {
                    if ( err ) {
                        return res.render('error', {message : err, error : {status : 500, stack : ''}});
                    }    
                    res.status( 200 ).json( {
                        message: 'Payment is created.'
                    } );                
                } );
            }, function(err){
                return res.render('error', {message : err, error : {status : 500, stack : ''}});
            });
        };
        if(customer){
            createCharge(customer.stripecustomerid, customer.amount, customer.currency);
        }else{        
            var data = {
                amount: req.body.amount,
                currency: req.body.currency,
                source: req.body.token,
                description: 'Charge for test@example.com'
            };   
            Stripe.customers.create({
              source: data.source,
              description: data.description
            }, function(err, customer) {   
                if ( err ) {
                    return res.render('error', {message : err, error : {status : 500, stack : ''}});
                }  
                var stripeCustomer = new StripeCustomer({
                    userid: userid,
                    stripecustomerid: customer.id,
                    amount : data.amount,
                    currency : data.currency
                }); 
                stripeCustomer.save(function(err){
                    if ( err ) {
                        return res.render('error', {message : err, error : {status : 500, stack : ''}});
                    }
                    createCharge(customer.id, data.amount, data.currency);
                })                  
            });
        }
    });
};

