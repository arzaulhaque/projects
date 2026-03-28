const express = require('express');
const router = express.Router();
const bc = require('../controllers/boardController');

router.get('/', bc.getBoards);
router.post('/', bc.createBoard);
router.get('/:id', bc.getBoard);
router.put('/:id', bc.updateBoard);
router.delete('/:id', bc.deleteBoard);

module.exports = router;
