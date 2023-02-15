const express = require('express');
const router = express.Router();
const Controller = require('../controllers/eventController')

router.post('/add' , Controller.add )
router.put('/update-event' , Controller.updateEvent )
router.post('/search-event' , Controller.searchEvent)
router.post('/book-event' , Controller.bookEvent)

module.exports = router;
