'use strict';

/*global Stripe:true*/
/*global $form:true*/

//set Public key for Stripe payments
Stripe.setPublishableKey( 'pk_test_SnOByhzFpfc6BEV0hP6BGvBc' );
var isSubmit = false;
$( document ).ready( function() {
    
    $( '#backToDashboard' ).click( function() {
       location.href='/login';
    });
    
    $( '#submittransaction' ).click( function() {
        console.log( 'ok' );
        if ( !isSubmit ) {
            Stripe.card.createToken( {
                number: $( '.card-number' ).val(),
                cvc: $( '.card-cvc' ).val(),
                exp_month: $( '.card-expiry-month' ).val(),
                exp_year: $( '.card-expiry-year' ).val()
            }, function( status, response ) {
                if ( response.error ) {
                    // Show the errors on the form
                    $( '.payment-errors' ).text( response.error.message );
                }
                else {
                    // response contains id and card, which contains additional card details
                    var token = response.id;
                    // Insert the token into the form so it gets submitted to the server
                    //$form.append( $( '<input type="hidden" name="stripeToken" />' ).val( token ) );
                    // and submit
                    $.ajax( {
                        url: '/createtransaction',
                        type: 'POST',
                        headers: {
                            'x-access-token': $( '#token' ).html()
                        },
                        data: {
                            amount: $( '#amount' ).val(),
                            currency: $( '#currency' ).val(),
                            token: token,
                            userid : $( '#userid' ).val()
                        }
                    } ).done( function( response ) {
                        if ( response.message ) {
                            $( '.payment-errors' ).text( response.message );
                        }
                    } , function(err){
                        console.log(err);
                    });
                }

            } );
        }

    } );
    
    $("#submittxn").click(function(){
        if ( !isSubmit ) {
           $.ajax( {
                url: '/createtransaction',
                type: 'POST',
                headers: {
                    'x-access-token': $( '#token' ).html()
                },
                data: {
                    userid : $( '#userid' ).val()
                }
            } ).done( function( response ) {
                if ( response.message ) {
                    $( '.payment-errors' ).text( response.message );
                }
            } , function(err){
                console.log(err);
            });
        }
    })
} );
