<template>
  <div class="app-layout min-vh-100 d-flex flex-column bg-light">
    <Navbar />
    <main class="flex-grow-1">
      <router-view />
    </main>
    <footer class="bg-white border-top py-3 text-center text-muted small">
      <div class="container">
        <span>Personal Finance Dashboard &copy; 2026. Local-first & Single-user.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue';
</script>

<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1e293b;
  background-color: #f8fafc;
}

.card {
  border-radius: 10px;
}
</style>
