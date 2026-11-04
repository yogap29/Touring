<template>
  <div class="container-fluid px-4 py-4">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h2 class="h3 fw-bold mb-1">Kategori</h2>
        <p class="text-muted mb-0">Kelola kategori untuk memilah pemasukan dan pengeluaran Anda</p>
      </div>
      <div>
        <button class="btn btn-primary d-flex align-items-center gap-2" @click="openCreateModal">
          <i class="bi bi-plus-circle"></i>
          <span>Tambah Kategori</span>
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

    <!-- Filter Buttons -->
    <div class="d-flex gap-2 mb-4">
      <button
        class="btn btn-sm"
        :class="filterType === '' ? 'btn-dark' : 'btn-outline-secondary'"
        @click="filterType = ''; loadCategories()"
      >
        Semua Kategori ({{ categories.length }})
      </button>
      <button
        class="btn btn-sm"
        :class="filterType === 'EXPENSE' ? 'btn-danger' : 'btn-outline-danger'"
        @click="filterType = 'EXPENSE'; loadCategories()"
      >
        Pengeluaran (EXPENSE)
      </button>
      <button
        class="btn btn-sm"
        :class="filterType === 'INCOME' ? 'btn-success' : 'btn-outline-success'"
        @click="filterType = 'INCOME'; loadCategories()"
      >
        Pemasukan (INCOME)
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Memuat...</span>
      </div>
      <p class="mt-2 text-muted">Memuat daftar kategori...</p>
    </div>

    <!-- Category Grid / List -->
    <div v-else class="row g-3">
      <div v-if="categories.length === 0" class="col-12 text-center py-5 text-muted">
        <i class="bi bi-tags fs-1 d-block mb-2 opacity-50"></i>
        Belum ada kategori untuk filter ini.
      </div>

      <div v-for="cat in categories" :key="cat.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex align-items-center gap-2">
                <span
                  class="d-inline-block rounded-circle"
                  :style="{ backgroundColor: cat.color, width: '16px', height: '16px' }"
                ></span>
                <h6 class="card-title fw-bold mb-0 text-dark">{{ cat.name }}</h6>
              </div>
              <span
                class="badge"
                :class="cat.type === 'INCOME' ? 'bg-success' : 'bg-danger'"
              >
                {{ cat.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran' }}
              </span>
            </div>

            <div class="small text-muted mb-3">
              <div>
                <i class="bi bi-receipt me-1"></i>
                {{ cat._count?.transactions || 0 }} Transaksi terkait
              </div>
              <div v-if="cat.type === 'EXPENSE'">
                <i class="bi bi-wallet2 me-1"></i>
                {{ cat._count?.budgets || 0 }} Anggaran terkait
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 border-top pt-2">
              <button
                class="btn btn-sm btn-outline-primary"
                @click="openEditModal(cat)"
                title="Edit Kategori"
              >
                <i class="bi bi-pencil"></i> Edit
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="confirmDelete(cat)"
                title="Hapus Kategori"
              >
                <i class="bi bi-trash"></i> Hapus
              </button>
            </div>
          </div>
        </div>
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
              {{ isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger py-2 small mb-3">
                {{ modalError }}
              </div>

              <!-- Type (only editable when creating) -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Tipe Kategori <span class="text-danger">*</span></label>
                <div v-if="!isEditing" class="d-flex gap-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="catTypeExpense"
                      value="EXPENSE"
                      v-model="form.type"
                    />
                    <label class="form-check-label text-danger fw-semibold" for="catTypeExpense">
                      Pengeluaran (EXPENSE)
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="radio"
                      id="catTypeIncome"
                      value="INCOME"
                      v-model="form.type"
                    />
                    <label class="form-check-label text-success fw-semibold" for="catTypeIncome">
                      Pemasukan (INCOME)
                    </label>
                  </div>
                </div>
                <div v-else class="form-control-plaintext fw-bold" :class="form.type === 'INCOME' ? 'text-success' : 'text-danger'">
                  {{ form.type === 'INCOME' ? 'Pemasukan (INCOME)' : 'Pengeluaran (EXPENSE)' }}
                  <small class="text-muted d-block fw-normal">(Tipe tidak dapat diubah setelah kategori dibuat)</small>
                </div>
              </div>

              <!-- Name -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Nama Kategori <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Pendidikan, Investasi, dsb."
                  v-model="form.name"
                  required
                />
              </div>

              <!-- Color -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Warna Label</label>
                <div class="d-flex align-items-center gap-3">
                  <input
                    type="color"
                    class="form-control form-control-color"
                    v-model="form.color"
                    title="Pilih warna kategori"
                  />
                  <input
                    type="text"
                    class="form-control font-monospace"
                    style="max-width: 120px;"
                    v-model="form.color"
                    pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"
                    placeholder="#6366f1"
                  />
                  <div class="d-flex gap-1">
                    <button
                      v-for="preset in colorPresets"
                      :key="preset"
                      type="button"
                      class="btn p-0 rounded-circle border"
                      :style="{ backgroundColor: preset, width: '24px', height: '24px' }"
                      @click="form.color = preset"
                    ></button>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEditing ? 'Simpan Perubahan' : 'Tambah Kategori' }}
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
            <h5 class="modal-title fw-bold text-danger">Konfirmasi Hapus Kategori</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="categoryToDelete">
            <p class="mb-2">Apakah Anda yakin ingin menghapus kategori <strong>{{ categoryToDelete.name }}</strong>?</p>
            <div
              v-if="(categoryToDelete._count?.transactions || 0) > 0 || (categoryToDelete._count?.budgets || 0) > 0"
              class="alert alert-warning py-2 small mb-0"
            >
              <i class="bi bi-exclamation-triangle me-1"></i>
              <strong>Peringatan:</strong> Kategori ini memiliki data terkait ({{ categoryToDelete._count?.transactions || 0 }} transaksi, {{ categoryToDelete._count?.budgets || 0 }} anggaran). Sistem akan menolak penghapusan demi menjaga integritas data riwayat keuangan.
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
import { onMounted, reactive, ref } from 'vue';
import { categoryService } from '../api/category.service';
import { getErrorMessage } from '../api/client';
import type { Category, CreateCategoryPayload, TransactionType, UpdateCategoryPayload } from '../types';

const categories = ref<Category[]>([]);
const filterType = ref('');
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const modalError = ref('');

const colorPresets = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#ec4899', '#14b8a6', '#64748b'
];

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  name: '',
  type: 'EXPENSE' as TransactionType,
  color: '#ef4444',
});

const showDeleteModal = ref(false);
const categoryToDelete = ref<Category | null>(null);

async function loadCategories() {
  loading.value = true;
  errorMessage.value = '';

  try {
    categories.value = await categoryService.getAll(filterType.value || undefined);
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

  form.name = '';
  form.type = (filterType.value as TransactionType) || 'EXPENSE';
  form.color = form.type === 'INCOME' ? '#10b981' : '#ef4444';

  showModal.value = true;
}

function openEditModal(cat: Category) {
  isEditing.value = true;
  editingId.value = cat.id;
  modalError.value = '';

  form.name = cat.name;
  form.type = cat.type;
  form.color = cat.color;

  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  modalError.value = '';
}

async function handleSubmit() {
  if (!form.name.trim()) {
    modalError.value = 'Nama kategori wajib diisi';
    return;
  }

  submitting.value = true;
  modalError.value = '';

  try {
    if (isEditing.value && editingId.value) {
      const payload: UpdateCategoryPayload = {
        name: form.name.trim(),
        color: form.color,
      };
      await categoryService.update(editingId.value, payload);
      successMessage.value = 'Kategori berhasil diperbarui!';
    } else {
      const payload: CreateCategoryPayload = {
        name: form.name.trim(),
        type: form.type,
        color: form.color,
      };
      await categoryService.create(payload);
      successMessage.value = 'Kategori baru berhasil ditambahkan!';
    }

    closeModal();
    loadCategories();
  } catch (err) {
    modalError.value = getErrorMessage(err);
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(cat: Category) {
  categoryToDelete.value = cat;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!categoryToDelete.value) return;

  deleting.value = true;
  try {
    const res = await categoryService.delete(categoryToDelete.value.id);
    successMessage.value = res.message || 'Kategori berhasil dihapus!';
    showDeleteModal.value = false;
    categoryToDelete.value = null;
    loadCategories();
  } catch (err) {
    errorMessage.value = getErrorMessage(err);
    showDeleteModal.value = false;
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  loadCategories();
});
</script>
