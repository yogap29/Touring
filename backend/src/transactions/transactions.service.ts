import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { getMonthRange } from '../common/utils/date.util';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateCategory(categoryId: string, type: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Kategori dengan ID "${categoryId}" tidak ditemukan`);
    }

    if (category.type !== type) {
      throw new BadRequestException(
        `Tipe kategori "${category.name}" (${category.type}) tidak sesuai dengan tipe transaksi (${type})`,
      );
    }

    return category;
  }

  async create(dto: CreateTransactionDto) {
    await this.validateCategory(dto.categoryId, dto.type);

    const txDate = new Date(dto.date);
    if (isNaN(txDate.getTime())) {
      throw new BadRequestException('Format tanggal tidak valid');
    }

    return this.prisma.transaction.create({
      data: {
        title: dto.title.trim(),
        amount: dto.amount,
        type: dto.type,
        date: txDate,
        categoryId: dto.categoryId,
        note: dto.note?.trim() || null,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(query: QueryTransactionDto) {
    const where: any = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    // Month filter or explicit from/to filter
    if (query.month) {
      const { start, end } = getMonthRange(query.month);
      where.date = {
        gte: start,
        lt: end,
      };
    } else if (query.from || query.to) {
      where.date = {};
      if (query.from) {
        const fromDate = new Date(query.from);
        if (!isNaN(fromDate.getTime())) {
          where.date.gte = fromDate;
        }
      }
      if (query.to) {
        const toDate = new Date(query.to);
        if (!isNaN(toDate.getTime())) {
          // If YYYY-MM-DD was provided, include the whole day
          if (query.to.length === 10) {
            toDate.setUTCHours(23, 59, 59, 999);
          }
          where.date.lte = toDate;
        }
      }
    }

    const total = await this.prisma.transaction.count({ where });

    let transactions;
    if (query.page && query.limit) {
      const skip = (query.page - 1) * query.limit;
      transactions = await this.prisma.transaction.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
        include: {
          category: true,
        },
      });
    } else {
      transactions = await this.prisma.transaction.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
          category: true,
        },
      });
    }

    return {
      data: transactions,
      total,
      page: query.page || 1,
      limit: query.limit || total,
    };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan ID "${id}" tidak ditemukan`);
    }

    return transaction;
  }

  async update(id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(id);

    const targetType = dto.type || existing.type;
    const targetCategoryId = dto.categoryId || existing.categoryId;

    if (dto.type || dto.categoryId) {
      await this.validateCategory(targetCategoryId, targetType);
    }

    let parsedDate: Date | undefined = undefined;
    if (dto.date) {
      parsedDate = new Date(dto.date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Format tanggal tidak valid');
      }
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : existing.title,
        amount: dto.amount !== undefined ? dto.amount : existing.amount,
        type: targetType,
        categoryId: targetCategoryId,
        date: parsedDate ?? existing.date,
        note: dto.note !== undefined ? (dto.note?.trim() || null) : existing.note,
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.transaction.delete({
      where: { id },
    });
    return { message: 'Transaksi berhasil dihapus' };
  }
}
