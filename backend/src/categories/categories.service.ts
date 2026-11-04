import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(type?: string) {
    const where: any = {};
    if (type) {
      const upper = type.toUpperCase();
      if (upper === 'INCOME' || upper === 'EXPENSE') {
        where.type = upper;
      }
    }

    return this.prisma.category.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Kategori dengan ID "${id}" tidak ditemukan`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const trimmedName = dto.name.trim();

    // Check duplicate
    const existing = await this.prisma.category.findUnique({
      where: {
        name_type: {
          name: trimmedName,
          type: dto.type,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Kategori "${trimmedName}" dengan tipe ${dto.type} sudah ada`,
      );
    }

    return this.prisma.category.create({
      data: {
        name: trimmedName,
        type: dto.type,
        color: dto.color || (dto.type === 'INCOME' ? '#10b981' : '#ef4444'),
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    const trimmedName = dto.name !== undefined ? dto.name.trim() : undefined;

    if (trimmedName && trimmedName !== category.name) {
      const duplicate = await this.prisma.category.findUnique({
        where: {
          name_type: {
            name: trimmedName,
            type: category.type,
          },
        },
      });

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          `Kategori "${trimmedName}" dengan tipe ${category.type} sudah ada`,
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: trimmedName ?? category.name,
        color: dto.color ?? category.color,
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    const transactionCount = await this.prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionCount > 0) {
      throw new BadRequestException(
        `Kategori "${category.name}" tidak dapat dihapus karena masih digunakan oleh ${transactionCount} transaksi`,
      );
    }

    const budgetCount = await this.prisma.budget.count({
      where: { categoryId: id },
    });

    if (budgetCount > 0) {
      throw new BadRequestException(
        `Kategori "${category.name}" tidak dapat dihapus karena masih digunakan oleh ${budgetCount} anggaran`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: `Kategori "${category.name}" berhasil dihapus` };
  }
}
