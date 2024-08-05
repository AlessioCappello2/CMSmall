'use strict';

const PORT = 3000;

const express = require('express');
const morgan = require('morgan');
const {check, validationResult} = require('express-validator');
const userDao = require('./user-dao') 
const pbDao = require('./pageblock-dao')
const titleDao = require('./title-dao')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session')
const cors = require('cors');

const app = express();
app.use(morgan('dev')); 
app.use(express.json());
const corsOption = {
    origin: 'http://localhost:5173',
    credentials: true
}
app.use(cors(corsOption))
app.use("/server/images", express.static('images'));

// ADD -> userDao.getUser
passport.use(new LocalStrategy(
    function(username, password, callback){
        userDao.getUser(username, password).then((user) => {
            if(!user)
                return callback(null, false, { message: 'Incorrect username and/or password.'});
            return callback(null, user);
        })
    }
));

passport.serializeUser((user, callback) => {
    callback(null, user.id)
})

// ADD -> userDao.getUserById
passport.deserializeUser((id, callback) => {
    userDao.getUserById(id)
    .then(user => {
        callback(null, user);
    }).catch(err => {
        callback(err, null);
    })
})

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())
        return next();
    return res.status(401).json({error: 'Not authenticated'})
}

const isAdmin = (req, res, next) => {
    if(req.user.role === 1)
        return next();
    return res.status(403).json({error: 'Not authorized'})
}

const checkAuthor = (req, res, next) => {
    if (req.user.role === 1 || req.body.page.idauthor === req.user.id) 
        return next();
    return res.status(403).json({ error: 'You are not allowed to edit this page' });
}

app.use(session({
    secret: "f88a5410ea3a12957bf3398r2yg",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.get('/api/pages',
    (req, res) => {
        pbDao.listPages()
        .then((pages) => {res.json(pages)})
        .catch((err) => {res.status(500).json(err)})
    }
);

// ROUTE FOR BACKOFFICE
app.get('/api/pages/back', isLoggedIn,
    (req, res) => {
        pbDao.authPages()
        .then((pages) => {res.json(pages)})
        .catch((err) => {res.status(500).json(err)})
    }
)

app.get('/api/page/:id',
    (req, res) => {
        pbDao.getPage(req.params.id)
        .then((page) => {res.json(page)})
        .catch((err) => {res.status(500).json(err)})
    }
);

// ROUTE FOR UPDATING A PAGE (ONLY ADMIN OR AUTHOR)
app.put('/api/page/:id', isLoggedIn, checkAuthor, [
        check('page.title').custom((title) => {
            if(title.length < 1) throw new Error('Title is required');
            return true;
        }),
        check('page.blocks').custom((blocks) => {
            const hasHeader = blocks.some((block) => block.type === 'H');
            if(!hasHeader) throw new Error('At least one header is required');

            const hasImPar = blocks.some((block) => block.type === 'I' || block.type === 'P');
            if(!hasImPar) throw new Error('At least one image or paragraph is required');
            if(blocks.length !== blocks.filter((b) => b.content.length > 0).length) throw new Error('All blocks must have content');

            return true;
        })
    ],
    (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({errors: errors.array().map((err) => err.msg)});
        }
        pbDao.updatePage(req.params.id, req.body.page)
        .then((page) => {res.json(page)})
        .catch((err) => {res.status(500).json(err)})
    }
);

app.delete('/api/page/:id', isLoggedIn,
    (req, res) => {
        pbDao.getAuthor(req.params.id).then((author) => {
            if(!(req.user.role === 1 || req.user.id === author.id))
                return res.status(403).json({error: 'You are not allowed to delete this page'})
            pbDao.deletePage(req.params.id)
            .then((msg) => {res.json(msg)})
            .catch((err) => {res.status(500).json(err)})})
        .catch((err) => {res.status(500).json(err)})
    }
);

// ROUTE FOR CREATING A NEW PAGE (AUTH REQUIRED)
app.post('/api/new', isLoggedIn, [
        check('page.title').custom((title) => {
            if(title.length < 1) throw new Error('Title is required');
            return true;
        }),
        check('page.blocks').custom((blocks) => {
            const hasHeader = blocks.some((block) => block.type === 'H');
            if(!hasHeader) throw new Error('At least one header is required');
            
            const hasImPar = blocks.some((block) => block.type === 'I' || block.type === 'P');
            if(!hasImPar) throw new Error('At least one image or paragraph is required');
            if(blocks.length !== blocks.filter((b) => b.content.length > 0).length) throw new Error('All blocks must have content');
            
            return true;
        })
    ],
    (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({errors: errors.array().map((err) => err.msg)});
        }

        pbDao.addPage(req.body.page)
        .then((id) => {res.json(id)})
        .catch((err) => {res.status(500).json(err)})
    }   
);

app.get('/api/title',
    (req, res) => {
        titleDao.getTitle()
        .then((title) => {res.json(title)})
        .catch((err) => {res.status(500).json(err)})
    }
)

app.put('/api/title', isLoggedIn, isAdmin, [
        check('title').custom((title) => {
            if(title.trim().length < 1) throw new Error('Website name cannot be empty');
            return true;
        })
    ],   
    (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({errors: errors.array().map((err) => err.msg)});
        }

        titleDao.setTitle(req.body.title)
        .then((title) => {res.json(title)})
        .catch((err) => {res.status(500).json(err)})
    }
)

app.get('/api/info/:id', 
    (req, res) => {
        pbDao.getInfo(req.params.id)
        .then((info) => {res.json(info)})
        .catch((err) => {res.status(500).json(err)})
    }
)

app.get('/api/author/:id',
    (req, res) => {
        pbDao.getAuthor(req.params.id)
        .then((author) => {res.json(author)})
        .catch((err) => {res.status(500).json(err)})
    }
)

app.get('/api/authors', 
    (req, res) => {
        userDao.getAuthors()
        .then((a) => {res.json(a)})
        .catch((err) => {res.status(500).json(err)})
    }
)

// ROUTES LOGIN
// POST /sessions --- login (displaying error msgs)
app.post('/api/sessions', function(req, res, next){
    passport.authenticate('local', (err, user, info) => {
        if(err) return next(err);
        if(!user) return res.status(401).json(info);
        req.login(user, (err) => {
            if (err) return next(err);
            return res.json(req.user);
        });
    })(req, res, next);
})

// GET /sessions/current --- check the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()){
        res.status(200).json(req.user);}
    else
        res.status(401).json({error: 'Unauthenticated user!'})
})

// DELETE /sessions/current --- logout
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => { res.end(); });
})

app.listen(PORT,
    () => { console.log(`Server started on http://localhost:${PORT}/`) });