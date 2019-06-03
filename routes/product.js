var express = require('express');
var router = express.Router();

router.get('/mosted-view', function(req, res, next) { 
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
            settingTable.findOne({key: 'mosted_view'},{}, function(e, setting){
                productTable.find({status: true}, { limit : setting.value, sort : { views : -1 } }, function(e, products){
                    callback(null, products);
                });
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], products: results[2], currentUrl: 'mosted-view' };
        res.render('product/mosted_view', data);
    });
    
});

router.get('/latest', function(req, res, next) { 
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
            settingTable.findOne({key: 'latest_products'},{}, function(e, setting){
                productTable.find({status: true}, { limit : setting.value, sort : { id : -1 } }, function(e, products){
                    callback(null, products);
                });
            });
            
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], products: results[2], currentUrl: 'latest' };
        res.render('product/latest', data);
        
    });
    
});

router.get('/category/:id', function(req, res, next) { 
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
            productTable.find({$and: [{status: true}, {categoryId: req.params.id}]}, { }, function(e, products){
                callback(null, products);
            });
        },
        function(callback){
            categoryTable.findOne({'subcategories.id': req.params.id}, function(e, category){
                var cat = category.subcategories.find(item => {
                    return item.id == parseInt(req.params.id)
                });
                callback(null, cat);
            });
        },
        function(callback){
            settingTable.findOne({key: 'rows_per_page_category'},{}, function(e, setting){
                callback(null, setting);
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], products: results[2], category: results[3], setting: results[4], currentCategoryId: req.params.id };
        res.render('product/category', data);
        
    });
    
});

router.post('/search', function(req, res, next) { 
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
            productTable.find({$and: [{status: true}, {"name" : {$regex : ".*" + req.body.keyword + ".*"}}]}, { }, function(e, products){
                callback(null, products);
            });
        },
        function(callback){
            settingTable.findOne({key: 'rows_per_page_search'},{}, function(e, setting){
                callback(null, setting);
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], products: results[2], setting: results[3]};
        res.render('product/search', data);
        
    });
    
});

router.get('/best-seller', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    var brandTable = db.get('brands');    
    var productTable = db.get('products');
    var orderdetailsTable = db.get('orderdetails');
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
            
            settingTable.findOne({key: 'best_seller'},{}, function(e, setting){
            
                orderdetailsTable.aggregate( 
                [ 
                   { 
                        $group : { 
                            _id : "$productId",
                            totalQuantity: {$sum: "$quantity"} 
                        }    
                   },
                   { 
                        $sort : { 'totalQuantity': -1 }
                   },
                   {
                       $limit: setting.value
                   }
                ], function(err, result) {               
                    
                    var conditions = [];
                    for(var i = 0; i < result.length; i++) {
                        conditions.push({id: result[i]._id});
                    }                
                    productTable.find({$or: conditions}, function(e, products) {
                        var finalResult = [];
                        for(var i = 0; i < result.length; i++) {
                            for(var j = 0; j < products.length; j++) {
                                if(result[i]._id == products[j].id) {
                                    finalResult.push(products[j]);
                                }
                            }
                        }                    
                        callback(null, finalResult);
                    });
                });
            
            });
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], products: results[2], currentUrl: 'best-seller' };
        res.render('product/best_seller', data);
        
    });
});

router.get('/detail/:id', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    var brandTable = db.get('brands');    
    var productTable = db.get('products');
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
            // Find Product Detail
            productTable.findOne({id: req.params.id}, function(e, product){
                callback(null, product);
            });
        },
        function(callback){
            // Update Views
            productTable.findOne({id: req.params.id}, function(e, product){
                productTable.update({id: req.params.id}, {$set : {views: product.views + 1}}, function(e, result){
                    callback();             
                });
            });
            
        },
        function(callback){
            // Find Related Product
            productTable.findOne({id: req.params.id}, function(e, product){
                productTable.find({ $and: [ { id: { $ne: product.id } }, { categoryId: product.categoryId }, {status: true} ] }, { limit : 9 }, function(e, products){
                    callback(null, products);
                });
            });
            
        }
    ], 
    function(err, results) {
        var data = {categories: results[0], brands: results[1], product: results[2], products: results[4] };
        res.render('product/detail', data);
        
    });
    
});

module.exports = router;
