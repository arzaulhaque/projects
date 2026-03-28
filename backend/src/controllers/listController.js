const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLists = async (req, res, next) => {
  try {
    const lists = await prisma.list.findMany({
      where: { boardId: Number(req.params.boardId) },
      orderBy: { order: 'asc' },
      include: {
        cards: {
          orderBy: { order: 'asc' },
          include: {
            labels: { include: { label: true } },
            members: { include: { member: true } },
            checklistItems: { orderBy: { order: 'asc' } },
          },
        },
      },
    });
    res.json(lists);
  } catch (err) {
    next(err);
  }
};

exports.createList = async (req, res, next) => {
  try {
    const { title } = req.body;
    const boardId = Number(req.params.boardId);
    const maxOrder = await prisma.list.aggregate({
      _max: { order: true },
      where: { boardId },
    });
    const order = (maxOrder._max.order ?? -1) + 1;
    const list = await prisma.list.create({
      data: { title, boardId, order },
      include: { cards: true },
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
};

exports.updateList = async (req, res, next) => {
  try {
    const { title } = req.body;
    const list = await prisma.list.update({
      where: { id: Number(req.params.id) },
      data: { title },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.deleteList = async (req, res, next) => {
  try {
    await prisma.list.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'List deleted' });
  } catch (err) {
    next(err);
  }
};

exports.reorderLists = async (req, res, next) => {
  try {
    const { lists } = req.body;
    await Promise.all(
      lists.map(({ id, order }) =>
        prisma.list.update({ where: { id }, data: { order } })
      )
    );
    res.json({ message: 'Lists reordered' });
  } catch (err) {
    next(err);
  }
};
