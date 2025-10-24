<!-- src/pages/SignupPage.vue -->
<template>
  <div class="container py-8 max-w-lg mx-auto">
    <div class="card p-6">
      <h3 class="mb-4">Create account</h3>
      <form @submit.prevent="signup" class="grid gap-3">
        <input v-model="name" placeholder="Full name" class="form-control" required />
        <input v-model="phone" placeholder="Phone (10 digits)" pattern="[0-9]{10}" class="form-control" required />
        <input v-model="address" placeholder="Address" class="form-control" required />
        <input v-model="email" type="email" placeholder="Email" class="form-control" required />
        <input v-model="password" type="password" placeholder="Password (min 6)" minlength="6" class="form-control" required />
        <div class="flex gap-2">
          <button class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Create account
          </button>
          <router-link to="/login" class="btn btn-outline-secondary">Already have an account?</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const name = ref('')
const phone = ref('')
const address = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

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
    // try immediate sign-in (works when confirmation not required)
    try {
      const { data: sessionData } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      const uid = sessionData?.session?.user?.id || data?.user?.id
      if (uid) await createProfile(uid)
    } catch (e) {
      // if confirmation required, still upsert profile after user confirms and logs in
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
.container{padding-top:3rem}
</style>
