'use strict';

const db = require('./db');
const dayjs = require('dayjs');

exports.listPages = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT pages.id as id, pages.title, pages.creationdate, pages.publicationdate, users.name, users.id as idauthor FROM pages, users WHERE pages.idauthor = users.id AND pages.creationdate <> "" ORDER BY publicationdate';
        db.all(sql, [], (err, rows) => {
            if(err) reject(err);
            const pages = rows.filter((p) => dayjs(p.publicationdate).isBefore(dayjs())).map((p) => ({ id: p.id, title: p.title, creationdate: p.creationdate,
                publicationdate: p.publicationdate, author: p.name, idauthor: p.idauthor
            }));
            resolve(pages);
        });
    });
}

exports.authPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT pages.id as id, pages.title, pages.creationdate, pages.publicationdate, users.name, users.id as idauthor FROM pages, users WHERE pages.idauthor = users.id ORDER BY publicationdate";
        db.all(sql, [], (err, rows) => {
            if(err) reject(err);
            const pages = rows.map((p) => ({ id: p.id, title: p.title, creationdate: p.creationdate,
                publicationdate: p.publicationdate, author: p.name, idauthor: p.idauthor
            }));
            resolve(pages);
        });
    }); 
}

exports.getPage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT blocks.id as id, blocks.type, blocks.content, blocks.position, pages.title FROM pages, blocks WHERE pages.id = ? AND blocks.idpage = pages.id ORDER BY position';
        db.all(sql, [id], (err, rows) => {
            if(err) reject(err);
            if(rows.length === 0){
                resolve(undefined);
            } else {
                const blocks = rows.map((b) => ({ id: b.id, type: b.type, content: b.content, position: b.position, title: b.title}));
                resolve(blocks);
            }
        });
    });
}

exports.addPage = (page) => {
    return new Promise((resolve, reject) => {
        const sql1 = 'INSERT INTO pages(title, idauthor, creationdate, publicationdate) VALUES(?, ?, DATE(?), DATE(?))'
        db.run(sql1, [page.title, page.idauthor, dayjs().format("YYYY-MM-DD"), page.publicationdate ? dayjs(page.publicationdate).format("YYYY-MM-DD") : ""], function(err) {
            if(err) reject(err);    
            const pageId = this.lastID;
            const sql2 = 'INSERT INTO blocks(idpage, type, content, position) VALUES(?, ?, ?, ?)';
            for (const block of page.blocks){
                db.run(sql2, [pageId, block.type, block.content, block.position], (err) => {
                    if(err) reject(err);
                })
            }
            resolve(pageId)
        });   
    });
}

exports.deletePage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM blocks WHERE idpage = ?';
        db.run(sql, [id], (err) => {
            if(err) reject(err);
            const sql2 = 'DELETE FROM pages WHERE id = ?';
            db.run(sql2, [id], (err) => {
                if(err) reject(err);
                resolve("Page deleted");
            });
        });
    });
}

exports.updatePage = (id, page) => {
    return new Promise((resolve, reject) => {
        const sql1 = 'DELETE FROM blocks WHERE idpage = ?';
        db.run(sql1, [id], (err) => {
            if(err) reject(err);
            const sql2 = 'DELETE FROM pages WHERE id = ?';
            db.run(sql2, [id], (err) => {
                if(err) reject(err);
                const sql3 = 'INSERT INTO pages(id, title, idauthor, creationdate, publicationdate) VALUES (?, ?, ?, DATE(?), DATE(?))';
                db.run(sql3, [id, page.title, page.idauthor, page.creationdate, dayjs(page.publicationdate).format("YYYY-MM-DD")], (err) => {
                    if(err) reject(err);
                    const sql4 = 'INSERT INTO blocks(idpage, type, content, position) VALUES(?, ?, ?, ?)';
                    for (const block of page.blocks){
                        db.run(sql4, [id, block.type, block.content, block.position], (err) => {
                            if(err) reject(err);
                        })
                    }
                    resolve(id);
                });
            });
        });   
    });
}

exports.getInfo = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT title, publicationdate, creationdate FROM pages WHERE id = ?';
        db.all(sql, [id], (err, rows) => {
            if(err) reject(err);
            if(rows.length === 0){
                resolve(undefined);
            } else {
                const info = rows.map((i) => ({ title: i.title, publicationdate: i.publicationdate, creationdate: i.creationdate}))[0];
                resolve(info);
            }
        }
        );
    });
}

exports.getAuthor = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT users.id, users.name FROM pages, users WHERE pages.id = ? AND pages.idauthor = users.id';
        db.all(sql, [id], (err, rows) => {
            if(err) reject(err);
            if(rows.length === 0){
                resolve(undefined)
            } else {
                const info = rows.map((i) => ({id: i.id, author: i.name}))[0]
                resolve(info);
            }
        }) 
    });
}