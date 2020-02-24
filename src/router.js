const express = require('express');
const router = express.Router();
const db = require('./db.js');

router.get('/', (req, res) => {
    db.list_count()
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
        });
});

router.get('/:list_id', (req, res) => {
    var list_id = req.params.list_id;
    var all = (req.query.all ? req.query.all == 1 : false);
    db.get_list(list_id, all)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
        });
});

router.put('/:list_id/:item', (req, res) => {
    var list_id = req.params.list_id;
    var item = req.params.item;
    db.save_item(list_id, item)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
        });
});

router.post('/:list_id/:entry_id/:marked', (req, res) => {
    var list_id = req.params.list_id;
    var entry_id = req.params.entry_id;
    var marked = req.params.marked;
    db.update_item(list_id, entry_id, marked)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
        });
});

router.delete('/:list_id/:entry_id', (req, res) => {
    var list_id = req.params.list_id;
    var entry_id = req.params.entry_id;
    db.remove_item(list_id, entry_id)
        .catch((reason) => {
            res.statusCode = 400
            res.send(reason)
        })
        .then((result) => {
            res.send(result);
        });
});

module.exports = router;