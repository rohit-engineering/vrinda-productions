<!-- src/pages/LoginPage.vue -->
<template>
  <div class="login-page d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="card shadow-sm p-4 login-card w-100" style="max-width: 400px;">
      <h3 class="mb-4 text-center text-primary fw-bold">Login</h3>
      <form @submit.prevent="login" class="needs-validation" novalidate>
        <div class="mb-3">
          <label for="email" class="form-label fw-semibold">Email</label>
          <input v-model="email" type="email" id="email" class="form-control" required placeholder="you@example.com">
        </div>
        <div class="mb-3">
          <label for="password" class="form-label fw-semibold">Password</label>
          <input v-model="password" type="password" id="password" class="form-control" required placeholder="Enter your password">
        </div>
        <div class="d-flex flex-column flex-md-row gap-2 mb-3">
          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Login
          </button>
          <router-link to="/signup" class="btn btn-outline-secondary w-100">Create Account</router-link>
        </div>
      </form>
      <p class="text-muted text-center mt-3 small">If redirected while checking out, you'll be returned after login.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter, useRoute } from 'vue-router'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const route = useRoute()

// Remove any leftover modal overlays
onMounted(() => {
  const backdrops = document.querySelectorAll('.modal-backdrop')
  backdrops.forEach(b => b.remove())
})

async function login(){
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (error) throw error
    const redirectTo = route.query.redirect || '/'
    router.push(redirectTo)
  } catch (err) {
    alert(err.message || 'Login failed')
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  padding: 2rem;
}

/* Card styling */
.login-card {
  border-radius: 12px;
  background-color: #ffffff;
  position: relative; /* overlay fix */
  z-index: 10;
}

/* Input focus style */
.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  outline: none;
}

/* Button hover */
.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .login-card {
    padding: 2rem 1rem;
  }
  h3 {
    font-size: 1.5rem;
  }
}
</style>
