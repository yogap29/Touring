<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
    <div class="container-fluid px-4">
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2 fw-bold">
        <span>💰</span>
        <span>Personal Finance</span>
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
          <li class="nav-item">
            <router-link to="/" class="nav-link px-3" active-class="active fw-semibold">
              <i class="bi bi-speedometer2 me-1"></i> Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/transactions" class="nav-link px-3" active-class="active fw-semibold">
              <i class="bi bi-receipt me-1"></i> Transaksi
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/categories" class="nav-link px-3" active-class="active fw-semibold">
              <i class="bi bi-tags me-1"></i> Kategori
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/budgets" class="nav-link px-3" active-class="active fw-semibold">
              <i class="bi bi-wallet2 me-1"></i> Anggaran
            </router-link>
          </li>
        </ul>
        <div class="d-flex align-items-center text-light small opacity-75">
          <span>v1.0 • Single User</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Navbar component
</script>

<style scoped>
.navbar-brand {
  letter-spacing: -0.5px;
}
.nav-link.active {
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 6px;
}
</style>
