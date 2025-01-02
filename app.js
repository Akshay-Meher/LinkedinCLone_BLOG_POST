const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const port = 3000;
const cookieParser = require('cookie-parser');
const app = express();

const http = require('http'); // Add this line
const socketIo = require('socket.io'); // Add this line
const server = http.createServer(app); // Modify this line
const io = socketIo(server); // Add this line
module.exports = { io };
require('./socketIO/socket');


require('dotenv').config();
const passport = require('passport');
const { initializingPassport } = require('./passportConfig');
const session = require('express-session');
require('./passportJS/googleAuth');
const MySQLStore = require('express-mysql-session')(session);

require("./helpers/findUsersNotConnectedTo");



// MySQL database connection options
const dbOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
};

// Initialize the session store
const sessionStore = new MySQLStore(dbOptions);



const postRoute = require('./routes/posts');
const userRoute = require('./routes/user');

const uploadRoutes = require('./routes/uploadRoutes');
const zipUploadRoutes = require('./routes/zipUploadRoutes');
const myPostsRoutes = require('./routes/myPostsRoute');
const forgotPassRoutes = require('./routes/forgotPass');
const resetPassRoutes = require("./routes/resetPass");
const profileRoutes = require("./routes/profileRoute");
const myNetworkRoutes = require("./routes/myNetwork");
const chatRoutes = require('./routes/chat');
const firebaseRoutes = require('./routes/firebaseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const methodOverride = require("method-override");
const logOut = require('./controllers/logOutController');
const dbMiidleware = require('./middleware/dbMiddleware');
const { dateFormate, dateFormateOnly, eq } = require('./helpers/hbs_helper');
const { checkAuth } = require('./middleware/check-auth');


initializingPassport(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(dbMiidleware);


app.use(session({
    key: 'session_user',
    secret: 'your-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: null,
    layoutsDir: path.join(__dirname, 'views'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },
    helpers: {
        formatDate: dateFormate,
        dateFormateOnly: dateFormateOnly,
        isEqual: (a, b) => a == b,
        isEqualConnection: (a, b) => a == b,
        isEqualLike: (a, b) => a == b,
        isEqualConnection: (a, b) => a == b,
        isEqualMessage: (a, b) => a == b,
        json: (context) => JSON.stringify(context)
    }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'profile')));

app.use('/uploads', express.static('uploads'));

app.use('/user', userRoute);
app.use('/post', postRoute);
app.use('/profile', profileRoutes);
app.use('/my-posts', myPostsRoutes);
app.use('/forgot-password', forgotPassRoutes);
app.use('/reset', resetPassRoutes);
app.use('/notification', notificationRoutes);



//* firebase notifications 
app.use('/', firebaseRoutes);

app.use('/upload', uploadRoutes);
// app.use('/upload', zipUploadRoutes);


app.use('/detail-profile', (req, res) => {
    res.render('detailProfile');
});

app.use('/my-network', myNetworkRoutes);

app.get('/auth/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    }
    ));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/post',
        failureRedirect: '/user/sign-up'
    }));

app.get('/logout', checkAuth, logOut);

// Share io instance with routes
app.use((req, res, next) => {
    req.io = io;
    next();
});


app.use('/chat', chatRoutes);


// Socket.io connection
app.use((req, res) => res.render('pageNotFound'));


server.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`);
});