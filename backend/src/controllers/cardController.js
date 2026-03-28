const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCards = async (req, res, next) => {
  try {
    const cards = await prisma.card.findMany({
      where: { listId: Number(req.params.listId) },
      orderBy: { order: 'asc' },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklistItems: { orderBy: { order: 'asc' } },
      },
    });
    res.json(cards);
  } catch (err) {
    next(err);
  }
};

exports.createCard = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const listId = Number(req.params.listId);
    const maxOrder = await prisma.card.aggregate({
      _max: { order: true },
      where: { listId },
    });
    const order = (maxOrder._max.order ?? -1) + 1;
    const card = await prisma.card.create({
      data: { title, description, listId, order },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklistItems: true,
      },
    });
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
};

exports.getCard = async (req, res, next) => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklistItems: { orderBy: { order: 'asc' } },
      },
    });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    next(err);
  }
};

exports.updateCard = async (req, res, next) => {
  try {
    const { title, description, dueDate, listId, order } = req.body;
    const card = await prisma.card.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(listId !== undefined && { listId: Number(listId) }),
        ...(order !== undefined && { order }),
      },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklistItems: { orderBy: { order: 'asc' } },
      },
    });
    res.json(card);
  } catch (err) {
    next(err);
  }
};

exports.deleteCard = async (req, res, next) => {
  try {
    await prisma.card.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Card deleted' });
  } catch (err) {
    next(err);
  }
};

exports.reorderCards = async (req, res, next) => {
  try {
    const { cards } = req.body;
    await Promise.all(
      cards.map(({ id, order, listId }) =>
        prisma.card.update({
          where: { id },
          data: { order, ...(listId !== undefined && { listId: Number(listId) }) },
        })
      )
    );
    res.json({ message: 'Cards reordered' });
  } catch (err) {
    next(err);
  }
};

exports.addLabel = async (req, res, next) => {
  try {
    const cardId = Number(req.params.id);
    const { labelId } = req.body;
    await prisma.cardLabel.upsert({
      where: { cardId_labelId: { cardId, labelId: Number(labelId) } },
      create: { cardId, labelId: Number(labelId) },
      update: {},
    });
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklistItems: { orderBy: { order: 'asc' } },
      },
    });
    res.json(card);
  } catch (err) {
    next(err);
  }
};

exports.removeLabel = async (req, res, next) => {
  try {
    const cardId = Number(req.params.id);
    const labelId = Number(req.params.labelId);
    await prisma.cardLabel.delete({
      where: { cardId_labelId: { cardId, labelId } },
    });
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklistItems: { orderBy: { order: 'asc' } },
      },
    });
    res.json(card);
  } catch (err) {
    next(err);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const cardId = Number(req.params.id);
    const { memberId } = req.body;
    await prisma.cardMember.upsert({
      where: { cardId_memberId: { cardId, memberId: Number(memberId) } },
      create: { cardId, memberId: Number(memberId) },
      update: {},
    });
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklistItems: { orderBy: { order: 'asc' } },
      },
    });
    res.json(card);
  } catch (err) {
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const cardId = Number(req.params.id);
    const memberId = Number(req.params.memberId);
    await prisma.cardMember.delete({
      where: { cardId_memberId: { cardId, memberId } },
    });
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklistItems: { orderBy: { order: 'asc' } },
      },
    });
    res.json(card);
  } catch (err) {
    next(err);
  }
};

exports.addChecklistItem = async (req, res, next) => {
  try {
    const cardId = Number(req.params.id);
    const { content } = req.body;
    const maxOrder = await prisma.checklistItem.aggregate({
      _max: { order: true },
      where: { cardId },
    });
    const order = (maxOrder._max.order ?? -1) + 1;
    const item = await prisma.checklistItem.create({
      data: { content, cardId, order },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateChecklistItem = async (req, res, next) => {
  try {
    const { content, completed } = req.body;
    const item = await prisma.checklistItem.update({
      where: { id: Number(req.params.itemId) },
      data: {
        ...(content !== undefined && { content }),
        ...(completed !== undefined && { completed }),
      },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.deleteChecklistItem = async (req, res, next) => {
  try {
    await prisma.checklistItem.delete({ where: { id: Number(req.params.itemId) } });
    res.json({ message: 'Checklist item deleted' });
  } catch (err) {
    next(err);
  }
};

exports.searchCards = async (req, res, next) => {
  try {
    const { q, labels, members, dueDate, boardId } = req.query;
    const where = {};

    if (q) {
      where.title = { contains: q };
    }

    if (boardId) {
      where.list = { boardId: Number(boardId) };
    }

    if (labels) {
      const labelIds = labels.split(',').map(Number);
      where.labels = { some: { labelId: { in: labelIds } } };
    }

    if (members) {
      const memberIds = members.split(',').map(Number);
      where.members = { some: { memberId: { in: memberIds } } };
    }

    if (dueDate) {
      const date = new Date(dueDate);
      where.dueDate = { lte: date };
    }

    const cards = await prisma.card.findMany({
      where,
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        checklistItems: { orderBy: { order: 'asc' } },
        list: { include: { board: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(cards);
  } catch (err) {
    next(err);
  }
};

exports.getLabels = async (req, res, next) => {
  try {
    const labels = await prisma.label.findMany();
    res.json(labels);
  } catch (err) {
    next(err);
  }
};
