import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // Income
  { name: 'Gaji', type: 'INCOME', color: '#10b981' },
  { name: 'Bonus', type: 'INCOME', color: '#3b82f6' },
  { name: 'Penghasilan Lain', type: 'INCOME', color: '#8b5cf6' },
  // Expense
  { name: 'Makanan', type: 'EXPENSE', color: '#ef4444' },
  { name: 'Transportasi', type: 'EXPENSE', color: '#f59e0b' },
  { name: 'Tempat Tinggal', type: 'EXPENSE', color: '#6366f1' },
  { name: 'Tagihan', type: 'EXPENSE', color: '#ec4899' },
  { name: 'Keluarga', type: 'EXPENSE', color: '#14b8a6' },
  { name: 'Langganan', type: 'EXPENSE', color: '#84cc16' },
  { name: 'Kesehatan', type: 'EXPENSE', color: '#06b6d4' },
  { name: 'Lain-lain', type: 'EXPENSE', color: '#64748b' },
];

async function main() {
  console.log('Seeding categories...');
  const categoryMap = new Map<string, string>();

  for (const cat of defaultCategories) {
    const upserted = await prisma.category.upsert({
      where: {
        name_type: {
          name: cat.name,
          type: cat.type,
        },
      },
      update: {
        color: cat.color,
      },
      create: {
        name: cat.name,
        type: cat.type,
        color: cat.color,
      },
    });
    categoryMap.set(`${cat.name}_${cat.type}`, upserted.id);
  }

  console.log('Seeding demo budgets...');
  const demoBudgets = [
    { catKey: 'Makanan_EXPENSE', month: '2026-10', limitAmount: 2500000 },
    { catKey: 'Transportasi_EXPENSE', month: '2026-10', limitAmount: 1000000 },
    { catKey: 'Tagihan_EXPENSE', month: '2026-10', limitAmount: 800000 },
    { catKey: 'Makanan_EXPENSE', month: '2026-11', limitAmount: 2500000 },
    { catKey: 'Transportasi_EXPENSE', month: '2026-11', limitAmount: 1000000 },
    { catKey: 'Kesehatan_EXPENSE', month: '2026-11', limitAmount: 500000 },
  ];

  for (const b of demoBudgets) {
    const categoryId = categoryMap.get(b.catKey);
    if (!categoryId) continue;

    await prisma.budget.upsert({
      where: {
        categoryId_month: {
          categoryId,
          month: b.month,
        },
      },
      update: {
        limitAmount: b.limitAmount,
      },
      create: {
        categoryId,
        month: b.month,
        limitAmount: b.limitAmount,
      },
    });
  }

  console.log('Seeding demo transactions...');
  const demoTransactions = [
    {
      title: '[DEMO] Gaji bulanan Oktober',
      amount: 8500000,
      type: 'INCOME',
      date: new Date('2026-10-01T08:00:00.000Z'),
      catKey: 'Gaji_INCOME',
      note: 'Gaji pokok bulan Oktober',
    },
    {
      title: '[DEMO] Belanja bulanan & sembako',
      amount: 1250000,
      type: 'EXPENSE',
      date: new Date('2026-10-05T10:30:00.000Z'),
      catKey: 'Makanan_EXPENSE',
      note: 'Supermarket mingguan',
    },
    {
      title: '[DEMO] Bensin & tol mingguan',
      amount: 350000,
      type: 'EXPENSE',
      date: new Date('2026-10-08T07:15:00.000Z'),
      catKey: 'Transportasi_EXPENSE',
      note: 'Bensin Shell dan e-toll',
    },
    {
      title: '[DEMO] Listrik & air rumah',
      amount: 650000,
      type: 'EXPENSE',
      date: new Date('2026-10-10T14:00:00.000Z'),
      catKey: 'Tagihan_EXPENSE',
      note: 'Tagihan PLN dan PDAM',
    },
    {
      title: '[DEMO] Sewa apartemen',
      amount: 2500000,
      type: 'EXPENSE',
      date: new Date('2026-10-12T09:00:00.000Z'),
      catKey: 'Tempat Tinggal_EXPENSE',
      note: 'Sewa bulanan',
    },
    {
      title: '[DEMO] Langganan Spotify & Netflix',
      amount: 185000,
      type: 'EXPENSE',
      date: new Date('2026-10-15T18:20:00.000Z'),
      catKey: 'Langganan_EXPENSE',
      note: 'Paket keluarga',
    },
    {
      title: '[DEMO] Gaji bulanan November',
      amount: 8500000,
      type: 'INCOME',
      date: new Date('2026-11-01T08:00:00.000Z'),
      catKey: 'Gaji_INCOME',
      note: 'Gaji pokok bulan November',
    },
    {
      title: '[DEMO] Bonus pencapaian target',
      amount: 2000000,
      type: 'INCOME',
      date: new Date('2026-11-02T11:00:00.000Z'),
      catKey: 'Bonus_INCOME',
      note: 'Bonus KPI',
    },
    {
      title: '[DEMO] Makan malam keluarga',
      amount: 450000,
      type: 'EXPENSE',
      date: new Date('2026-11-03T19:30:00.000Z'),
      catKey: 'Makanan_EXPENSE',
      note: 'Restoran Sunda',
    },
    {
      title: '[DEMO] Servis motor berkala',
      amount: 280000,
      type: 'EXPENSE',
      date: new Date('2026-11-04T10:00:00.000Z'),
      catKey: 'Transportasi_EXPENSE',
      note: 'Ganti oli dan kampas rem',
    },
    {
      title: '[DEMO] Obat dan multivitamin',
      amount: 150000,
      type: 'EXPENSE',
      date: new Date('2026-11-04T13:45:00.000Z'),
      catKey: 'Kesehatan_EXPENSE',
      note: 'Apotek',
    },
  ];

  for (const tx of demoTransactions) {
    const categoryId = categoryMap.get(tx.catKey);
    if (!categoryId) continue;

    // Check if duplicate already exists
    const existing = await prisma.transaction.findFirst({
      where: {
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        categoryId,
        date: tx.date,
      },
    });

    if (!existing) {
      await prisma.transaction.create({
        data: {
          title: tx.title,
          amount: tx.amount,
          type: tx.type,
          categoryId,
          date: tx.date,
          note: tx.note,
        },
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
