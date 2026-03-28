const express = require('express');
const router = express.Router();
const lc = require('../controllers/listController');
const cc = require('../controllers/cardController');

router.get('/board/:boardId', lc.getLists);
router.post('/board/:boardId', lc.createList);
router.put('/reorder', lc.reorderLists);
router.put('/:id', lc.updateList);
router.delete('/:id', lc.deleteList);
router.get('/:listId/cards', cc.getCards);
router.post('/:listId/cards', cc.createCard);

module.exports = router;
