const express = require('express');
const { MensajesDAO } = require('./daos/mensajesDao.js');
const socketio = require('socket.io');
const { generateProduct } = require('./faker.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const yargs = require('yargs/yargs')(process.argv.slice(2));

const args = yargs.default('port', 8080).alias('p', 'port').argv;

const app = express();
const PORT = args.port;
const server = app.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`);
});

app.set('view engine', 'hbs');
app.set('views', './public');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const io = socketio(server);

io.on('connection', async socket => {
    console.log('Nuevo cliente conectado!');
    const mensajesDao = new MensajesDAO();
    const mensajes = await mensajesDao.obtenerMensajes();
    socket.emit('messages', mensajes);
});

io.on('new-message', async data => {
    try {
        const mensajes = new MensajesDAO();
        await mensajes.guardarMensaje(data);
        io.emit('messages', await mensajes.obtenerMensajes());
        } catch (error) {
            console.log(error);
            }
            });

app.get('/api/products-tests', auth, (req, res) => {
    const product = generateProduct();
    if (product.length > 0) {
        
        res.render('view.hbs', { product, user: req.session.user });
    }
});



const AdvancedOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

app.use(session({
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://nahuelretamoso:<password>@cluster0.rrceole.mongodb.net/sessions?retryWrites=true&w=majority',
    mongoOptions: AdvancedOptions }),
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
}));

function auth(req, res, next) {
    if (req.session?.user === 'alex' && req.session?.admin) {
        return next();
    }
    return res.status(401).send('error de autorización');
}

function desloguear(req, res, next) {
    req.session.destroy();
    res.redirect('/');
}

app.get('/login', (req, res) => {
    res.render('login.hbs');
});

app.post('/login', (req, res) => {
    const { user, password } = req.body;
    if (user === 'alex' && password === '123') {
        req.session.user = user;
        req.session.admin = true;
        return res.redirect('/private');
    }
    res.redirect('/api/products-tests');
});


const { create } = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./models');


passport.use('signup', new LocalStrategy({
    passReqToCallback: true
}, (req, username, password, done) => {
    User.findOne({ username }, (err, user) => {
        if (err) {
            return done(err);
        }

        if (user) {
            return done(null, false, { message: 'El usuario ya existe' });
        }

        const newUser = new User({
            username: username,
            password: createHash(password),
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });

        newUser.save((err) => {
            if (err) {
                return done(err);
            }

            return done(null, newUser);
        });
    });
}  
));

const createHash = (password) => {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

passport.use('login', new LocalStrategy({
    passReqToCallback: true
}, (req, username, password, done) => {
    User.findOne({ username }, (err, user) => {
        if (err) {
            return done(err);
        }

        if (!user) {
            return done(null, false, { message: 'El usuario no existe' });
        }

        if (!isValidPassword(user, password)) {
            return done(null, false, { message: 'Contraseña incorrecta' });
        }

        return done(null, user);
    });
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

const isValidPassword = (user, password) => {
    return bCrypt.compareSync(password, user.password);
}


app.get('/signup', (req, res) => {
    res.render('signup.hbs');
});

app.post('/signup', passport.authenticate('signup', {
    successRedirect: '/private',
    failureRedirect: '/signup',
    failureFlash: true
}));

app.get('/login', (req, res) => {
    res.render('login.hbs');
});

app.post('/login', passport.authenticate('login', {
    successRedirect: '/api/products-tests',
    failureRedirect: '/login',
    failureFlash: true
}));

const info = require('./info.js');

app.get('/info', (req, res) => {
    res.render('info.hbs', { info });
});

const { fork }  = require('child_process');

app.get('/api/randoms', (req, res) => {
    const randoms = fork('./randoms.js');
    randoms.send('start');
    randoms.on('message', (randoms) => {
        res.send(randoms);
    });
});