'use strict';

const db = require('./db');

exports.setTitle = (title) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE website SET name = ?';
        db.run(sql, [title], function(err) {
            if(err) reject({error: err.message});
            resolve("Website name updated");
        });   
    });
}

exports.getTitle = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM website';
        db.all(sql, [], (err, row) => {   
            if(err) reject({error: err.message});
            if(row === undefined){
                resolve(undefined);
            } else {
                const title = row.map((t) => ({title: t.name}))[0];
                resolve(title);
            }
        });
    });
}