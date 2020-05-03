const express = require('express');
const router = express.Router();
const db = require('./db.js');

let clients = [];
let client_id = 0;

function send_update_group_to_all(group) {
    if (clients.length > 0) {
        const data = {
            event_name: "update_group",
            payload: group
        };
        clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`))
    }
}

function send_update_item_to_all(item) {
    if (clients.length > 0) {
        const data = {
            event_name: "update_item",
            payload: item
        };
        clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`))
    }
}

function send_delete_group_to_all(group_id) {
    if (clients.length > 0) {
        const data = {
            event_name: "delete_group",
            payload: group_id
        };
        clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`))
    }
}

function send_delete_item_to_all(group_id, entry_id) {
    if (clients.length > 0) {
        const data = {
            event_name: "delete_item",
            payload: {
                group_id: group_id,
                entry_id: entry_id
            }
        };
        clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`))
    }
}

function send_items(res) {
    db.get_all().then(items => {
        const data = {
            event_name: "all_data",
            payload: items
        };
        const msg = `data: ${JSON.stringify(data)}\n\n`;
        if (res) {
            res.write(msg);
        } else if (clients.length > 0) {
            clients.forEach(c => c.res.write(msg));
        }
    });
}

// update and send event every 60 seconds.
setInterval(() => send_items(), 60 * 1000);

// Middleware for GET /events endpoint
router.get('/events', (req, res, next) => {
    req.socket.setTimeout(Number.MAX_VALUE);
    // Mandatory headers and http status to keep connection open
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
    };
    res.writeHead(200, headers);

    // After client opens connection send all current list_items as string
    send_items(res);

    // Generate an id based on timestamp and save res
    // object of client connection on clients list
    // Later we'll iterate it and send updates to each client
    const clientId = client_id++;
    const newClient = {
        id: clientId,
        res
    };
    clients.push(newClient);

    // When client closes connection we update the clients list
    // avoiding the disconnected one
    req.on('close', () => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter(c => c.id !== clientId);
    });
    next();
});

router.get('/', (req, res) => {
    db.get_all()
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((data) => {
            res.send(data);
        })
});

router.put('/:group', (req, res) => {
    var group_id = req.params.group;
    db.add_group(group_id)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
            send_update_group_to_all(result);
        });
});

router.put('/:group/:item', (req, res) => {
    var group_id = req.params.group;
    var item_name = req.params.item;
    db.add_item(group_id, item_name)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
            send_update_item_to_all(result);
        });
});

router.post('/:group/:new_group_name', (req, res) => {
    var group_id = req.params.group;
    var new_group_name = req.params.new_group_name;
    db.update_group(group_id, new_group_name)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
            send_update_group_to_all(result);
        });
});

router.post('/:group/:item/:marked', (req, res) => {
    var group_id = req.params.group;
    var item_id = req.params.item;
    var marked = req.params.marked;
    db.update_item(group_id, item_id, marked)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
            send_update_item_to_all(result);
        });
});

router.delete('/:group', (req, res) => {
    var group_id = req.params.group;
    db.remove_group(group_id)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
            send_delete_group_to_all(group_id);
        });
});

router.delete('/:group/:item', (req, res) => {
    var group_id = req.params.group;
    var item_id = req.params.item;
    db.remove_item(group_id, item_id)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
            send_delete_item_to_all(group_id, item_id);
        });
});

module.exports = router;