var express = require('express');
var dateTime = require('node-datetime');
var path = require('path');
var router = express.Router();

router.get('/', function(req, res, next) { 
    var db = req.db;
    var productTable = db.get('products'); 
    var brandTable = db.get('brands'); 
    productTable.find({}, {}, function(error, result){
        res.render('admin/product/index', {products: result, currentUrl:'product'});
    });       
});

router.get('/category/:categoryId', function(req, res, next) { 
    var db = req.db;
    var productTable = db.get('products'); 
    productTable.find({categoryId: req.params.categoryId}, {}, function(error, result){
        res.render('admin/product/index', {products: result, currentUrl:'product'});
    });       
});

router.get('/brand/:brandId', function(req, res, next) { 
    var db = req.db;
    var productTable = db.get('products'); 
    productTable.find({brandId: req.params.brandId}, {}, function(error, result){
        res.render('admin/product/index', {products: result, currentUrl:'product'});
    });       
});

router.get('/add', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    var brandTable = db.get('brands');  
    
    async.parallel([
        function(callback){
            categoryTable.find({},{}, function(e, categories){
                callback(null, categories);
            });            
        },
        function(callback){
            brandTable.find({},{}, function(e, brands){
                callback(null, brands);
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], currentUrl:'product'};
        res.render('admin/product/add', data);
    });
      
});

router.post('/add', function(req, res, next) { 
    var db = req.db;
    var productTable = db.get('products'); 
    
    async.parallel([
        function(callback){
            var photo = 'no-image.png';
            if(req.files.photo != null) {    
                console.log(req.files.photo);
                req.files.photo.mv(path.join('./public/images/home/',  req.files.photo.name), function(err) {
                    if (err)
                        photo = 'no-image.png';
                });
                photo = req.files.photo.name;
            }          
            callback(null, {'photo':photo});
        }
    ], 
    function(err, results) {
        var photo = results[0].photo;
        var id = dateTime.create().format('YmdHMS');
        var product = {
                id: id, 
                name: req.body.name, 
                price: parseFloat(req.body.price), 
                quantity: parseInt(req.body.quantity), 
                description: req.body.description,      
                photo: photo, 
                special: req.body.special == 'true',
                views: 0,
                categoryId: req.body.categoryId,
                status: req.body.status == 'true',
                brandId: req.body.brandId
            };
        productTable.insert(product, function(error, result){
            res.redirect('/admin/product');
        });
        
    });

});

router.get('/delete/:id', function(req, res, next) { 
    var db = req.db;
    var productTable = db.get('products'); 
    productTable.remove({id: req.params.id});
    res.redirect('/admin/product');   
});

router.get('/edit/:id', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    var brandTable = db.get('brands');  
    var productTable = db.get('products'); 
    
    async.parallel([
        function(callback){
            categoryTable.find({},{}, function(e, categories){
                callback(null, categories);
            });            
        },
        function(callback){
            brandTable.find({},{}, function(e, brands){
                callback(null, brands);
            });
        },        
        function(callback){
            productTable.findOne({id: req.params.id}, function(e, product){
                callback(null, product);
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], product: results[2], currentUrl:'product'};
        res.render('admin/product/edit', data);
    });
      
});

router.post('/edit', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    var brandTable = db.get('brands');  
    var productTable = db.get('products'); 
    
    async.parallel([        
        function(callback){
            var photo = req.body.o_photo;
            if(req.files.photo != null) {    
                console.log(req.files.photo);
                req.files.photo.mv(path.join('./public/images/home/',  req.files.photo.name), function(err) {
                    if (err)
                        photo = req.body.o_photo;
                });
                photo = req.files.photo.name;
            }          
            callback(null, {'photo':photo});
        }
    ], 
    function(err, results) {        
        productTable.findOne({id: req.body.id}, function(e, result){
            var photo = results[0].photo;
            var product = {
                name: req.body.name, 
                price: parseFloat(req.body.price), 
                quantity: parseInt(req.body.quantity), 
                description: req.body.description,      
                photo: photo, 
                special: req.body.special == 'true',
                categoryId: req.body.categoryId,
                status: req.body.status == 'true',
                brandId: req.body.brandId
            };
            productTable.update({id: req.body.id}, {$set : product}, function(e, result){
                res.redirect('/admin/product');                       
            });
        });
    });
      
});

module.exports = router;
