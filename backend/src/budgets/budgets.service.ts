import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';
import { getCurrentMonth, getMonthRange } from '../common/utils/date.util';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(monthQuery?: string) {
    const month = monthQuery || getCurrentMonth();
    const { start, end } = getMonthRange(month);

    // Fetch all budgets for this month
    const budgets = await this.prisma.budget.findMany({
      where: { month },
      include: {
        category: true,
      },
      orderBy: {
        category: {
          name: 'asc',
        },
      },
    });

    // Fetch all expense transactions for this month to compute spending per category
    const expenseGrouped = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        type: 'EXPENSE',
        date: {
          gte: start,
          lt: end,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const spendingMap = new Map<string, number>();
    for (const group of expenseGrouped) {
      spendingMap.set(group.categoryId, group._sum.amount || 0);
    }

    return budgets.map((b) => {
      const spentAmount = spendingMap.get(b.categoryId) || 0;
      const remainingAmount = b.limitAmount - spentAmount;
      const usagePercentage =
        b.limitAmount > 0
          ? Math.round((spentAmount / b.limitAmount) * 1000) / 10
          : 0;

      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        categoryColor: b.category.color,
        month: b.month,
        limitAmount: b.limitAmount,
        spentAmount,
        remainingAmount,
        usagePercentage,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });
  }

  async upsert(dto: UpsertBudgetDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Kategori dengan ID "${dto.categoryId}" tidak ditemukan`);
    }

    if (category.type !== 'EXPENSE') {
      throw new BadRequestException('Hanya kategori pengeluaran (EXPENSE) yang dapat memiliki anggaran');
    }

    const budget = await this.prisma.budget.upsert({
      where: {
        categoryId_month: {
          categoryId: dto.categoryId,
          month: dto.month,
        },
      },
      update: {
        limitAmount: dto.limitAmount,
      },
      create: {
        categoryId: dto.categoryId,
        month: dto.month,
        limitAmount: dto.limitAmount,
      },
      include: {
        category: true,
      },
    });

    // Calculate spent amount for response
    const { start, end } = getMonthRange(dto.month);
    const sumResult = await this.prisma.transaction.aggregate({
      where: {
        categoryId: dto.categoryId,
        type: 'EXPENSE',
        date: {
          gte: start,
          lt: end,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const spentAmount = sumResult._sum.amount || 0;
    const remainingAmount = budget.limitAmount - spentAmount;
    const usagePercentage =
      budget.limitAmount > 0
        ? Math.round((spentAmount / budget.limitAmount) * 1000) / 10
        : 0;

    return {
      id: budget.id,
      categoryId: budget.categoryId,
      categoryName: budget.category.name,
      categoryColor: budget.category.color,
      month: budget.month,
      limitAmount: budget.limitAmount,
      spentAmount,
      remainingAmount,
      usagePercentage,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  }

  async remove(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!budget) {
      throw new NotFoundException(`Anggaran dengan ID "${id}" tidak ditemukan`);
    }

    await this.prisma.budget.delete({
      where: { id },
    });

    return { message: `Anggaran untuk "${budget.category.name}" berhasil dihapus` };
  }
}
