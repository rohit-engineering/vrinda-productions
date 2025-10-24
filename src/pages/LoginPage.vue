<!-- src/pages/LoginPage.vue -->
<template>
  <div class="container py-8 max-w-md mx-auto">
    <div class="card p-6">
      <h3 class="mb-4">Login</h3>
      <form @submit.prevent="login" class="space-y-3">
        <div>
          <label class="form-label">Email</label>
          <input v-model="email" type="email" required class="form-control" />
        </div>
        <div>
          <label class="form-label">Password</label>
          <input v-model="password" type="password" required class="form-control" />
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Login
          </button>
          <router-link to="/signup" class="btn btn-outline-secondary">Create account</router-link>
        </div>
      </form>
      <p class="text-muted mt-3">If redirected while checking out, you'll be returned after login.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter, useRoute } from 'vue-router'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const route = useRoute()

async function login(){
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (error) throw error
    // onAuthStateChange updates central session => router redirect
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
.container{padding-top:3rem}
</style>
