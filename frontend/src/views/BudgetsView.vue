<template>
  <div class="container-fluid px-4 py-4">
    <!-- Header with Month Selector -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h2 class="h3 fw-bold mb-1">Anggaran Bulanan</h2>
        <p class="text-muted mb-0">Rencanakan dan batasi pengeluaran per kategori untuk bulan {{ formattedCurrentMonth }}</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <label for="budgetMonth" class="form-label mb-0 fw-semibold text-nowrap">Pilih Bulan:</label>
        <input
          id="budgetMonth"
          type="month"
          class="form-control form-control-sm"
          style="width: 170px;"
          v-model="selectedMonth"
          @change="loadBudgets"
        />
        <button class="btn btn-primary btn-sm d-flex align-items-center gap-1" @click="openUpsertModal()">
          <i class="bi bi-plus-circle"></i>
          <span>Tetapkan Anggaran</span>
        </button>
      </div>
    </div>

    <!-- Alert / Messages -->
    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''" aria-label="Close"></button>
    </div>
    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
    </div>

    <!-- Overview Stats Card -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm border-start border-primary border-4 h-100">
          <div class="card-body">
            <div class="text-muted small text-uppercase fw-semibold mb-1">Total Alokasi Anggaran</div>
            <div class="h4 fw-bold text-primary mb-0">
              {{ formatCurrency(totalBudgetLimit) }}
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm border-start border-danger border-4 h-100">
          <div class="card-body">
            <div class="text-muted small text-uppercase fw-semibold mb-1">Total Realisasi Pengeluaran</div>
            <div class="h4 fw-bold text-danger mb-0">
              {{ formatCurrency(totalBudgetSpent) }}
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div
          class="card border-0 shadow-sm border-start border-4 h-100"
          :class="totalBudgetRemaining >= 0 ? 'border-success' : 'border-danger'"
        >
          <div class="card-body">
            <div class="text-muted small text-uppercase fw-semibold mb-1">Total Sisa Anggaran</div>
            <div
              class="h4 fw-bold mb-0"
              :class="totalBudgetRemaining >= 0 ? 'text-success' : 'text-danger'"
            >
              {{ totalBudgetRemaining < 0 ? '-' : '' }}{{ formatCurrency(Math.abs(totalBudgetRemaining)) }}
              <span v-if="totalBudgetRemaining < 0" class="badge bg-danger ms-2 fs-6">Over Budget</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Memuat...</span>
      </div>
      <p class="mt-2 text-muted">Memuat data anggaran...</p>
    </div>

    <!-- Budgets List -->
    <div v-else class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div v-if="budgets.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-wallet2 fs-1 d-block mb-2 opacity-50"></i>
          Belum ada anggaran yang ditetapkan untuk bulan {{ formattedCurrentMonth }}.
          <div class="mt-3">
            <button class="btn btn-primary" @click="openUpsertModal()">
              Tetapkan Anggaran Sekarang
            </button>
          </div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Kategori Pengeluaran</th>
                <th>Batas Anggaran</th>
                <th>Realisasi Terpakai</th>
                <th>Sisa Anggaran</th>
                <th style="min-width: 200px;">Progress Utilisasi</th>
                <th class="text-end pe-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in budgets" :key="b.id">
                <td class="ps-4">
                  <div class="d-flex align-items-center gap-2">
                    <span
                      class="d-inline-block rounded-circle"
                      :style="{ backgroundColor: b.categoryColor, width: '12px', height: '12px' }"
                    ></span>
                    <strong class="text-dark">{{ b.categoryName }}</strong>
                  </div>
                </td>
                <td class="fw-semibold text-dark">
                  {{ formatCurrency(b.limitAmount) }}
                </td>
                <td class="fw-semibold text-danger">
                  {{ formatCurrency(b.spentAmount) }}
                </td>
                <td>
                  <span
                    :class="b.remainingAmount < 0 ? 'text-danger fw-bold' : 'text-success fw-semibold'"
                  >
                    {{ b.remainingAmount < 0 ? '-' : '' }}{{ formatCurrency(Math.abs(b.remainingAmount)) }}
                  </span>
                  <div v-if="b.remainingAmount < 0" class="small text-danger fw-semibold">
                    (Melebihi Anggaran!)
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 10px;">
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
                    <span
                      class="badge"
                      :class="b.usagePercentage > 100 ? 'bg-danger' : b.usagePercentage > 85 ? 'bg-warning text-dark' : 'bg-success'"
                      style="min-width: 55px;"
                    >
                      {{ b.usagePercentage }}%
                    </span>
                  </div>
                </td>
                <td class="text-end pe-4">
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-primary"
                      @click="openUpsertModal(b)"
                      title="Ubah Batas Anggaran"
                    >
                      <i class="bi bi-pencil"></i> Ubah
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      @click="confirmDelete(b)"
                      title="Hapus Anggaran"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Upsert Budget Modal -->
    <div
      class="modal fade"
      :class="{ show: showModal, 'd-block': showModal }"
      tabindex="-1"
      style="background: rgba(0,0,0,0.5);"
      v-if="showModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Ubah Anggaran' : 'Tetapkan Anggaran Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger py-2 small mb-3">
                {{ modalError }}
              </div>

              <!-- Month -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Bulan Anggaran <span class="text-danger">*</span></label>
                <input
                  type="month"
                  class="form-control"
                  v-model="form.month"
                  required
                />
              </div>

              <!-- Category -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Kategori Pengeluaran <span class="text-danger">*</span></label>
                <select class="form-select" v-model="form.categoryId" :disabled="isEditing" required>
                  <option value="" disabled>-- Pilih Kategori Pengeluaran --</option>
                  <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
                <div v-if="expenseCategories.length === 0" class="form-text text-danger">
                  Belum ada kategori pengeluaran. Buat kategori tipe EXPENSE terlebih dahulu.
                </div>
              </div>

              <!-- Limit Amount -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Batas Anggaran Bulanan (Rupiah) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    class="form-control"
                    placeholder="Contoh: 1500000"
                    v-model.number="form.limitAmount"
                    required
                  />
                </div>
                <div class="form-text text-muted" v-if="form.limitAmount > 0">
                  Terbaca: {{ formatCurrency(form.limitAmount) }}
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting || expenseCategories.length === 0">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                Simpan Anggaran
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      :class="{ show: showDeleteModal, 'd-block': showDeleteModal }"
      tabindex="-1"
      style="background: rgba(0,0,0,0.5);"
      v-if="showDeleteModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header">
            <h5 class="modal-title fw-bold text-danger">Hapus Anggaran</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="budgetToDelete">
            <p class="mb-0">
              Apakah Anda yakin ingin menghapus anggaran untuk kategori <strong>{{ budgetToDelete.categoryName }}</strong> pada bulan {{ formatMonthName(budgetToDelete.month) }}?
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Batal</button>
            <button type="button" class="btn btn-danger" @click="handleDelete" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { budgetService } from '../api/budget.service';
import { categoryService } from '../api/category.service';
import { getErrorMessage } from '../api/client';
import { formatCurrency, formatMonthName, getCurrentMonth } from '../utils/formatters';
import type { Budget, Category, UpsertBudgetPayload } from '../types';

const selectedMonth = ref(getCurrentMonth());
const budgets = ref<Budget[]>([]);
const expenseCategories = ref<Category[]>([]);
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const modalError = ref('');

const showModal = ref(false);
const isEditing = ref(false);

const form = reactive({
  categoryId: '',
  month: getCurrentMonth(),
  limitAmount: 0,
});

const showDeleteModal = ref(false);
const budgetToDelete = ref<Budget | null>(null);

const formattedCurrentMonth = computed(() => formatMonthName(selectedMonth.value));

const totalBudgetLimit = computed(() => {
  return budgets.value.reduce((sum, b) => sum + b.limitAmount, 0);
});

const totalBudgetSpent = computed(() => {
  return budgets.value.reduce((sum, b) => sum + b.spentAmount, 0);
});

const totalBudgetRemaining = computed(() => {
  return totalBudgetLimit.value - totalBudgetSpent.value;
});

async function loadExpenseCategories() {
  try {
    expenseCategories.value = await categoryService.getAll('EXPENSE');
  } catch (err) {
    console.error('Failed to load expense categories', err);
  }
}

async function loadBudgets() {
  loading.value = true;
  errorMessage.value = '';

  try {
    budgets.value = await budgetService.getAll(selectedMonth.value);
  } catch (err) {
    errorMessage.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

function openUpsertModal(existing?: Budget) {
  modalError.value = '';

  if (existing) {
    isEditing.value = true;
    form.categoryId = existing.categoryId;
    form.month = existing.month;
    form.limitAmount = existing.limitAmount;
  } else {
    isEditing.value = false;
    form.month = selectedMonth.value;
    form.limitAmount = 0;
    // Preselect first expense category without a budget if possible
    const existingCatIds = new Set(budgets.value.map((b) => b.categoryId));
    const available = expenseCategories.value.find((c) => !existingCatIds.has(c.id));
    form.categoryId = available ? available.id : (expenseCategories.value[0]?.id || '');
  }

  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  modalError.value = '';
}

async function handleSubmit() {
  if (form.limitAmount <= 0) {
    modalError.value = 'Batas anggaran harus lebih besar dari 0';
    return;
  }

  if (!form.categoryId) {
    modalError.value = 'Silakan pilih kategori';
    return;
  }

  submitting.value = true;
  modalError.value = '';

  try {
    const payload: UpsertBudgetPayload = {
      categoryId: form.categoryId,
      month: form.month,
      limitAmount: form.limitAmount,
    };

    await budgetService.upsert(payload);
    successMessage.value = 'Anggaran berhasil disimpan!';
    closeModal();
    selectedMonth.value = form.month;
    loadBudgets();
  } catch (err) {
    modalError.value = getErrorMessage(err);
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(b: Budget) {
  budgetToDelete.value = b;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!budgetToDelete.value) return;

  deleting.value = true;
  try {
    const res = await budgetService.delete(budgetToDelete.value.id);
    successMessage.value = res.message || 'Anggaran berhasil dihapus!';
    showDeleteModal.value = false;
    budgetToDelete.value = null;
    loadBudgets();
  } catch (err) {
    errorMessage.value = getErrorMessage(err);
    showDeleteModal.value = false;
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  await loadExpenseCategories();
  await loadBudgets();
});
</script>
