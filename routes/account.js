var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();

router.get('/sign-up', function (req, res, next) {

    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    var accountTable = db.get('accounts');

    async.parallel([
            function (callback) {
                categoryTable.find({status: true}, {}, function (e, categories) {
                    callback(null, categories);
                });
            },
            function (callback) {
                brandTable.find({status: true}, {}, function (e, brands) {
                    callback(null, brands);
                });
            }
        ],
        function (err, results) {
            var data = {categories: results[0], brands: results[1]};
            res.render('account/register', data);
        });

});

router.post('/sign-up', function (req, res, next) {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    var accountTable = db.get('accounts');

    async.parallel([
            function (callback) {
                categoryTable.find({status: true}, {}, function (e, categories) {
                    callback(null, categories);
                });
            },
            function (callback) {
                brandTable.find({status: true}, {}, function (e, brands) {
                    callback(null, brands);
                });
            },
            function (callback) {
                accountTable.count({username: req.body.username}, function (e, count) {
                    if (count == 0) {
                        bcrypt.hash(req.body.password, 13, function (err, hash) {
                            req.body.password = hash;
                            req.body.status = true;
                            req.body.roleId = 'customer';
                            accountTable.insert(req.body, function (err, result) {
                                callback(null, {count: 0});
                            });
                        });
                    } else {
                        callback(null, {count: count});
                    }
                });
            }
        ],
        function (err, results) {
            var data = {categories: results[0], brands: results[1]};
            var countAccount = results[2];
            if (countAccount.count == 0) {
                res.title = 'Login';
                res.render('account/login', data);
            } else {
                res.title = 'Register';
                data['message'] = 'Exits';
                res.render('account/register', data);
            }
        });
});

router.get('/login', function (req, res, next) {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    var accountTable = db.get('accounts');

    async.parallel([
            function (callback) {
                categoryTable.find({status: true}, {}, function (e, categories) {
                    callback(null, categories);
                });
            },
            function (callback) {
                brandTable.find({status: true}, {}, function (e, brands) {
                    callback(null, brands);
                });
            }
        ],
        function (err, results) {
            var data = {categories: results[0], brands: results[1]};
            res.render('account/login', data);
        });
});

router.post('/login', function (req, res, next) {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    var accountTable = db.get('accounts');

    async.parallel([
            function (callback) {
                categoryTable.find({status: true}, {}, function (e, categories) {
                    callback(null, categories);
                });
            },
            function (callback) {
                brandTable.find({status: true}, {}, function (e, brands) {
                    callback(null, brands);
                });
            },
            function (callback) {
                accountTable.findOne({$and: [{username: req.body.username}, {status: true}, {roleId: 'customer'}]}, function (e, account) {
                    if (account != null) {
                        bcrypt.compare(req.body.password, account.password, function (err, res) {
                            if (res) {
                                req.session.username = req.body.username;
                                callback(null, {count: 1});
                            } else {
                                callback(null, {count: 0});
                            }
                        });
                    } else {
                        callback(null, {count: 0});
                    }
                });
            }
        ],
        function (err, results) {
            var data = {categories: results[0], brands: results[1]};
            var countAccount = results[2];
            if (countAccount.count == 0) {
                data['message'] = 'Invalid Account';
                res.render('account/login', data);
            } else {
                res.redirect('/account/orders');
            }

        });
});

router.get('/logout', function (req, res, next) {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');

    async.parallel([
            function (callback) {
                categoryTable.find({status: true}, {}, function (e, categories) {
                    callback(null, categories);
                });
            },
            function (callback) {
                brandTable.find({status: true}, {}, function (e, brands) {
                    callback(null, brands);
                });
            },
            function (callback) {
                delete req.session.username;
                callback();
            }
        ],
        function (err, results) {
            var data = {categories: results[0], brands: results[1]};
            res.render('account/login', data);
        });
});

router.get('/change-profile', function (req, res, next) {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    var accountTable = db.get('accounts');

    async.parallel([
            function (callback) {
                categoryTable.find({status: true}, {}, function (e, categories) {
                    callback(null, categories);
                });
            },
            function (callback) {
                brandTable.find({status: true}, {}, function (e, brands) {
                    callback(null, brands);
                });
            },
            function (callback) {
                accountTable.findOne({username: req.session.username}, function (e, account) {
                    callback(null, account);
                });
            }
        ],
        function (err, results) {
            var data = {categories: results[0], brands: results[1], account: results[2]};
            res.render('account/change_profile', data);
        });
});

router.post('/change-profile', function (req, res, next) {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    var accountTable = db.get('accounts');

    async.parallel([
            function (callback) {
                categoryTable.find({status: true}, {}, function (e, categories) {
                    callback(null, categories);
                });
            },
            function (callback) {
                brandTable.find({status: true}, {}, function (e, brands) {
                    callback(null, brands);
                });
            },
            function (callback) {
                accountTable.findOne({username: req.session.username}, function (e, account) {
                    if (req.body.password != '') {
                        bcrypt.hash(req.body.password, 13, function (err, hash) {
                            accountTable.update({username: req.session.username}, {
                                $set: {
                                    password: hash,
                                    fullName: req.body.fullName,
                                    email: req.body.email
                                }
                            }, function (e, result) {
                                accountTable.findOne({username: req.session.username}, function (e, account) {
                                    callback(null, account);
                                });
                            });
                        });
                    } else {
                        accountTable.update({username: req.session.username}, {
                            $set: {
                                fullName: req.body.fullName,
                                email: req.body.email
                            }
                        }, function (e, result) {
                            accountTable.findOne({username: req.session.username}, function (e, account) {
                                callback(null, account);
                            });
                        });
                    }
                });
            }
        ],
        function (err, results) {
            var data = {categories: results[0], brands: results[1], account: results[2]};
            res.render('account/change_profile', data);
        });
});

router.get('/orders', function (req, res, next) {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    var ordersTable = db.get('orders');

    async.parallel([
            function (callback) {
                categoryTable.find({status: true}, {}, function (e, categories) {
                    callback(null, categories);
                });
            },
            function (callback) {
                brandTable.find({status: true}, {}, function (e, brands) {
                    callback(null, brands);
                });
            },
            function (callback) {
                ordersTable.find({username: req.session.username}, function (e, orders) {
                    callback(null, orders);
                });
            }
        ],
        function (err, results) {
            var data = {categories: results[0], brands: results[1], orders: results[2]};
            res.render('account/orders', data);
        });
});

router.get('/order/detail/:id', function (req, res, next) {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    var ordersTable = db.get('orders');
    var ordersDetailTable = db.get('orderdetails');

    async.parallel([
            function (callback) {
                categoryTable.find({status: true}, {}, function (e, categories) {
                    callback(null, categories);
                });
            },
            function (callback) {
                brandTable.find({status: true}, {}, function (e, brands) {
                    callback(null, brands);
                });
            },
            function (callback) {

                ordersDetailTable.aggregate({
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "id",
                        as: "productInfo"
                    }
                }, function (e, result) {
                    var orderDetails = [];
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].orderId == req.params.id) {
                            orderDetails.push(result[i]);
                        }
                    }
                    callback(null, orderDetails);
                });

            }
        ],
        function (err, results) {
            var data = {categories: results[0], brands: results[1], orderDetails: results[2]};
            res.render('account/orders_detail', data);
        });
});


//router vendor
router.get('/vendor', async (req, res, next) => {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    try {
        let categories = await categoryTable.find({status: true})
        let brands = await brandTable.find({status: true})

        var data = {categories: categories, brands: brands};
        res.render('account/registerVendor', data);
    } catch (error) {
        throw error
    }

});
router.post('/sign-up-vendor', async (req, res, next) => {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    var accountTable = db.get('accounts');
    try {
        let categories = await categoryTable.find({status: true});
        let brands = await brandTable.find({status: true});
        let check = await accountTable.find({username: req.body.username});
        if (check.length === 0) {
            let dataInsert = {
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, 13),
                fullName: req.body.fullName,
                email: req.body.email,
                roleId: 'vendor',
                status: true
            }
            let insertVendor = await accountTable.insert(dataInsert)
            var data = {categories: categories, brands: brands};
            res.redirect('/account/loginVendor');
        } else {
            var data = {categories: categories, brands: brands, message: 'Register Vendor fail'};
            res.render('account/registerVendor', data);
        }
    } catch (error) {
        var data = {categories: categories, brands: brands, message: 'Register Vendor fail'};
        res.render('account/registerVendor', data);
    }

})
router.get('/loginVendor', async (req, res, next) => {
    var db = req.db;
    var categoryTable = db.get('categories');
    var brandTable = db.get('brands');
    try {
        let categories = await categoryTable.find({status: true});
        let brands = await brandTable.find({status: true});
        var data = {categories: categories, brands: brands};
        let findVendor = await accountTable.findOne({$and: [{username: req.body.username}, {status: true}, {roleId: 'vendor'}]});
        if (findVendor != null) {
            checkPass = bcrypt.compareSync(req.body.password, account.password);
            if (checkPass != null) {
                req.session.vendor = findVendor;
                res.redirect('home');
            } else {
                data['message'] = "Username or Password incorrect";
                res.render('account/loginVendor', data);
            }
        } else {
            data['message'] = "Username or Password incorrect";
            res.render('account/loginVendor', data);
        }
    } catch (error) {
        data['message'] = "Username or Password incorrect";
        res.render('account/loginVendor', data);
    }

});

module.exports = router;
