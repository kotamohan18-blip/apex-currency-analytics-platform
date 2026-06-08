const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/favoritesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes in this file are protected

router.route('/')
  .get(getFavorites)
  .post(addFavorite);

router.route('/:id')
  .delete(removeFavorite);

module.exports = router;
