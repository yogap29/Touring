<template>
  <div class="container-fluid px-4 py-4">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h2 class="h3 fw-bold mb-1">Transaksi</h2>
        <p class="text-muted mb-0">Catat dan kelola seluruh transaksi pemasukan dan pengeluaran Anda</p>
      </div>
      <div>
        <button class="btn btn-primary d-flex align-items-center gap-2" @click="openCreateModal">
          <i class="bi bi-plus-circle"></i>
          <span>Tambah Transaksi</span>
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

    <!-- Filter Card -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-sm-6 col-md-3">
            <label class="form-label small fw-semibold text-muted">Bulan</label>
            <input
              type="month"
              class="form-control form-control-sm"
              v-model="filters.month"
              @change="onMonthChange"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <label class="form-label small fw-semibold text-muted">Tipe</label>
            <select class="form-select form-select-sm" v-model="filters.type" @change="applyFilters">
              <option value="">Semua Tipe</option>
              <option value="INCOME">Pemasukan (INCOME)</option>
              <option value="EXPENSE">Pengeluaran (EXPENSE)</option>
            </select>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <label class="form-label small fw-semibold text-muted">Kategori</label>
            <select class="form-select form-select-sm" v-model="filters.categoryId" @change="applyFilters">
              <option value="">Semua Kategori</option>
              <option v-for="cat in filteredFilterCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }} ({{ cat.type }})
              </option>
            </select>
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <label class="form-label small fw-semibold text-muted">Dari Tanggal</label>
            <input
              type="date"
              class="form-control form-control-sm"
              v-model="filters.from"
              @change="onDateRangeChange"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-2">
            <div class="d-flex gap-2">
              <div class="flex-grow-1">
                <label class="form-label small fw-semibold text-muted">Sampai Tanggal</label>
                <input
                  type="date"
                  class="form-control form-control-sm"
                  v-model="filters.to"
                  @change="onDateRangeChange"
                />
              </div>
              <button
                class="btn btn-sm btn-outline-secondary align-self-end"
                @click="resetFilters"
                title="Reset Filter"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions Table Card -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat...</span>
          </div>
          <p class="mt-2 text-muted">Memuat daftar transaksi...</p>
        </div>

        <div v-else-if="transactions.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
          Tidak ada transaksi yang cocok dengan filter yang dipilih.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Tanggal</th>
                <th>Judul & Catatan</th>
                <th>Tipe</th>
                <th>Kategori</th>
                <th class="text-end">Nominal</th>
                <th class="text-end pe-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in transactions" :key="tx.id">
                <td class="ps-4 text-nowrap">
                  <div class="fw-semibold">{{ formatDate(tx.date) }}</div>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ tx.title }}</div>
                  <div v-if="tx.note" class="small text-muted text-truncate" style="max-width: 250px;">
                    {{ tx.note }}
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="tx.type === 'INCOME' ? 'bg-success' : 'bg-danger'"
                  >
                    {{ tx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran' }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge rounded-pill text-white"
                    :style="{ backgroundColor: tx.category.color }"
                  >
                    {{ tx.category.name }}
                  </span>
                </td>
                <td class="text-end fw-bold" :class="tx.type === 'INCOME' ? 'text-success' : 'text-danger'">
                  {{ tx.type === 'INCOME' ? '+' : '-' }} {{ formatCurrency(tx.amount) }}
                </td>
                <td class="text-end pe-4">
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-primary"
                      @click="openEditModal(tx)"
                      title="Edit Transaksi"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      @click="confirmDelete(tx)"
                      title="Hapus Transaksi"
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
      <div v-if="transactions.length > 0" class="card-footer bg-white py-3 border-0 d-flex justify-content-between align-items-center text-muted small">
        <span>Menampilkan {{ transactions.length }} dari {{ totalTransactions }} transaksi</span>
      </div>
    </div>

    <!-- Create / Edit Modal -->
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
              {{ isEditing ? 'Edit Transaksi' : 'Tambah Transaksi Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger py-2 small mb-3">
                {{ modalError }}
              </div>

              <!-- Transaction Type -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Tipe Transaksi <span class="text-danger">*</span></label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="typeExpense"
                      value="EXPENSE"
                      v-model="form.type"
                      @change="onFormTypeChange"
                    />
                    <label class="form-check-label text-danger fw-semibold" for="typeExpense">
                      Pengeluaran (EXPENSE)
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="typeIncome"
                      value="INCOME"
                      v-model="form.type"
                      @change="onFormTypeChange"
                    />
                    <label class="form-check-label text-success fw-semibold" for="typeIncome">
                      Pemasukan (INCOME)
                    </label>
                  </div>
                </div>
              </div>

              <!-- Title -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Judul Transaksi <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Belanja Bulanan"
                  v-model="form.title"
                  required
                />
              </div>

              <!-- Category -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Kategori <span class="text-danger">*</span></label>
                <select class="form-select" v-model="form.categoryId" required>
                  <option value="" disabled>-- Pilih Kategori --</option>
                  <option v-for="cat in formCategories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
                <div v-if="formCategories.length === 0" class="form-text text-danger">
                  Tidak ada kategori untuk tipe {{ form.type }}. Silakan buat kategori terlebih dahulu di menu Kategori.
                </div>
              </div>

              <!-- Amount -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Nominal (Rupiah) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    class="form-control"
                    placeholder="Contoh: 50000"
                    v-model.number="form.amount"
                    required
                  />
                </div>
                <div class="form-text text-muted" v-if="form.amount > 0">
                  Terbaca: {{ formatCurrency(form.amount) }}
                </div>
              </div>

              <!-- Date -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Tanggal <span class="text-danger">*</span></label>
                <input
                  type="date"
                  class="form-control"
                  v-model="form.date"
                  required
                />
              </div>

              <!-- Note -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Catatan (Opsional)</label>
                <textarea
                  class="form-control"
                  rows="2"
                  placeholder="Catatan tambahan bila diperlukan..."
                  v-model="form.note"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting || formCategories.length === 0">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEditing ? 'Simpan Perubahan' : 'Tambah Transaksi' }}
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
            <h5 class="modal-title fw-bold text-danger">Konfirmasi Hapus Transaksi</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="transactionToDelete">
            <p class="mb-1">Apakah Anda yakin ingin menghapus transaksi ini?</p>
            <div class="p-3 bg-light rounded mt-2 border">
              <div class="fw-bold">{{ transactionToDelete.title }}</div>
              <div class="text-muted small">
                Tanggal: {{ formatDate(transactionToDelete.date) }} • Nominal: {{ formatCurrency(transactionToDelete.amount) }}
              </div>
            </div>
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
import { transactionService } from '../api/transaction.service';
import { categoryService } from '../api/category.service';
import { getErrorMessage } from '../api/client';
import { formatCurrency, formatDate, getCurrentMonth } from '../utils/formatters';
import type {
  Category,
  CreateTransactionPayload,
  Transaction,
  TransactionFilter,
  TransactionType,
} from '../types';

const transactions = ref<Transaction[]>([]);
const totalTransactions = ref(0);
const allCategories = ref<Category[]>([]);
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const modalError = ref('');

const filters = reactive<TransactionFilter>({
  month: getCurrentMonth(),
  type: undefined,
  categoryId: '',
  from: '',
  to: '',
});

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  title: '',
  amount: 0,
  type: 'EXPENSE' as TransactionType,
  categoryId: '',
  date: new Date().toISOString().slice(0, 10),
  note: '',
});

const showDeleteModal = ref(false);
const transactionToDelete = ref<Transaction | null>(null);

const filteredFilterCategories = computed(() => {
  if (!filters.type) return allCategories.value;
  return allCategories.value.filter((c) => c.type === filters.type);
});

const formCategories = computed(() => {
  return allCategories.value.filter((c) => c.type === form.type);
});

function onMonthChange() {
  // If month is selected, clear custom from/to
  filters.from = '';
  filters.to = '';
  applyFilters();
}

function onDateRangeChange() {
  if (filters.from || filters.to) {
    filters.month = '';
  }
  applyFilters();
}

function resetFilters() {
  filters.month = getCurrentMonth();
  filters.type = undefined;
  filters.categoryId = '';
  filters.from = '';
  filters.to = '';
  applyFilters();
}

function onFormTypeChange() {
  // Reset categoryId if current category does not match new type
  const cat = allCategories.value.find((c) => c.id === form.categoryId);
  if (cat && cat.type !== form.type) {
    form.categoryId = '';
  }
  if (!form.categoryId && formCategories.value.length > 0) {
    form.categoryId = formCategories.value[0].id;
  }
}

async function loadCategories() {
  try {
    allCategories.value = await categoryService.getAll();
  } catch (err) {
    console.error('Failed to load categories', err);
  }
}

async function applyFilters() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const payload: TransactionFilter = {};
    if (filters.month) payload.month = filters.month;
    if (filters.type) payload.type = filters.type;
    if (filters.categoryId) payload.categoryId = filters.categoryId;
    if (filters.from) payload.from = filters.from;
    if (filters.to) payload.to = filters.to;

    const res = await transactionService.getAll(payload);
    transactions.value = res.data;
    totalTransactions.value = res.total;
  } catch (err) {
    errorMessage.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  isEditing.value = false;
  editingId.value = null;
  modalError.value = '';

  form.title = '';
  form.amount = 0;
  form.type = 'EXPENSE';
  form.date = new Date().toISOString().slice(0, 10);
  form.note = '';

  const defaultCat = allCategories.value.find((c) => c.type === 'EXPENSE');
  form.categoryId = defaultCat ? defaultCat.id : '';

  showModal.value = true;
}

function openEditModal(tx: Transaction) {
  isEditing.value = true;
  editingId.value = tx.id;
  modalError.value = '';

  form.title = tx.title;
  form.amount = tx.amount;
  form.type = tx.type;
  form.categoryId = tx.categoryId;
  form.date = new Date(tx.date).toISOString().slice(0, 10);
  form.note = tx.note || '';

  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  modalError.value = '';
}

async function handleSubmit() {
  if (form.amount <= 0) {
    modalError.value = 'Nominal harus bernilai lebih besar dari 0';
    return;
  }

  if (!form.categoryId) {
    modalError.value = 'Silakan pilih kategori';
    return;
  }

  submitting.value = true;
  modalError.value = '';

  try {
    const payload: CreateTransactionPayload = {
      title: form.title,
      amount: form.amount,
      type: form.type,
      date: form.date,
      categoryId: form.categoryId,
      note: form.note || undefined,
    };

    if (isEditing.value && editingId.value) {
      await transactionService.update(editingId.value, payload);
      successMessage.value = 'Transaksi berhasil diperbarui!';
    } else {
      await transactionService.create(payload);
      successMessage.value = 'Transaksi baru berhasil ditambahkan!';
    }

    closeModal();
    applyFilters();
  } catch (err) {
    modalError.value = getErrorMessage(err);
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(tx: Transaction) {
  transactionToDelete.value = tx;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!transactionToDelete.value) return;

  deleting.value = true;
  try {
    await transactionService.delete(transactionToDelete.value.id);
    successMessage.value = 'Transaksi berhasil dihapus!';
    showDeleteModal.value = false;
    transactionToDelete.value = null;
    applyFilters();
  } catch (err) {
    errorMessage.value = getErrorMessage(err);
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  await loadCategories();
  await applyFilters();
});
</script>
