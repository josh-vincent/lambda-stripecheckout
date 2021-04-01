const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const url = "example.com";

let app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/checkout", async function (req, res) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: req.body.priceId, // The priceId of the product being purchased, retrievable from the Stripe dashboard
          quantity: req.body.quantity,
        },
      ],
      mode: "subscription",
      client_reference_id: req.body.client_reference_id,
      success_url: `https://${url}/success?session_id=${CHECKOUT_SESSION_ID}`, // The URL the customer will be directed to after the payment or subscription creation is successful.
      cancel_url: `https://${url}/cancel`, // The URL the customer will be directed to if they decide to cancel payment and return to your website.
    });
    res.json(session);
  } catch (err) {
    res.json(err);
  }
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
