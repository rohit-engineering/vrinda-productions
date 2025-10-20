<template>
  <div class="shop-page container py-4">

    <!-- Theme Toggle -->
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-outline-secondary btn-sm" @click="toggleTheme">
        <i :class="themeIcon"></i> {{ themeLabel }}
      </button>
    </div>

    <!-- Global Loading Screen -->
    <div v-if="pageLoading" class="loading-overlay d-flex align-items-center justify-content-center">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <h1 class="text-center mb-4 shop-title">🛍️ Vrinda Productions Shop</h1>

    <!-- Product Grid -->
    <div class="row g-3">
      <div
        v-for="p in products"
        :key="p.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <div class="product-card h-100 d-flex flex-column">
          <img
            :src="p.imageurl"
            :alt="p.title"
            class="product-img"
          />
          <div class="product-body flex-grow-1">
            <h5 class="product-title">{{ p.title }}</h5>
            <p class="product-desc">{{ p.desc }}</p>
          </div>
          <div class="product-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="price">₹{{ p.price }}</div>
            <div class="d-flex gap-2 flex-wrap">
              <button
                class="btn btn-sm btn-outline-primary flex-grow-1"
                @click="openDetails(p)"
              >
                Details
              </button>
              <button
                class="btn btn-sm btn-primary flex-grow-1"
                @click="addToCart(p)"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Cart Button -->
    <button
      class="btn cart-btn d-flex align-items-center gap-1"
      :class="theme === 'light' ? 'btn-primary' : 'btn-light text-dark'"
      data-bs-toggle="offcanvas"
      data-bs-target="#cartCanvas"
      :disabled="cartCount === 0"
      :title="cartCount === 0 ? 'Cart is empty' : ''"
    >
      <i class="fas fa-shopping-cart"></i> Cart ({{ cartCount }})
    </button>

    <!-- Cart Offcanvas -->
    <div class="offcanvas offcanvas-end" tabindex="-1" id="cartCanvas">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">Your Cart</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body">
        <div v-if="cart.length">
          <div
            v-for="(item, i) in cart"
            :key="item.id"
            class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2 flex-wrap"
          >
            <div>
              <strong>{{ item.title }}</strong>
              <div class="small text-muted">₹{{ item.price }} × {{ item.qty }}</div>
            </div>
            <div class="text-end d-flex gap-1 flex-wrap align-items-center">
              <div>₹{{ item.price * item.qty }}</div>
              <div class="d-flex gap-1 mt-1">
                <button class="btn btn-sm btn-outline-secondary" @click="changeQty(item, -1)">-</button>
                <button class="btn btn-sm btn-outline-secondary" @click="changeQty(item, 1)">+</button>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between mt-3 fw-bold">
            <span>Total</span>
            <span>₹{{ total }}</span>
          </div>
          <button
            class="btn w-100 mt-3"
            :class="theme === 'light' ? 'btn-success' : 'btn-warning text-dark'"
            data-bs-toggle="modal"
            data-bs-target="#orderModal"
            :disabled="cart.length === 0"
          >
            Checkout
          </button>
        </div>
        <p v-else class="text-muted">Your cart is empty.</p>
      </div>
    </div>

    <!-- Product Details Modal -->
    <div class="modal fade" id="productModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div :class="['modal-content', theme === 'dark' ? 'bg-dark text-light' : '']" v-if="selected">
          <div class="modal-header flex-wrap">
            <h5 class="modal-title">{{ selected.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body d-flex flex-column flex-md-row gap-3">
            <img :src="selected.imageurl" :alt="selected.title" class="modal-img flex-shrink-0">
            <div>
              <p>{{ selected.desc }}</p>
              <p class="h5 price">₹{{ selected.price }}</p>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary flex-grow-1" @click="addToCart(selected)">Add to Cart</button>
                <button class="btn btn-outline-secondary flex-grow-1" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Modal -->
    <div class="modal fade" id="orderModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div :class="['modal-content', theme === 'dark' ? 'bg-dark text-light' : '']">
          <div class="modal-header flex-wrap">
            <h5 class="modal-title">Place Your Order</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="placeOrder">
              <div class="row g-2 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label">Name</label>
                  <input v-model="order.name" class="form-control" required :class="theme === 'dark' ? 'bg-secondary text-light' : ''">
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Phone</label>
                  <input v-model="order.phone" type="tel" pattern="[0-9]{10}" class="form-control" required :class="theme === 'dark' ? 'bg-secondary text-light' : ''">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="order.email" type="email" class="form-control" required :class="theme === 'dark' ? 'bg-secondary text-light' : ''">
              </div>
              <div class="mb-3">
                <label class="form-label">Address</label>
                <textarea v-model="order.address" rows="2" class="form-control" required :class="theme === 'dark' ? 'bg-secondary text-light' : ''"></textarea>
              </div>

              <div class="border-top pt-3">
                <div v-for="item in cart" :key="item.id" class="d-flex justify-content-between mb-2 flex-wrap">
                  <span>{{ item.title }} × {{ item.qty }}</span>
                  <span>₹{{ item.price * item.qty }}</span>
                </div>
                <div class="d-flex justify-content-between fw-bold mt-2">
                  <span>Total:</span>
                  <span>₹{{ total }}</span>
                </div>
              </div>

              <button
                type="submit"
                class="btn w-100 mt-4 d-flex align-items-center justify-content-center gap-2"
                :class="theme === 'light' ? 'btn-success' : 'btn-warning text-dark'"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm" role="status"></span>
                <span>{{ loading ? 'Placing Order...' : 'Confirm Order' }}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Thank You Modal -->
    <div class="modal fade" id="confirmModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div :class="['modal-content text-center p-3', theme === 'dark' ? 'bg-dark text-light' : '']">
          <div class="mb-3">
            <i class="fas fa-check-circle text-success fa-2x"></i>
          </div>
          <h5 class="fw-bold">Thank You!</h5>
          <p>Your order has been placed successfully 🎉</p>
          <button
            type="button"
            class="btn w-100"
            :class="theme === 'light' ? 'btn-primary' : 'btn-light text-dark'"
            @click="continueShopping"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container position-fixed bottom-0 end-0 p-2">
      <div
        v-for="(t, i) in toasts"
        :key="t.id"
        class="toast align-items-center text-bg-{{ t.type }} border-0 show mb-1"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body">{{ t.message }}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="removeToast(t.id)"></button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from './supabase'

const products = ref([])
const cart = ref([])
const selected = ref(null)
const order = ref({ name: '', phone: '', email: '', address: '' })
const loading = ref(false)
const pageLoading = ref(true)
const toasts = ref([])

// Theme setup
const theme = ref(localStorage.getItem('theme') || 'light')
const themeIcon = computed(() => theme.value === 'light' ? 'fas fa-moon' : 'fas fa-sun')
const themeLabel = computed(() => theme.value === 'light' ? 'Dark Mode' : 'Light Mode')

// Apply theme to <body>
const applyTheme = () => {
  document.body.classList.remove('light', 'dark')
  document.body.classList.add(theme.value)
}
applyTheme()
watch(theme, () => {
  applyTheme()
  localStorage.setItem('theme', theme.value)
})

const total = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0))
const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))

onMounted(async () => {
  pageLoading.value = true
  const { data, error } = await supabase.from('products').select('*')
  pageLoading.value = false
  if (error) showToast('Failed to load products!', 'danger')
  else products.value = data
})

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

function addToCart(p) {
  const existing = cart.value.find((i) => i.id === p.id)
  existing ? existing.qty++ : cart.value.push({ ...p, qty: 1 })
  showToast(`${p.title} added to cart`, 'success')
}

function changeQty(item, delta) {
  const idx = cart.value.findIndex(i => i.id === item.id)
  if (idx >= 0) {
    cart.value[idx].qty += delta
    if (cart.value[idx].qty <= 0) cart.value.splice(idx, 1)
  }
}

function openDetails(p) {
  selected.value = p
  bootstrap.Modal.getOrCreateInstance(document.getElementById('productModal')).show()
}

async function placeOrder() {
  if (!cart.value.length) return showToast('Cart is empty!', 'warning')
  loading.value = true
  const orderData = {
    ...order.value,
    items: cart.value.map(({ id, title, price, qty }) => ({ id, title, price, qty })),
    total: total.value,
    date: new Date().toISOString(),
    customer_id: crypto.randomUUID(),
    order_id: 'ORD-' + Date.now() + '-' + crypto.randomUUID().slice(0, 8)
  }
  const { error } = await supabase.from('orders').insert([orderData])
  loading.value = false

  if (error) showToast('Order failed: ' + error.message, 'danger')
  else {
    cart.value = []
    order.value = { name: '', phone: '', email: '', address: '' }
    bootstrap.Modal.getOrCreateInstance(document.getElementById('orderModal')).hide()
    bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmModal')).show()
  }
}

function continueShopping() {
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmModal')).hide()
  selected.value = null
}

function showToast(message, type = 'info') {
  const id = crypto.randomUUID()
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 3000)
}

function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index >= 0) toasts.value.splice(index, 1)
}
</script>

<style>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&family=Playfair+Display:wght@500;700&display=swap');

body { transition: background 0.3s, color 0.3s; }
.loading-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(255,255,255,0.9); z-index: 2000; }
.shop-title { font-family: 'Playfair Display', serif; color: var(--primary-blue); font-size: 1.8rem; }
.product-card { border-radius: 12px; background: var(--bg-light); box-shadow: 0 6px 18px rgba(0,0,0,0.08); transition: all 0.2s ease; display:flex; flex-direction:column; height:100%; }
.product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
.product-img { height: 200px; object-fit: cover; border-top-left-radius: 12px; border-top-right-radius: 12px; width: 100%; }
.product-body { padding: 12px; flex-grow:1; }
.product-title { font-weight:600; margin-bottom:6px; font-size:1rem; }
.product-desc { font-size:0.85rem; color:#666; }
.product-footer { padding:10px 12px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; }
.price { font-weight:700; color: var(--primary-blue); }
.cart-btn { position:fixed; bottom:15px; right:15px; border-radius:50px; padding:8px 16px; box-shadow:0 4px 10px rgba(0,0,0,0.15); font-size:0.9rem; z-index:1500; }
.modal-img { width:100%; max-width:300px; border-radius:8px; object-fit:cover; margin-bottom:12px; }
input.bg-secondary, textarea.bg-secondary { background:#333 !important; color:#eee !important; }

/* Theme variables */
body.light { --bg-light:#fff8fc; --text-color:#333; --primary-blue:#4da6ff; background: var(--bg-light); color: var(--text-color); }
body.dark { --bg-light:#1b1b1b; --text-color:#eee; --primary-blue:#4da6ff; background: var(--bg-light); color: var(--text-color); }
.modal-content.bg-dark { background: #1b1b1b !important; color: #eee; }
</style>
