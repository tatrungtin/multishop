var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) { 
    var db = req.db;
    var orderTable = db.get('orders'); 
    var orderStatus = ['pending', 'shipping', 'complete', 'canceled'];
    orderTable.find({}, {}, function(error, result){
        res.render('admin/order/index', {orders: result, currentUrl:'order', orderStatus: orderStatus});
    });       
});

router.get('/customer/:username', function(req, res, next) { 
    var db = req.db;
    var orderTable = db.get('orders'); 
    var orderStatus = ['pending', 'shipping', 'complete', 'canceled'];
    orderTable.find({username: req.params.username}, {}, function(error, result){
        res.render('admin/order/index', {orders: result, currentUrl:'order', orderStatus: orderStatus});
    });       
});

router.get('/detail/:id', function(req, res, next) { 
    var db = req.db;   
    var ordersDetailTable = db.get('orderdetails');
    ordersDetailTable.aggregate({
        $lookup:{
             from:"products",
                    localField:"productId",
                    foreignField:"id",
                    as:"productInfo"
                }                
        },  function(e, result) { 
                var orderDetails = [];
                for(var i = 0; i < result.length; i++) {
                    if(result[i].orderId == req.params.id) {
                        orderDetails.push(result[i]);
                    }
                }
            res.render('admin/order/detail', {orderDetails: orderDetails, currentUrl:'order'});        
    });
    
    
});

router.post('/updatestatus/:id', function(req, res, next) { 
    var db = req.db;
    var orderTable = db.get('orders'); 
    var orderStatus = ['pending', 'shipping', 'complete', 'canceled'];
    orderTable.findOne({id: req.params.id}, function(e, result){        
        result.status = req.body.orderStatus;  
        orderTable.update({id: req.params.id}, {$set : result}, function(e, result){
            res.redirect('/admin/order');                       
        });
    });   
});


module.exports = router;
