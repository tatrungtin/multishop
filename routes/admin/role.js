var express = require('express');
var dateTime = require('node-datetime');
var router = express.Router();

router.get('/', function(req, res, next) { 
    var db = req.db;
    var roleTable = db.get('roles'); 
    roleTable.find({}, {}, function(error, result){
        res.render('admin/role/index', {roles: result, currentUrl:'role'});
    });       
});

router.get('/add', function(req, res, next) { 
    res.render('admin/role/add', {currentUrl:'role'});   
});

router.post('/add', function(req, res, next) { 
    var db = req.db;
    var roleTable = db.get('roles');
    var id = dateTime.create().format('YmdHMS');
    var role = {id: id, name: req.body.name, status: req.body.status == 'true'};
    roleTable.insert(role, function(error, result){
        res.redirect('/admin/role');
    });
    
});

router.get('/delete/:id', function(req, res, next) { 
    var db = req.db;
    var roleTable = db.get('roles');
    roleTable.remove({id: req.params.id});
    res.redirect('/admin/role');   
});

router.get('/edit/:id', function(req, res, next) { 
    var db = req.db;
    var roleTable = db.get('roles');
    roleTable.findOne({id: req.params.id}, function(e, result){  
        res.render('admin/role/edit', {role: result, currentUrl:'role'});
    });
});

router.post('/edit', function(req, res, next) { 
    var db = req.db;
    var roleTable = db.get('roles'); 
    roleTable.findOne({id: req.body.id}, function(e, result){  
        result.name = req.body.name;
        result.status = req.body.status == 'true';  
        roleTable.update({id: result.id}, {$set : result}, function(e, result){
            res.redirect('/admin/role');                       
        });
    });
});


module.exports = router;
