const express = require('express');
const router = express.Router();
const controller = require('../controllers/bazmeDuroodController');

router.post('/bazmedurood', controller.insertBazmeDurood);
router.get('/bazmedurood', controller.getAllBazmeDurood);
router.get('/bazmedurood/id/:id', controller.getBazmeDuroodById);
router.get('/bazmedurood/limit/:limit', controller.getBazmeDuroodWithLimit);
router.get('/bazmedurood/paginate', controller.getBazmeDuroodPaginated);
router.get('/bazmedurood/total-count', controller.getTotalDuroodCount);


module.exports = router;
