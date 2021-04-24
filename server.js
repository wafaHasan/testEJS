'use strict';

require('dotenv').config();

const express = require('express');

const server = express();

const superagent = require('superagent');

const pg = require('pg');

const methodOverride = require('method-override');

server.use(methodOverride('_method'));

const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;

server.use(express.static('./public'));

server.use(express.urlencoded({ extended: true }));

server.set('view engine', 'ejs');

server.use(express.static('./public'));
// server.post('/login', (req, res) => {
//     console.log(req.body);
//     res.send('hello');
// });

server.get('/', (req, res) => {
    // res.send('hi');
    let SQL = `SELECT * FROM tasks`;
    client.query(SQL)
        .then((results) => {
            // console.log(results.rows);
            res.render('index', { resultsData: results.rows });
        })
        .catch(err => {
            res.render('error', { error: err });
        });
});

server.get('/showform', (req, res) => {
    res.render('taskForm')
        .catch(err => {
            res.render('error', { error: err });
        });
});

server.post('/addtask', (req, res) => {
    // console.log(req.body);


    let SQL = `INSERT INTO tasks (title,contact,status,category,description) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    let { title, contact, status, category, description } = req.body;
    let safeValues = [title, contact, status, category, description];
    client.query(SQL, safeValues)
        .then((result) => {
            // res.render('index', {resultsData: result.rows});
            res.redirect(`/viewdetails/${result.rows[0].id}`);
        })
        .catch(err => {
            res.render('error', { error: err });
        });
});

server.get('/viewdetails/:id', (req, res) => {
    let SQL = `SELECT * FROM tasks WHERE id=$1;`;
    let safeValues = [req.params.id];
    client.query(SQL, safeValues)
        .then((result) => {
            console.log(result.rows[0]);
            res.render('oneTask', { data: result.rows[0] });
        })
        .catch(err => {
            res.render('error', { error: err });
        });
});

server.put('/updatetask/:id', (req, res) => {
    let SQL = 'UPDATE tasks SET title=$1, description=$2, contact=$3, status=$4, category=$5 WHERE id=$6';
    let { title, contact, status, category, description } = req.body;
    let safeValues = [title, contact, status, category, description, req.params.id];
    client.query(SQL, safeValues)
        .then((results) => {
            res.redirect(`/viewdetails/${req.params.id}`);
        })
        .catch(err => {
            res.render('error', { error: err });
        });
});

server.delete('/deletetask/:id', (req, res) => {
    let SQL = 'DELETE FROM tasks WHERE id=$1;';
    let safeValues = [req.params.id];
    client.query(SQL, safeValues)
        .then((results) => {
            res.redirect('/');
        })
        .catch(err => {
            res.render('error', { error: err });
        });
});

server.get('*', (req, res) => {
    // res.status(404).send('sorry, something went wrong');
    res.render('404');
});

// server.get('/listfamily', (req, res) => {
//     let familyArr = ['wafa', 'mum', 'dad'];
//     // res.send(familyArr);
//     res.render('familyMembers', { familyData: familyArr });
// });

// //https://www.googleapis.com/books/v1/volumes?q=search+terms
// server.get('/bookslist', (req, res) => {
//     let url = `https://www.googleapis.com/books/v1/volumes?q=cats`;
//     superagent.get(url)
//         .then((booksData) => {
//             // res.send(booksData.body.items[1].volumeInfo.title);
//             res.render('bookslist', { booksData: booksData.body.items });
//         });
// });


client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Listening to PORT ${PORT}`);
        });
    });


