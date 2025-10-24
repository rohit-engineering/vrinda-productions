<!-- src/pages/SignupPage.vue -->
<template>
  <div class="signup-page d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="card shadow-sm p-4 signup-card w-100" style="max-width: 450px;">
      <h3 class="mb-4 text-center text-primary fw-bold">Create Account</h3>
      <form @submit.prevent="signup" class="needs-validation" novalidate>
        <div class="mb-3">
          <label class="form-label fw-semibold">Full Name</label>
          <input v-model="name" type="text" class="form-control" placeholder="John Doe" required>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Phone</label>
          <input v-model="phone" type="tel" pattern="[0-9]{10}" class="form-control" placeholder="10-digit number" required>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Address</label>
          <input v-model="address" type="text" class="form-control" placeholder="123 Street, City" required>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Email</label>
          <input v-model="email" type="email" class="form-control" placeholder="you@example.com" required>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Password</label>
          <input v-model="password" type="password" class="form-control" placeholder="Min 6 characters" minlength="6" required>
        </div>
        <div class="d-flex flex-column flex-md-row gap-2 mb-3">
          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Create Account
          </button>
          <router-link to="/login" class="btn btn-outline-secondary w-100">Already have an account?</router-link>
        </div>
      </form>
      <p class="text-muted text-center mt-3 small">After signing up, you may need to confirm your email before logging in.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const name = ref('')
const phone = ref('')
const address = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

// Remove any leftover modal overlays
onMounted(() => {
  const backdrops = document.querySelectorAll('.modal-backdrop')
  backdrops.forEach(b => b.remove())
})

async function createProfile(userId){
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    name: name.value,
    phone: phone.value,
    address: address.value
  })
  if (error) console.error('profile create error', error)
}

async function signup(){
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signUp({ email: email.value, password: password.value })
    if (error) throw error
    try {
      const { data: sessionData } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      const uid = sessionData?.session?.user?.id || data?.user?.id
      if (uid) await createProfile(uid)
    } catch (e) {
      console.log('signup: immediate sign-in not available', e?.message ?? e)
    }
    alert('Signup successful. Check your email if confirmation is required.')
    router.push('/')
  } catch (err) {
    alert(err.message || 'Signup failed')
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-page {
  padding: 2rem;
}

/* Card styling */
.signup-card {
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
  .signup-card {
    padding: 2rem 1rem;
  }
  h3 {
    font-size: 1.5rem;
  }
}
</style>
