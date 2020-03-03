const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db_path = './db/test.db';
const table_name = 'list';
var SqlString = require('sqlstring');

if (!fs.existsSync(db_path)) {
    if (!fs.existsSync("./db/")) fs.mkdirSync('./db/');
    fs.writeFileSync(db_path, '');
}

open_db().then((db) => {
    db.run(`CREATE TABLE IF NOT EXISTS ${table_name}(entry_id INTEGER PRIMARY KEY AUTOINCREMENT, item_name TEXT, marked INTEGER, ts_changed INTEGER)`);
})

function open_db() {
    return new Promise((resolve, reject) => {
        var db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, function (err) {
            if (err) {
                console.error(err.message);
                reject(err.message);
            } else {
                console.log('Connected to the database.');
            }
        });
        resolve(db);
    });
}

module.exports.get_list = (all) => {
    console.log("get_list");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT entry_id, item_name, marked FROM '${table_name}'`,
            function (err, rows) {
                if (err) {
                    console.error(err);
                    resolve([]);
                } else {
                    console.log(`Successfully retrieved top ${rows.length} items`);
                    resolve(rows);
                }
            });
        db.close();
    });
}

module.exports.save_item = (item_name) => {
    console.log("save_item");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`INSERT INTO ${table_name}(item_name, marked, ts_changed)
                VALUES(?, ?, ?)`, [item_name, 0, "strftime('%s','now')"], function (err) {
            if (err) {
                console.error(String(table_name), ":", err);
                reject(err);
            }
            console.log(`${item_name} has been inserted - entry_id: ${this.lastID}`);
            resolve({
                entry_id: this.lastID,
                item_name: item_name,
                marked: 0
            });
        });
    });
}


module.exports.update_item = (entry_id, marked) => {
    console.log("remove_item");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`UPDATE '${table_name}'
                SET marked = ${marked},
                    ts_changed = strftime('%s','now')
                WHERE entry_id == ${entry_id}`, function (err) {
            if (err) {
                console.error(table_name, ":", err);
                reject(err);
            } else {
                console.log(`successfully updated item(${entry_id} -> marked=${marked})`);
                resolve({
                    entry_id: entry_id,
                    marked: marked
                });
            }
        });
    });
}

module.exports.remove_item = (entry_id) => {
    console.log("remove_item");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`DELETE FROM '${table_name}' 
                WHERE entry_id == ${entry_id}`, function (err) {
            if (err) {
                console.error(table_name, ":", err);
                reject(err);
            } else {
                console.log(`successfully removed item(${entry_id})`);
                resolve({});
            }
        });
    });
}