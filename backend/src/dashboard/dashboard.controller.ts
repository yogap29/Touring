import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  DashboardSummaryQueryDto,
  DashboardTrendQueryDto,
} from './dto/dashboard-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Query() query: DashboardSummaryQueryDto) {
    return this.dashboardService.getSummary(query.month);
  }

  @Get('category-breakdown')
  getCategoryBreakdown(@Query() query: DashboardSummaryQueryDto) {
    return this.dashboardService.getCategoryBreakdown(query.month);
  }

  @Get('monthly-trend')
  getMonthlyTrend(@Query() query: DashboardTrendQueryDto) {
    return this.dashboardService.getMonthlyTrend(query.months, query.toMonth);
  }
}
