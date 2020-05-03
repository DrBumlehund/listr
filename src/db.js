const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db_path = './db/test.db';
const list_table_name = 'list';
const group_table_name = 'groups';
var SqlString = require('sqlstring');

if (!fs.existsSync(db_path)) {
    if (!fs.existsSync("./db/")) fs.mkdirSync('./db/');
    fs.writeFileSync(db_path, '');
}

open_db().then((db) => {
    db.run(`CREATE TABLE IF NOT EXISTS ${list_table_name}(entry_id INTEGER PRIMARY KEY AUTOINCREMENT, group_id INTEGER, item_name TEXT, marked INTEGER, ts_changed INTEGER)`);
    db.run(`CREATE TABLE IF NOT EXISTS ${group_table_name}(group_id INTEGER PRIMARY KEY AUTOINCREMENT, group_name TEXT)`);
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

module.exports.get_all = () => {
    console.log("get_all");
    return new Promise(async (resolve, reject) => {
        data = []
        groups = await this.get_groups();
        for (let i = 0; i < groups.length; i++) {
            data.push({
                group_id: groups[i].group_id,
                group_name: groups[i].group_name,
                items: await this.get_group_items(groups[i].group_id)
            });
        }
        resolve(data);
    });
}

module.exports.get_groups = () => {
    console.log("get_groups");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT * FROM '${group_table_name}'`,
            function (err, rows) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully retrieved ${rows.length} groups`);
                    resolve(rows);
                }
            });
        db.close();
    });
}

module.exports.get_group_items = (group_id) => {
    console.log("get_group_items");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();

        db.all(`SELECT entry_id, group_id, item_name, marked 
                FROM '${list_table_name}' 
                WHERE group_id == ${group_id}`,
            function (err, rows) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`Successfully retrieved top ${rows.length} items`);
                    resolve(rows);
                }
            });
        db.close();
    });
}

module.exports.add_group = (group_name) => {
    console.log("add_group");
    console.log("group_name", SqlString.escape(group_name), "vs.", group_name);
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`INSERT INTO ${group_table_name}(group_name)
                VALUES(?)`, [group_name], function (err) {
            if (err) {
                console.error(String(group_table_name), ":", err);
                reject(err);
            }
            console.log(`${group_name} has been inserted - group_id: ${this.lastID}`);
            resolve({
                group_id: this.lastID,
                group_name: group_name
            });
        });
    });
}

module.exports.add_item = (group_id, item_name) => {
    console.log("add_item");
    console.log("item_name", SqlString.escape(item_name), "vs.", item_name);
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`INSERT INTO ${list_table_name}(group_id, item_name, marked, ts_changed)
                VALUES(?, ?, ?, ?)`, [group_id, item_name, 0, "strftime('%s','now')"], function (err) {
            if (err) {
                console.error(String(list_table_name), ":", err);
                reject(err);
            }
            console.log(`${item_name} has been inserted - entry_id: ${this.lastID}`);
            resolve({
                group_id: Number(group_id),
                entry_id: this.lastID,
                item_name: item_name,
                marked: 0
            });
        });
    });
}


module.exports.update_group = (group_id, group_name) => {
    console.log("remove_item");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`UPDATE '${group_table_name}'
                SET group_name = ${group_name}
                WHERE group_id == ${group_id}`, function (err) {
            if (err) {
                console.error(list_table_name, ":", err);
                reject(err);
            } else {
                console.log(`successfully updated item(${entry_id} -> marked=${marked})`);
                resolve({
                    group_id: this.lastID,
                    group_name: group_name
                });
            }
        });
    });
}

module.exports.update_item = (group_id, entry_id, marked) => {
    console.log("remove_item");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`UPDATE '${list_table_name}'
                SET marked = ${marked},
                    ts_changed = strftime('%s','now')
                WHERE group_id == ${group_id} 
                  AND entry_id == ${entry_id}`, function (err) {
            if (err) {
                console.error(list_table_name, ":", err);
                reject(err);
            } else {
                console.log(`successfully updated item(${entry_id} -> marked=${marked})`);
                resolve({
                    group_id: group_id,
                    entry_id: entry_id,
                    marked: marked
                });
            }
        });
    });
}

module.exports.remove_group = (group_id) => {
    console.log("remove_group");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`DELETE FROM '${list_table_name}' 
                WHERE group_id == ${group_id}`, function (err) {
            if (err) {
                console.error(list_table_name, ":", err);
                reject(err);
            } else {
                console.log(`successfully removed items from group(${group_id})`);
                resolve({});
            }
        });
        db.run(`DELETE FROM '${group_table_name}' 
                WHERE group_id == ${group_id}`, function (err) {
            if (err) {
                console.error(group_table_name, ":", err);
                reject(err);
            } else {
                console.log(`successfully removed group(${group_id})`);
                resolve({});
            }
        });
    });
}

module.exports.remove_item = (group_id, entry_id) => {
    console.log("remove_item");
    return new Promise(async (resolve, reject) => {
        let db = await open_db();
        db.run(`DELETE FROM '${list_table_name}' 
                WHERE group_id == ${group_id}
                  AND entry_id == ${entry_id}`, function (err) {
            if (err) {
                console.error(list_table_name, ":", err);
                reject(err);
            } else {
                console.log(`successfully removed item(${entry_id})`);
                resolve({});
            }
        });
    });
}