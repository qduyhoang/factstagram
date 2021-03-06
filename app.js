var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    post  = require("./models/post"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    session = require("express-session"),
    methodOverride = require("method-override"),
    sitemap = require('express-sitemap');
// configure dotenv
require('dotenv').load();

//requiring routes
var commentRoutes    = require("./routes/comments"),
    postRoutes = require("./routes/posts"),
    indexRoutes      = require("./routes/index")
    

mongoose.Promise = global.Promise;

const databaseUrl = process.env.MONGODB_URL || 'mongodb://localhost/coolplacesnearme';



mongoose.connect(databaseUrl, { useMongoClient: true })
      .then(() => console.log(`Database connected`))
      .catch(err => console.log(`Database connection error: ${err.message}`));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));

app.locals.moment = require('moment');


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Factstagram",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   res.locals.stuff = {
       query : req.query,
       url   : req.originalUrl
   }
   next();
});


app.use("/", indexRoutes);
app.use("/posts", postRoutes);
app.use("/posts/:id/comments", commentRoutes);

app.get('/sitemap.xml', function(req, res, next){
    //Site map auto-generator
    sitemap({
        map: {
            '/': ['get'],
            '/posts': ['get','post'],
            '/login': ['get'],
            '/register': ['get'],
        },
        route: {
            'http://factstagram.com': {
                lastmod: '2018-06-05',
                changefreq: 'monthly',
                priority: 1.0,
            },
            '/post': {
                lastmod: '2018-06-05',
                changefreq: 'always',
                priority: 0.8,
            },
            '/register': {
                lastmod: '2018-06-05',
                changefreq: 'monthly',
                priority: 0.6
            },
            '/login': {
                lastmod: '2018-06-05',
                changefreq: 'monthly',
                priority: 0.5
            }
        },
        url: "www.factstagram.com"
    }).XMLtoWeb(res);
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Server Has Started!");
});