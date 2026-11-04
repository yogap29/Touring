import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  findAll(@Query() query: QueryBudgetDto) {
    return this.budgetsService.findAll(query.month);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  upsert(@Body() dto: UpsertBudgetDto) {
    return this.budgetsService.upsert(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }
}
