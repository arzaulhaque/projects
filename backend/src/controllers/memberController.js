const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMembers = async (req, res, next) => {
  try {
    const members = await prisma.member.findMany();
    res.json(members);
  } catch (err) {
    next(err);
  }
};

exports.createMember = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const member = await prisma.member.create({ data: { name, avatar } });
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};
