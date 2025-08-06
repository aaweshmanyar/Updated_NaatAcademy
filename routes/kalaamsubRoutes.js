const express = require('express');
const router = express.Router();
const kalamController = require('../controllers/Kalaamsubmission');

// Insert new kalam submission (POST)
router.post('/kalamsub', kalamController.insertKalam);

// Get all kalam submissions (Admin Purpose) (GET)
router.get('/kalamssub', kalamController.getKalamSubmissions); 

// Get approved kalam submissions only (Frontend) (GET)
router.get('/kalamssub/approved', kalamController.getApprovedKalamSubmissions);

// Get single kalam submission by ID (GET)
router.get('/kalamssub/:id', kalamController.getKalamById);

// Update kalam submission by ID (PUT)
router.put('/kalamssub/:id', kalamController.updateKalam);

// Delete kalam submission by ID (DELETE)
router.delete('/kalamssub/:id', kalamController.deleteKalam);


// New Route → Get Approved Kalam with Limit
router.get('/kalamsub/limit', kalamController.getKalamWithLimit);


// Existing imports...
router.get('/kalamsub/count', kalamController.getKalamSubmissionCount);

module.exports = router;
