import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  getCurrentMonth,
  getLastNMonths,
  getMonthRange,
} from '../common/utils/date.util';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(monthQuery?: string) {
    const month = monthQuery || getCurrentMonth();
    const { start, end } = getMonthRange(month);

    const [incomeResult, expenseResult, countResult] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          type: 'INCOME',
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          type: 'EXPENSE',
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({
        where: {
          date: { gte: start, lt: end },
        },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = expenseResult._sum.amount || 0;
    const netCashFlow = totalIncome - totalExpense;

    return {
      month,
      totalIncome,
      totalExpense,
      netCashFlow,
      transactionCount: countResult,
    };
  }

  async getCategoryBreakdown(monthQuery?: string) {
    const month = monthQuery || getCurrentMonth();
    const { start, end } = getMonthRange(month);

    const grouped = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        type: 'EXPENSE',
        date: { gte: start, lt: end },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const categoryIds = grouped.map((g) => g.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const totalExpense = grouped.reduce(
      (sum, item) => sum + (item._sum.amount || 0),
      0,
    );

    return grouped.map((item) => {
      const cat = categoryMap.get(item.categoryId);
      const totalAmount = item._sum.amount || 0;
      const percentage =
        totalExpense > 0
          ? Math.round((totalAmount / totalExpense) * 1000) / 10
          : 0;

      return {
        categoryId: item.categoryId,
        categoryName: cat?.name || 'Lainnya',
        categoryColor: cat?.color || '#94a3b8',
        totalAmount,
        percentage,
      };
    });
  }

  async getMonthlyTrend(monthsCount = 6, toMonth?: string) {
    const months = getLastNMonths(monthsCount, toMonth);
    const results = await Promise.all(
      months.map(async (month) => {
        const { start, end } = getMonthRange(month);
        const [incomeAgg, expenseAgg] = await Promise.all([
          this.prisma.transaction.aggregate({
            where: {
              type: 'INCOME',
              date: { gte: start, lt: end },
            },
            _sum: { amount: true },
          }),
          this.prisma.transaction.aggregate({
            where: {
              type: 'EXPENSE',
              date: { gte: start, lt: end },
            },
            _sum: { amount: true },
          }),
        ]);

        const income = incomeAgg._sum.amount || 0;
        const expense = expenseAgg._sum.amount || 0;
        const netCashFlow = income - expense;

        return {
          month,
          income,
          expense,
          netCashFlow,
        };
      }),
    );

    return results;
  }
}
