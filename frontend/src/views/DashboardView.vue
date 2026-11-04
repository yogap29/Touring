<template>
  <div class="container-fluid px-4 py-4">
    <!-- Header with Month Selector -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h2 class="h3 fw-bold mb-1">Dashboard Keuangan</h2>
        <p class="text-muted mb-0">Ringkasan arus kas, kategori pengeluaran, dan anggaran bulan {{ formattedCurrentMonth }}</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <label for="monthSelect" class="form-label mb-0 fw-semibold text-nowrap">Pilih Bulan:</label>
        <input
          id="monthSelect"
          type="month"
          class="form-control form-control-sm"
          style="width: 170px;"
          v-model="selectedMonth"
          @change="fetchDashboardData"
        />
        <button class="btn btn-sm btn-outline-secondary" @click="fetchDashboardData" title="Refresh">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error:</strong> {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
    </div>

    <!-- Loading Skeleton / Spinner -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Memuat...</span>
      </div>
      <p class="mt-2 text-muted">Memuat data dashboard...</p>
    </div>

    <div v-else>
      <!-- 4 Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm border-start border-success border-4 h-100">
            <div class="card-body">
              <div class="text-muted small text-uppercase fw-semibold mb-1">Total Pemasukan</div>
              <div class="h4 fw-bold text-success mb-0">
                {{ formatCurrency(summary.totalIncome) }}
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm border-start border-danger border-4 h-100">
            <div class="card-body">
              <div class="text-muted small text-uppercase fw-semibold mb-1">Total Pengeluaran</div>
              <div class="h4 fw-bold text-danger mb-0">
                {{ formatCurrency(summary.totalExpense) }}
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div
            class="card border-0 shadow-sm border-start border-4 h-100"
            :class="summary.netCashFlow >= 0 ? 'border-primary' : 'border-warning'"
          >
            <div class="card-body">
              <div class="text-muted small text-uppercase fw-semibold mb-1">Arus Kas Bersih</div>
              <div
                class="h4 fw-bold mb-0"
                :class="summary.netCashFlow >= 0 ? 'text-primary' : 'text-warning'"
              >
                {{ formatCurrency(summary.netCashFlow) }}
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm border-start border-info border-4 h-100">
            <div class="card-body">
              <div class="text-muted small text-uppercase fw-semibold mb-1">Jumlah Transaksi</div>
              <div class="h4 fw-bold text-info mb-0">
                {{ summary.transactionCount }} Transaksi
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row g-4 mb-4">
        <!-- 6 Month Trend Chart -->
        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 border-0">
              <h5 class="card-title fw-bold mb-0">Tren 6 Bulan Terakhir</h5>
              <small class="text-muted">Perbandingan pemasukan vs pengeluaran</small>
            </div>
            <div class="card-body d-flex align-items-center justify-content-center" style="min-height: 320px;">
              <div v-if="trendChartData.labels.length > 0" class="w-100" style="height: 300px;">
                <Bar :data="trendChartData" :options="trendChartOptions" />
              </div>
              <div v-else class="text-muted py-5 text-center">
                Belum ada data tren
              </div>
            </div>
          </div>
        </div>

        <!-- Category Breakdown Doughnut -->
        <div class="col-12 col-lg-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 border-0">
              <h5 class="card-title fw-bold mb-0">Distribusi Pengeluaran</h5>
              <small class="text-muted">Proporsi berdasarkan kategori</small>
            </div>
            <div class="card-body d-flex flex-column align-items-center justify-content-center" style="min-height: 320px;">
              <div v-if="breakdown.length > 0" class="w-100" style="max-height: 250px;">
                <Doughnut :data="doughnutChartData" :options="doughnutOptions" />
              </div>
              <div v-else class="text-muted py-5 text-center">
                <i class="bi bi-pie-chart fs-1 opacity-50 d-block mb-2"></i>
                Tidak ada pengeluaran di bulan ini
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Budgets & Recent Transactions Row -->
      <div class="row g-4">
        <!-- Budget Progress Section -->
        <div class="col-12 col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-0">
              <div>
                <h5 class="card-title fw-bold mb-0">Penggunaan Anggaran</h5>
                <small class="text-muted">Bulan {{ formattedCurrentMonth }}</small>
              </div>
              <router-link to="/budgets" class="btn btn-sm btn-outline-primary">
                Kelola Anggaran
              </router-link>
            </div>
            <div class="card-body">
              <div v-if="budgets.length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-wallet2 fs-2 d-block mb-2 opacity-50"></i>
                Belum ada anggaran yang ditetapkan untuk bulan ini.
                <div class="mt-2">
                  <router-link to="/budgets" class="btn btn-sm btn-primary">
                    Buat Anggaran Sekarang
                  </router-link>
                </div>
              </div>

              <div v-else class="d-flex flex-column gap-3">
                <div v-for="b in budgets" :key="b.id" class="p-3 border rounded-3 bg-light">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <div class="d-flex align-items-center gap-2">
                      <span
                        class="d-inline-block rounded-circle"
                        :style="{ backgroundColor: b.categoryColor, width: '12px', height: '12px' }"
                      ></span>
                      <strong class="text-dark">{{ b.categoryName }}</strong>
                    </div>
                    <div>
                      <span
                        class="badge"
                        :class="b.usagePercentage > 100 ? 'bg-danger' : b.usagePercentage > 85 ? 'bg-warning text-dark' : 'bg-success'"
                      >
                        {{ b.usagePercentage }}% Terpakai
                      </span>
                    </div>
                  </div>

                  <div class="progress my-2" style="height: 8px;">
                    <div
                      class="progress-bar"
                      role="progressbar"
                      :style="{
                        width: Math.min(b.usagePercentage, 100) + '%',
                        backgroundColor: b.usagePercentage > 100 ? '#dc3545' : b.categoryColor
                      }"
                      :aria-valuenow="b.usagePercentage"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>

                  <div class="d-flex justify-content-between small text-muted">
                    <span>Terpakai: {{ formatCurrency(b.spentAmount) }} / {{ formatCurrency(b.limitAmount) }}</span>
                    <span :class="b.remainingAmount < 0 ? 'text-danger fw-bold' : ''">
                      {{ b.remainingAmount < 0 ? 'Melebihi: ' : 'Sisa: ' }}
                      {{ formatCurrency(Math.abs(b.remainingAmount)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions Section -->
        <div class="col-12 col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-0">
              <div>
                <h5 class="card-title fw-bold mb-0">Transaksi Terbaru</h5>
                <small class="text-muted">Bulan {{ formattedCurrentMonth }}</small>
              </div>
              <router-link to="/transactions" class="btn btn-sm btn-outline-primary">
                Lihat Semua
              </router-link>
            </div>
            <div class="card-body p-0">
              <div v-if="recentTransactions.length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-2 d-block mb-2 opacity-50"></i>
                Belum ada transaksi di bulan ini.
                <div class="mt-2">
                  <router-link to="/transactions" class="btn btn-sm btn-primary">
                    Tambah Transaksi
                  </router-link>
                </div>
              </div>

              <div v-else class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-3">Tanggal</th>
                      <th>Judul</th>
                      <th>Kategori</th>
                      <th class="text-end pe-3">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tx in recentTransactions" :key="tx.id">
                      <td class="ps-3 small text-muted">{{ formatDate(tx.date) }}</td>
                      <td>
                        <div class="fw-semibold">{{ tx.title }}</div>
                        <div v-if="tx.note" class="small text-muted text-truncate" style="max-width: 200px;">
                          {{ tx.note }}
                        </div>
                      </td>
                      <td>
                        <span
                          class="badge rounded-pill text-white"
                          :style="{ backgroundColor: tx.category.color }"
                        >
                          {{ tx.category.name }}
                        </span>
                      </td>
                      <td class="text-end pe-3 fw-bold" :class="tx.type === 'INCOME' ? 'text-success' : 'text-danger'">
                        {{ tx.type === 'INCOME' ? '+' : '-' }} {{ formatCurrency(tx.amount) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';
import { dashboardService } from '../api/dashboard.service';
import { budgetService } from '../api/budget.service';
import { transactionService } from '../api/transaction.service';
import { getErrorMessage } from '../api/client';
import {
  formatCurrency,
  formatDate,
  formatMonthName,
  getCurrentMonth,
} from '../utils/formatters';
import type {
  Budget,
  CategoryBreakdown,
  DashboardSummary,
  MonthlyTrend,
  Transaction,
} from '../types';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const selectedMonth = ref(getCurrentMonth());
const loading = ref(false);
const errorMessage = ref('');

const summary = ref<DashboardSummary>({
  month: getCurrentMonth(),
  totalIncome: 0,
  totalExpense: 0,
  netCashFlow: 0,
  transactionCount: 0,
});

const breakdown = ref<CategoryBreakdown[]>([]);
const trend = ref<MonthlyTrend[]>([]);
const budgets = ref<Budget[]>([]);
const recentTransactions = ref<Transaction[]>([]);

const formattedCurrentMonth = computed(() => formatMonthName(selectedMonth.value));

// Doughnut Chart Data & Options
const doughnutChartData = computed(() => {
  return {
    labels: breakdown.value.map((b) => b.categoryName),
    datasets: [
      {
        data: breakdown.value.map((b) => b.totalAmount),
        backgroundColor: breakdown.value.map((b) => b.categoryColor),
        hoverOffset: 4,
      },
    ],
  };
});

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 12,
        padding: 12,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const val = context.raw || 0;
          return ` ${context.label}: ${formatCurrency(val)}`;
        },
      },
    },
  },
};

// Trend Bar Chart Data & Options
const trendChartData = computed(() => {
  return {
    labels: trend.value.map((t) => formatMonthName(t.month)),
    datasets: [
      {
        label: 'Pemasukan',
        backgroundColor: '#10b981',
        data: trend.value.map((t) => t.income),
        borderRadius: 4,
      },
      {
        label: 'Pengeluaran',
        backgroundColor: '#ef4444',
        data: trend.value.map((t) => t.expense),
        borderRadius: 4,
      },
    ],
  };
});

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        boxWidth: 12,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => {
          if (value >= 1000000) return `${value / 1000000} Jt`;
          if (value >= 1000) return `${value / 1000} Rb`;
          return value;
        },
      },
    },
  },
};

async function fetchDashboardData() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const [summaryRes, breakdownRes, trendRes, budgetRes, txRes] = await Promise.all([
      dashboardService.getSummary(selectedMonth.value),
      dashboardService.getCategoryBreakdown(selectedMonth.value),
      dashboardService.getMonthlyTrend(6, selectedMonth.value),
      budgetService.getAll(selectedMonth.value),
      transactionService.getAll({ month: selectedMonth.value, limit: 5 }),
    ]);

    summary.value = summaryRes;
    breakdown.value = breakdownRes;
    trend.value = trendRes;
    budgets.value = budgetRes;
    recentTransactions.value = txRes.data;
  } catch (err) {
    errorMessage.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchDashboardData();
});
</script>
