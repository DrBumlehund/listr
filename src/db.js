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
    db.run(`CREATE TABLE IF NOT EXISTS ${table_name}(entry_id INTEGER PRIMARY KEY AUTOINCREMENT, list_id INTEGER, item_name TEXT, marked INTEGER, ts_changed INTEGER)`);
})

function open_db() {
    return new Promise((resolve, reject) => {
        var db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
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

module.exports.list_count = () => {
    console.log("list_count");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.get(`
        SELECT COUNT (DISTINCT list_id) AS count
        FROM '${table_name}';`, (err, row) => {
            if (err) {
                console.error(table_name, ":", err);
                resolve(0);
            } else {
                console.log(`successfully calculated ${JSON.stringify(row)} lists`);
                resolve(row);
            }
        });
    });
}

module.exports.get_list = (list, all) => {
    console.log("get_list");
    list = list || 0;
    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT entry_id, list_id, item_name, marked FROM '${table_name}'
                WHERE list_id == ${list} AND ( ( marked == 0 OR (strftime('%s','now') - ts_changed) < (15) ) OR ${(all ? 'true' : 'false')})`,
            (err, rows) => {
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

module.exports.save_item = (list_id, item) => {
    console.log("save_item");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`INSERT INTO ${table_name}(list_id, item_name, marked, ts_changed)
                VALUES(${list_id}, ${SqlString.escape(item)}, 0, strftime('%s','now'))`, (err) => {
            if (err) {
                console.error(table_name, ":", err);
                reject(err);
            } else {
                console.log(`successfully inserted item(${list_id} ${SqlString.escape(item)})`);
                resolve({});
            }
        });
    });
}


module.exports.update_item = (list_id, entry_id, marked) => {
    console.log("remove_item");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`UPDATE '${table_name}'
                SET marked = ${marked},
                    ts_changed = strftime('%s','now')
                WHERE list_id == ${list_id} AND entry_id == ${entry_id}`, (err) => {
            if (err) {
                console.error(table_name, ":", err);
                reject(err);
            } else {
                console.log(`successfully updated item(${list_id} ${entry_id}, ${marked})`);
                resolve({});
            }
        });
    });
}

module.exports.remove_item = (list_id, entry_id) => {
    console.log("remove_item");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`DELETE FROM '${table_name}' 
                WHERE list_id == ${list_id} AND entry_id == ${entry_id}`, (err) => {
            if (err) {
                console.error(table_name, ":", err);
                reject(err);
            } else {
                console.log(`successfully removed item(${list_id} ${entry_id})`);
                resolve({});
            }
        });
    });
}