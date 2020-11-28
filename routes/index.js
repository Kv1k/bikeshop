var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_51HXkvcH9vDpwaqScloRIOos56oVK0aBBnMYEqCcS9mubM2MLl1HMaC00jUaRR3QRYZpebVQYt1Df1Hu3aPrSaWVB00Ytqapzwx');

let fraisPort=30;
let total = 0;
let dataBike = [
  {
    nom: "BIK045",
    image:"/images/bike-1.jpg",
    prix:679,
    quantity:1,
    
  },
  {
    nom: "ZOOK07",
    image:"/images/bike-2.jpg",
    prix:999,
    quantity:1,
    
  },
  {
    nom: "TITANS",
    image:"/images/bike-3.jpg",
    prix:799,
    quantity:1,
  },
  {
    nom: "CEWO",
    image:"/images/bike-4.jpg",
    prix:1300,
    quantity:1,
    
  },
  {
    nom: "AMIG39",
    image:"/images/bike-5.jpg",
    prix:479,
    quantity:1,
    
  },
  {
    nom: "LIK099",
    image:"/images/bike-6.jpg",
    prix:869,
    quantity:1,
    
  }
];





/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.dataCardBike === undefined){
    req.session.dataCardBike = [];
  }
  res.render('index', { dataBike, dataCardBike: req.session.dataCardBike });  
});


router.get('/shop', function(req, res, next) {
  
   res.render('shop',{ dataCardBike: req.session.dataCardBike, fraisPort });
});


router.get('/addShop', function(req, res, next) {
  let alreadyExist = false;

  for (let i =0; i< req.session.dataCardBike.length; i++){
    if (req.query.nom === req.session.dataCardBike[i].nom){
      req.session.dataCardBike[i].quantity += 1;
      alreadyExist= true;
    }
  }
  if (alreadyExist== false) {
     req.session.dataCardBike.push({
    url: req.query.url,
    prix : req.query.prix,
    nom : req.query.nom,
    position : req.query.position,
    quantity: 1,
   })
  }
  
  res.render('shop',{dataCardBike: req.session.dataCardBike, fraisPort}); 
});



router.get('/trashShop', async function(req, res, next) {
  req.session.dataCardBike.splice(req.query.position,1);
  res.render('shop',{dataCardBike: req.session.dataCardBike});
});



router.post('/changeQuantity', async function(req, res, next) {
  req.session.dataCardBike[req.body.position].quantity= req.body.quantity;
  let lineItem= [];
  for( let i= 0; i<req.session.dataCardBike.length; i++){
    lineItem.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: req.session.dataCardBike[i].nom
          },
          unit_amount: req.session.dataCardBike[i].prix*100,
        },
        quantity: req.session.dataCardBike[i].quantity,        
      })    
  }
  lineItem.push({
    price_data: {
      currency: 'eur',
      product_data: {
        name: 'Shipping'
      },
      unit_amount: fraisPort*100,
    },
    quantity: 1
  })
  var session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItem,
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });
  res.render('shop',{dataCardBike: req.session.dataCardBike, id:session.id, fraisPort});  
});



router.post('/create-session', async function(req, res) {
  let lineItem= [];
  for( let i= 0; i<req.session.dataCardBike.length; i++){
    lineItem.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: req.session.dataCardBike[i].nom
          },
          unit_amount: req.session.dataCardBike[i].prix*100,
        },
        quantity: req.session.dataCardBike[i].quantity,     
      })
  }
  lineItem.push({
    price_data: {
      currency: 'eur',
      product_data: {
        name: 'Shipping'
      },
      unit_amount: fraisPort*100,
    },
    quantity: 1
  })
  var session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItem,
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });
  res.json({ id: session.id });
});



router.get ('/success', async function (req, res) {
  res.render( 'success' );
})
router.get ('/cancel', async function (req, res) {
  let lineItem= [];
  for( let i= 0; i<req.session.dataCardBike.length; i++){
    lineItem.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: req.session.dataCardBike[i].nom
          },
          unit_amount: req.session.dataCardBike[i].prix*100,
        },
        quantity: req.session.dataCardBike[i].quantity,        
      })     
  } 
  lineItem.push({
    price_data: {
      currency: 'eur',
      product_data: {
        name: 'Shipping'
      },
      unit_amount: fraisPort*100,
    },
    quantity: 1
  })
  var session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItem,
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });
  res.render( 'shop', { dataCardBike: req.session.dataCardBike, id:session.id, fraisPort } );
})



module.exports = router;

