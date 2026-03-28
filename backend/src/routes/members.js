const express = require('express');
const router = express.Router();
const mc = require('../controllers/memberController');

router.get('/', mc.getMembers);
router.post('/', mc.createMember);

module.exports = router;
