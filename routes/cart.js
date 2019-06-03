var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) { 

    var db = req.db;
    var categoryTable = db.get('categories'); 
    var brandTable = db.get('brands');
    var settingTable = db.get('settings');    
    
    async.parallel([
        function(callback){
            categoryTable.find({status: true},{}, function(e, categories){
                callback(null, categories);
            });            
        },
        function(callback){
            brandTable.find({status: true},{}, function(e, brands){
                callback(null, brands);
            });
        },
        function(callback){
            settingTable.find({group: 'paypal'},{}, function(e, settings){
                callback(null, settings);
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], settings: results[2]};
        res.render('cart/index', data);
    });  
});

router.get('/add/:id', function(req, res, next) { 

    var db = req.db;
    var categoryTable = db.get('categories'); 
    var brandTable = db.get('brands');    
    var productTable = db.get('products');
    var settingTable = db.get('settings'); 
    
    async.parallel([
        function(callback){
            categoryTable.find({status: true},{}, function(e, categories){
                callback(null, categories);
            });            
        },
        function(callback){
            brandTable.find({status: true},{}, function(e, brands){
                callback(null, brands);
            });
        },
        function(callback){
            productTable.findOne({id: req.params.id}, function(e, product){
                if(req.session.cart == null) {
                    req.session.cart = [{product: product, quantity: 1}];
                } else {
                    var index = -1;
                    for(var i = 0; i < req.session.cart.length; i++) {
                        if(req.session.cart[i].product.id == product.id) {
                            index = i;
                            break;
                        }
                    }
                    if(index == -1) {
                        req.session.cart.push({
                            product: product, quantity: 1
                        });
                    } else {
                        req.session.cart[index].quantity++;
                    }
                }
                callback(null, req.session.cart);
            });
        },
        function(callback){
            settingTable.find({group: 'paypal'},{}, function(e, settings){
                callback(null, settings);
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], cart: results[2], settings: results[3]};
        res.render('cart/index', data);
    });  
});

router.get('/delete/:index', function(req, res, next) { 

    var db = req.db;
    var categoryTable = db.get('categories'); 
    var brandTable = db.get('brands');    
    var productTable = db.get('products');
    var settingTable = db.get('settings'); 
    
    async.parallel([
        function(callback){
            categoryTable.find({status: true},{}, function(e, categories){
                callback(null, categories);
            });            
        },
        function(callback){
            brandTable.find({status: true},{}, function(e, brands){
                callback(null, brands);
            });
        },
        function(callback){
            
                if(req.session.cart != null) {
                    var index = parseInt(req.params.index);
                    req.session.cart.splice(index, 1);
                }
                callback(null, req.session.cart);
            
        },
        function(callback){
            settingTable.find({group: 'paypal'},{}, function(e, settings){
                callback(null, settings);
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], cart: results[2], settings: results[3]};
        res.render('cart/index', data);
    });  
});

router.get('/success', function(req, res, next) { 

    var db = req.db;
    var categoryTable = db.get('categories'); 
    var brandTable = db.get('brands');    
    var productTable = db.get('products');
    var orderTable = db.get('orders');
    var orderDetailsTable = db.get('orderdetails');
    
    async.parallel([
        function(callback){
            categoryTable.find({status: true},{}, function(e, categories){
                callback(null, categories);
            });            
        },
        function(callback){
            brandTable.find({status: true},{}, function(e, brands){
                callback(null, brands);
            });
        },
        function(callback){
            // Insert new order
            // pending, shipping, complete, canceled
            orderTable.insert({id: req.query.tx, created: new Date().toLocaleDateString(), username: req.session.username, status: 'pending'}, function(error, result){
                var orderdetails = [];
                for(var i = 0; i < req.session.cart.length; i++) {
                    orderdetails.push({
                        orderId: req.query.tx,
                        productId: req.session.cart[i].product.id,
                        price: req.session.cart[i].product.price,
                        quantity: req.session.cart[i].product.quantity
                    });
                }
                orderDetailsTable.insert(orderdetails, function(error, result){
                    // Remove cart
                    delete req.session.cart;
                    callback();
                });
                
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1]};
        res.render('cart/thanks', data);
    });  
});

module.exports = router;
