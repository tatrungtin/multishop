var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) { 

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
            settingTable.findOne({key: 'features_products'},{}, function(e, setting){
                productTable.find({status: true}, { limit : setting.value, sort : { id : -1 } }, function(e, products){
                    callback(null, products);
                });
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], products: results[2], currentUrl: 'home' };
        res.render('home/index', data);
        
    });
       
});

module.exports = router;
