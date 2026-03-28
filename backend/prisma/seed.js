const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const labels = await Promise.all([
    prisma.label.create({ data: { name: 'Bug', color: '#EB5A46' } }),
    prisma.label.create({ data: { name: 'Feature', color: '#61BD4F' } }),
    prisma.label.create({ data: { name: 'Enhancement', color: '#0079BF' } }),
    prisma.label.create({ data: { name: 'Documentation', color: '#FF9F1A' } }),
    prisma.label.create({ data: { name: 'Critical', color: '#C377E0' } }),
  ]);

  const members = await Promise.all([
    prisma.member.create({ data: { name: 'Alice Johnson', avatar: '#E74C3C' } }),
    prisma.member.create({ data: { name: 'Bob Smith', avatar: '#3498DB' } }),
    prisma.member.create({ data: { name: 'Carol White', avatar: '#2ECC71' } }),
    prisma.member.create({ data: { name: 'David Lee', avatar: '#F39C12' } }),
  ]);

  const board = await prisma.board.create({
    data: {
      title: 'SDE Intern Project',
      description: 'Kanban board for the SDE intern assignment',
      color: '#0079BF',
    },
  });

  const todoList = await prisma.list.create({
    data: { title: 'To Do', boardId: board.id, order: 0 },
  });
  const inProgressList = await prisma.list.create({
    data: { title: 'In Progress', boardId: board.id, order: 1 },
  });
  const reviewList = await prisma.list.create({
    data: { title: 'In Review', boardId: board.id, order: 2 },
  });
  const doneList = await prisma.list.create({
    data: { title: 'Done', boardId: board.id, order: 3 },
  });

  const card1 = await prisma.card.create({
    data: {
      title: 'Setup project structure',
      description: 'Initialize the monorepo with backend and frontend directories.',
      listId: doneList.id,
      order: 0,
      dueDate: new Date('2024-01-15'),
    },
  });
  await prisma.cardLabel.create({ data: { cardId: card1.id, labelId: labels[1].id } });
  await prisma.cardMember.create({ data: { cardId: card1.id, memberId: members[0].id } });
  await prisma.checklistItem.createMany({
    data: [
      { content: 'Create backend folder', completed: true, cardId: card1.id, order: 0 },
      { content: 'Create frontend folder', completed: true, cardId: card1.id, order: 1 },
      { content: 'Initialize git repository', completed: true, cardId: card1.id, order: 2 },
    ],
  });

  const card2 = await prisma.card.create({
    data: {
      title: 'Design database schema',
      description: 'Create Prisma schema with all required models.',
      listId: doneList.id,
      order: 1,
      dueDate: new Date('2024-01-20'),
    },
  });
  await prisma.cardLabel.create({ data: { cardId: card2.id, labelId: labels[2].id } });
  await prisma.cardMember.create({ data: { cardId: card2.id, memberId: members[1].id } });

  const card3 = await prisma.card.create({
    data: {
      title: 'Implement REST API endpoints',
      description: 'Build all CRUD endpoints for boards, lists, and cards.',
      listId: inProgressList.id,
      order: 0,
      dueDate: new Date('2025-02-01'),
    },
  });
  await prisma.cardLabel.create({ data: { cardId: card3.id, labelId: labels[1].id } });
  await prisma.cardLabel.create({ data: { cardId: card3.id, labelId: labels[2].id } });
  await prisma.cardMember.create({ data: { cardId: card3.id, memberId: members[0].id } });
  await prisma.cardMember.create({ data: { cardId: card3.id, memberId: members[2].id } });
  await prisma.checklistItem.createMany({
    data: [
      { content: 'Boards CRUD', completed: true, cardId: card3.id, order: 0 },
      { content: 'Lists CRUD', completed: true, cardId: card3.id, order: 1 },
      { content: 'Cards CRUD', completed: false, cardId: card3.id, order: 2 },
      { content: 'Search & Filter', completed: false, cardId: card3.id, order: 3 },
    ],
  });

  const card4 = await prisma.card.create({
    data: {
      title: 'Build React frontend',
      description: 'Create the Trello-like UI with React and Tailwind CSS.',
      listId: inProgressList.id,
      order: 1,
      dueDate: new Date('2025-02-15'),
    },
  });
  await prisma.cardLabel.create({ data: { cardId: card4.id, labelId: labels[1].id } });
  await prisma.cardMember.create({ data: { cardId: card4.id, memberId: members[1].id } });
  await prisma.cardMember.create({ data: { cardId: card4.id, memberId: members[3].id } });

  const card5 = await prisma.card.create({
    data: {
      title: 'Implement drag-and-drop',
      description: 'Use dnd-kit to implement smooth drag-and-drop for lists and cards.',
      listId: reviewList.id,
      order: 0,
      dueDate: new Date('2025-02-20'),
    },
  });
  await prisma.cardLabel.create({ data: { cardId: card5.id, labelId: labels[2].id } });
  await prisma.cardMember.create({ data: { cardId: card5.id, memberId: members[0].id } });

  const card6 = await prisma.card.create({
    data: {
      title: 'Fix login bug',
      description: 'Users are getting logged out unexpectedly.',
      listId: todoList.id,
      order: 0,
      dueDate: new Date('2025-01-25'),
    },
  });
  await prisma.cardLabel.create({ data: { cardId: card6.id, labelId: labels[0].id } });
  await prisma.cardLabel.create({ data: { cardId: card6.id, labelId: labels[4].id } });
  await prisma.cardMember.create({ data: { cardId: card6.id, memberId: members[2].id } });

  const card7 = await prisma.card.create({
    data: {
      title: 'Write API documentation',
      description: 'Document all API endpoints with examples.',
      listId: todoList.id,
      order: 1,
    },
  });
  await prisma.cardLabel.create({ data: { cardId: card7.id, labelId: labels[3].id } });
  await prisma.cardMember.create({ data: { cardId: card7.id, memberId: members[3].id } });

  const card8 = await prisma.card.create({
    data: {
      title: 'Performance optimization',
      description: 'Add caching and optimize database queries.',
      listId: todoList.id,
      order: 2,
      dueDate: new Date('2025-03-01'),
    },
  });
  await prisma.cardLabel.create({ data: { cardId: card8.id, labelId: labels[2].id } });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
