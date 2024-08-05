'use strict';

const db = require('./db');
const sqlite = require('sqlite3');
const crypto = require('crypto');

exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
          if (err) 
            reject(err);
          else if (row === undefined)
            reject({error: 'User not found.'});
          else {
            const user = {id: row.id, username: row.email, name: row.name, role: row.role}
            resolve(user);
          }
      });
    });
  };

exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      db.get(sql, [email], (err, row) => {
        if (err) { reject(err); }
        else if (row === undefined) { resolve(false); }
        else {
          const user = {id: row.id, username: row.email, name: row.name, role: row.role};
          
          const salt = row.salt;
          crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
            if (err) reject(err);
            
            const passwordHex = Buffer.from(row.password, 'hex');

            if(!crypto.timingSafeEqual(passwordHex, hashedPassword))
              resolve(false);
            else resolve(user); 
          });
        }
      });
    });
  };
    
exports.getAuthors = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, name FROM users ORDER BY id'
        db.all(sql, (err, rows) => {
            if(err) reject(err)
            if(rows.length === 0){
                reject(undefined)
            } else {
                resolve(rows)
            }
        })
    })
}