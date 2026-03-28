const express = require('express');
const router = express.Router();
const cc = require('../controllers/cardController');

router.get('/search', cc.searchCards);
router.get('/labels', cc.getLabels);
router.put('/reorder', cc.reorderCards);
router.get('/:id', cc.getCard);
router.put('/:id', cc.updateCard);
router.delete('/:id', cc.deleteCard);
router.post('/:id/labels', cc.addLabel);
router.delete('/:id/labels/:labelId', cc.removeLabel);
router.post('/:id/members', cc.addMember);
router.delete('/:id/members/:memberId', cc.removeMember);
router.post('/:id/checklist', cc.addChecklistItem);
router.put('/:id/checklist/:itemId', cc.updateChecklistItem);
router.delete('/:id/checklist/:itemId', cc.deleteChecklistItem);

module.exports = router;
