var express = require('express');
var dateTime = require('node-datetime');
var router = express.Router();

router.get('/', function(req, res, next) { 
    var db = req.db;
    var brandTable = db.get('brands'); 
    brandTable.find({}, {}, function(error, result){
        res.render('admin/brand/index', {brands: result, currentUrl:'brand'});
    });       
});

router.get('/add', function(req, res, next) { 
    res.render('admin/brand/add', {currentUrl:'brand'});   
});

router.post('/add', function(req, res, next) { 
    var db = req.db;
    var brandTable = db.get('brands'); 
    var id = dateTime.create().format('YmdHMS');
    var category = {id: id, name: req.body.name, status: req.body.status == 'true'};
    brandTable.insert(category, function(error, result){
        res.redirect('/admin/brand');
    });
    
});

router.get('/delete/:id', function(req, res, next) { 
    var db = req.db;
    var brandTable = db.get('brands'); 
    brandTable.remove({id: req.params.id});
    res.redirect('/admin/brand');   
});

router.get('/edit/:id', function(req, res, next) { 
    var db = req.db;
    var brandTable = db.get('brands'); 
    brandTable.findOne({id: req.params.id}, function(e, result){  
        res.render('admin/brand/edit', {brand: result, currentUrl:'brand'});
    });
});

router.post('/edit', function(req, res, next) { 
    var db = req.db;
    var brandTable = db.get('brands'); 
    brandTable.findOne({id: req.body.id}, function(e, result){  
        result.name = req.body.name;
        result.status = req.body.status == 'true';  
        brandTable.update({id: result.id}, {$set : result}, function(e, result){
            res.redirect('/admin/brand');                       
        });
    });
});


module.exports = router;
