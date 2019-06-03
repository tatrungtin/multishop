var express = require('express');
var bcrypt = require('bcrypt');

var router = express.Router();

router.get('/', function(req, res, next) { 
    res.render('admin/login/index', {});
});

router.post('/login', function(req, res, next) { 
    var db = req.db;
    var accountTable = db.get('accounts');     
    accountTable.findOne({$and: [{username: req.body.username}, {status: true}, {roleId: 'admin'}]}, function(e, account){
        if(account != null) {
            bcrypt.compare(req.body.password, account.password, function(err, res1) {
                if(res) {
                    req.session.user = account;
                    res.redirect('/admin/category');           
                } else {
                    res.render('admin/login/index', {error: 'Username and password do not match or you do not have an account yet.'});
                }
            });
        } else {
            res.render('admin/login/index', {error: 'Username and password do not match or you do not have an account yet.'}); 
        }
    });
});

module.exports = router;
