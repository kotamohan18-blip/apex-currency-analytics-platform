const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes in this file are protected

router.route('/')
  .get(getWatchlist)
  .post(addToWatchlist);

router.route('/:id')
  .delete(removeFromWatchlist);

module.exports = router;
