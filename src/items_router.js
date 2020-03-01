const express = require('express');
const router = express.Router();
const db = require('./db.js');

let clients = [];
let client_id = 0;

function send_update_item_to_all(item) {
    if (clients.length > 0) {
        const data = {
            event_name: "update_item",
            payload: item
        };
        clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`))
    }
}

function send_delete_item_to_all(entry_id) {
    if (clients.length > 0) {
        const data = {
            event_name: "delete_item",
            payload: entry_id
        };
        clients.forEach(c => c.res.write(`data: ${JSON.stringify(data)}\n\n`))
    }
}

function send_items(res) {
    db.get_list().then(items => {
        const data = {
            event_name: "all_items",
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
    var all = (req.query.all ? req.query.all == 1 : false);
    db.get_list(all)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
        });
});

router.put('/:item', (req, res) => {
    var item = req.params.item;
    db.save_item(item)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
            send_update_item_to_all(result);
        });
});

router.post('/:entry_id/:marked', (req, res) => {
    var entry_id = req.params.entry_id;
    var marked = req.params.marked;
    db.update_item(entry_id, marked)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
            send_update_item_to_all(result);
        });
});

router.delete('/:entry_id', (req, res) => {
    var entry_id = req.params.entry_id;
    db.remove_item(entry_id)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
            send_delete_item_to_all(entry_id);
        });
});

module.exports = router;