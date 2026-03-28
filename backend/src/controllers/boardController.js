const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getBoards = async (req, res, next) => {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(boards);
  } catch (err) {
    next(err);
  }
};

exports.getBoard = async (req, res, next) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        lists: {
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
        },
      },
    });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json(board);
  } catch (err) {
    next(err);
  }
};

exports.createBoard = async (req, res, next) => {
  try {
    const { title, description, color } = req.body;
    const board = await prisma.board.create({
      data: { title, description, color },
    });
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
};

exports.updateBoard = async (req, res, next) => {
  try {
    const { title, description, color } = req.body;
    const board = await prisma.board.update({
      where: { id: Number(req.params.id) },
      data: { title, description, color },
    });
    res.json(board);
  } catch (err) {
    next(err);
  }
};

exports.deleteBoard = async (req, res, next) => {
  try {
    await prisma.board.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Board deleted' });
  } catch (err) {
    next(err);
  }
};
