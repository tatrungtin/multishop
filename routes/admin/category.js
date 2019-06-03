var express = require('express');
var dateTime = require('node-datetime');
var router = express.Router();

router.get('/', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    categoryTable.find({}, {}, function(error, result){
        res.render('admin/category/index', {categories: result, currentUrl:'category'});
    });       
});

router.get('/add', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    categoryTable.find({}, {}, function(error, result){
        res.render('admin/category/add', {categories: result, currentUrl:'category'});
    });    
});

router.post('/add', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    var parentCategory = req.body.parentCategory;
    var id = dateTime.create().format('YmdHMS');
    if(parentCategory == '-1') {
        var category = {id: id, name: req.body.name, status: req.body.status == 'true', subcategories: []};
        categoryTable.insert(category, function(error, result){
            if (error){
                res.render('admin/category/add', {error: error});
            }
            res.redirect('/admin/category');
        });
    } else {
        var category = {id: id, name: req.body.name, status: req.body.status == 'true'};
        categoryTable.findOne({id: parentCategory}, function(e, result) {   
            result.subcategories.push(category);
            categoryTable.update({id: result.id}, {$set : result}, function(e, result){
                res.redirect('/admin/category');                       
            });
        });
    }
    
});

router.get('/delete/:id', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    categoryTable.find({}, {}, function(error, result){
        var isDeleted = false;
        for(var i = 0; i < result.length; i++) {
            if(result[i].id == req.params.id) {
                categoryTable.remove({id: req.params.id});
                isDeleted = true;
                break;
            }
        }
        if(isDeleted) {
            res.redirect('/admin/category'); 
        } else {
            for(var i = 0; i < result.length; i++) {
                if(result[i].subcategories != null) {                    
                    for(var j = 0; j < result[i].subcategories.length; j++) {
                        if(result[i].subcategories[j].id == req.params.id) {
                            result[i].subcategories.splice(j, 1);
                            categoryTable.update({id: result[i].id}, {$set : result[i]}, function(e, result){
                                res.redirect('/admin/category');                       
                            });
                        }
                    }
                }
            }
        }
    });
       
});

router.get('/edit/:id', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    categoryTable.findOne({$or:[{id: req.params.id}, {'subcategories.id': req.params.id}]}, function(e, result){   
        if(result.id == req.params.id) {
            res.render('admin/category/edit', {category: result});
        } else {
            if(result.subcategories != null) {
                for(var i = 0; i < result.subcategories.length; i++) {
                    if(result.subcategories[i].id == req.params.id) {
                        res.render('admin/category/edit', {category: result.subcategories[i], currentUrl:'category'});
                        break;
                    }
                }
            }
        }
    });
});

router.post('/edit', function(req, res, next) { 
    var db = req.db;
    var categoryTable = db.get('categories'); 
    categoryTable.findOne({$or:[{id: req.body.id}, {'subcategories.id': req.body.id}]}, function(e, result){   
        if(result.id == req.body.id) {
            result.name = req.body.name;
            result.status = req.body.status == 'true';            
        } else {
            if(result.subcategories != null) {                
                for(var i = 0; i < result.subcategories.length; i++) {
                    if(result.subcategories[i].id == req.body.id) {
                        result.subcategories[i].name = req.body.name;
                        result.subcategories[i].status = req.body.status == 'true';
                        break;
                    }
                }
            }
        }
        categoryTable.update({id: result.id}, {$set : result}, function(e, result){
            res.redirect('/admin/category');                       
        });
    });
});


module.exports = router;
