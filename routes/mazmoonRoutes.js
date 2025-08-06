const express = require('express');
const router = express.Router();
const mazmoonController = require('../controllers/mazmoonController');

// Insert new mazmoon submission (POST)
router.post('/mazmoonsub', mazmoonController.insertMazmoon);

// Get all mazmoon submissions (Admin Purpose) (GET)
router.get('/mazmoonssub', mazmoonController.getAllMazmoon);

// Get approved mazmoon submissions only (Frontend) (GET)
router.get('/mazmoonssub/approved', mazmoonController.getApprovedMazmoon);

// Get single mazmoon submission by ID (GET)
router.get('/mazmoonssub/:id', mazmoonController.getMazmoonById);

// Update mazmoon submission by ID (PUT)
router.put('/mazmoonssub/:id', mazmoonController.updateMazmoon);

// Delete mazmoon submission by ID (DELETE)
router.delete('/mazmoonssub/:id', mazmoonController.deleteMazmoon);

// New Route → Get Approved Mazmoon with Limit
router.get('/mazmoonsub/limit', mazmoonController.getMazmoonWithLimit);

// Existing imports...
router.get('/mazmoonsub/count', mazmoonController.getMazmoonSubmissionCount);


module.exports = router;
