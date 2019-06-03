var express = require('express');
var router = express.Router();

router.get('/product/:id', function(req, res, next) { 
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
            productTable.find({ $and: [ { brandId: req.params.id }, {status: true} ] }, { }, function(e, products){
                    callback(null, products);
                });
        },
        function(callback){
            brandTable.findOne({id: req.params.id}, function(e, brand){
                callback(null, brand);
            });
        },
        function(callback){
            settingTable.findOne({key: 'rows_per_page_brand'},{}, function(e, setting){
                callback(null, setting);
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], products: results[2], brand: results[3], setting: results[4] };
        res.render('brand/index', data);
    });
    
});

module.exports = router;
