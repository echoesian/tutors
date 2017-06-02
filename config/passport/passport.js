//load bcrypt
var bCrypt = require('bcrypt-nodejs');
var models = require("../../models");

module.exports = function(passport, user) {

    var User = models.User;
    var LocalStrategy = require('passport-local').Strategy;

    //serialize user
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialize user 
    passport.deserializeUser(function(id, done) {
        User.findById(id).then(function(user) {
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });

    // register strategy for Passport
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        // encrypting password
        function(req, email, password, done) {
            var generateHash = function(password) {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
            };
            var initialData = req;
            // checking to see if given email has already been used to create a user
            User.findOne({
                where: {
                    email: email
                }
            }).then(function(user) {
                if (user) {
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
                } else {
                    var userPassword = generateHash(password);
                    var authData = {
                        username: initialData.body.username,
                        password: userPassword,
                        email: email
                    };
                    // user creation
                    User.create(authData).then(function(newUser, created) {
                        console.log("creating the user", authData);
                        if (!newUser) {
                            return done(null, false, req, res);
                        }
                        if (newUser) {
                            var secondaryData = {
                                type: req.body.value,
                                id: req.body.id,
                                name: req.body.name,
                                phone: req.body.phone,
                                address: req.body.address,
                                email: req.body.email,
                                subject: req.body.subjects
                            };
                            // checks to see if new user is tutor or student
                            if (req.body.uType == 1) {
                                console.log('create student', secondaryData);
                                // creates student
                                models.Student.create(secondaryData).then(function(req, res) {
                                    console.log("new student body here", req.body);
                                    return done(null, newUser, req, res);
                                    // res.redirect('/student');                                 
                                });

                            } else {
                                console.log('create tutor');
                                // creates tutor
                                models.Tutor.create(secondaryData).then(function(req, res) {
                                    console.log("new tutor body here", req.body);
                                    return done(null, newUser, req, res);
                                    // res.redirect('/tutor'); 
                                });
                            }
                            console.log('USER: ' + JSON.stringify(user));
                            // return done(null, newUser);
                        }
                    });
                }
            });
        }
    ));
    //LOCAL SIGNIN
    passport.use('local-signin', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },

        function(req, email, password, done) {
            var User = models.User;
            var isValidPassword = function(userpass, password) {
                return bCrypt.compareSync(password, userpass);
            };
            User.findOne({
                where: {
                    email: email
                }
            }).then(function(user) {
                if (!user) {
                    console.log('invalid email');
                    return done(null, false, {
                        message: 'Email does not exist'
                    });
                }
                if (!isValidPassword(user.password, password)) {
                    console.log('invalid password');
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }
                console.log("sucess");
                var userinfo = user.get();
                return done(null, userinfo);

            }).catch(function(err) {
                console.log("Error:", err);
                return done(null, false, {
                    message: 'Something went wrong with your login'
                });
            });
        }
    ));
};
