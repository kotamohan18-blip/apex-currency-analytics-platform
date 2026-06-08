const express = require('express');
const router = express.Router();
const {
  getAlerts,
  createAlert,
  deleteAlert,
  dismissAlert,
} = require('../controllers/alertsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes in this file are protected

router.route('/')
  .get(getAlerts)
  .post(createAlert);

router.route('/:id')
  .delete(deleteAlert);

router.route('/:id/dismiss')
  .put(dismissAlert);

module.exports = router;
