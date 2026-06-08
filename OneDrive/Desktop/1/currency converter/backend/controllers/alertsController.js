const Alert = require('../models/Alert');

// @desc    Get user's rate alerts
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a rate alert
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res) => {
  try {
    const { fromCurrency, toCurrency, condition, value } = req.body;

    if (!fromCurrency || !toCurrency || !condition || value === undefined) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    if (condition !== 'GREATER_THAN' && condition !== 'LESS_THAN') {
      return res.status(400).json({ message: 'Condition must be GREATER_THAN or LESS_THAN' });
    }

    // Check if identical active alert already exists
    const exists = await Alert.findOne({
      user: req.user._id,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      condition,
      value: Number(value),
      isActive: true,
    });

    if (exists) {
      return res.status(400).json({ message: 'An identical alert already exists.' });
    }

    const alert = await Alert.create({
      user: req.user._id,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      condition,
      value: Number(value),
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a rate alert
// @route   DELETE /api/alerts/:id
// @access  Private
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Check ownership
    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await alert.deleteOne();
    res.json({ message: 'Alert removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate/Dismiss a triggered alert
// @route   PUT /api/alerts/:id/dismiss
// @access  Private
const dismissAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Check ownership
    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update alert to clear triggered state or keep track as acknowledged
    alert.isTriggered = false;
    alert.isActive = false; // it is deactivated now
    await alert.save();

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAlerts,
  createAlert,
  deleteAlert,
  dismissAlert,
};
