<template>
  <div class="shop-page container py-3">

    <!-- Header -->
    <header class="d-flex align-items-center justify-content-between mb-3">
  <div class="branding d-flex align-items-center gap-2">
    <img
      src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiD9bgK1LH1QE-159gBQz33mCN6JZ_4nvzXeWNQe4E-0yoTQxX-QcAU_9NFgFFnmZaXryFJ3CcL-0lHfFRAzrCgvXUQykj4tVdzWw5zhXfK_SEavAwnhy7cYdUy5D2fyFLd_-kPB3ElEsWaO7cnRS_32lcUqu7hfcAxe8VByREUSUyKDAWNU4vW6uMXsyg/w442-h442/ChatGPT%20Image%20Oct%2024,%202025,%2004_51_23%20PM.png"
      alt="VrindaStores Logo"
      class="brand-logo"
    />
    <div>
      <h1 class="shop-title">VrindaStores</h1>
      <p class="subtitle mb-0">Apne Sheher ka Coolest Online Store – Cute, Classy & Totally GenZ 💖</p>
    </div>
  </div>

  <div class="d-flex gap-2 align-items-center">
    <button v-if="sessionValue.user" class="btn btn-outline-secondary btn-sm" @click="logout">
      <i class="fas fa-sign-out-alt"></i> Logout
    </button>
    <button class="btn btn-outline-primary btn-sm" @click="openModal('cartModal')">
      <i class="fas fa-shopping-cart"></i> Cart ({{ cartCount }})
    </button>
    <button class="btn btn-outline-danger btn-sm" @click="openModal('wishlistModal')">
      <i class="fas fa-heart"></i> Wishlist ({{ wishlist.length }})
    </button>
    <button class="btn btn-outline-secondary btn-sm" @click="openOrders">
      <i class="fas fa-box-open"></i> Orders
    </button>
  </div>
</header>

    <!-- Categories -->
<div class="chips-bar mb-3">
  <div class="category-slider-wrapper">
    <div class="d-flex category-slider" ref="categorySlider">
      <button
        v-for="c in ['All', ...categories]"
        :key="c"
        @click="selectCategory = c"
        :class="['chip', { active: selectCategory === c }]">
        {{ c }}
      </button>
    </div>
  </div>
</div>

    <!-- Product Gallery -->
    <main>
      <div class="gallery">
        <article
          v-for="p in filteredProducts"
          :key="p.id"
          class="product-tile">
          <figure class="tile-figure">
            <div class="image-wrapper" @click="goToProduct(p.id)">
              <img :src="p.imageurl || placeholderImage" :alt="p.title" />
              <img v-if="p.imageurl2" :src="p.imageurl2" class="second-image" />
            </div>
            <figcaption class="tile-caption">
              <div class="title">{{ p.title }}</div>
              <div class="price-row">
                <span class="old-price" v-if="p.old_price || p.oldPrice">₹{{ p.old_price ?? p.oldPrice }}</span>
                <span class="price">₹{{ p.price }}</span>
                <span class="save-badge" v-if="p.old_price || p.oldPrice">
                  💰 Save {{ Math.round(((p.old_price ?? p.oldPrice) - p.price) / ((p.old_price ?? p.oldPrice) || 1) * 100) }}%
                </span>
              </div>
              <div class="d-flex gap-1 mt-1">
                <button class="btn btn-sm btn-primary flex-fill" @click.stop="goToProduct(p.id)">
                  View Details <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click.stop="toggleWishlist(p)">
                  <i :class="isInWishlist(p) ? 'fas fa-heart' : 'far fa-heart'"></i>
                </button>
                <button class="btn btn-sm btn-success" @click.stop="addToCart(p)">
                  <i class="fas fa-cart-plus"></i>
                </button>
              </div>
            </figcaption>
          </figure>
        </article>
        <div v-if="!filteredProducts.length" class="no-results">
          No products in this category.
        </div>
      </div>
    </main>

    <!-- Alert Modal -->
    <div class="modal fade" id="alertModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-exclamation-circle text-warning"></i> Attention</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>{{ alertMessage }}</p>
          </div>
          <div class="modal-footer">
            <template v-if="!sessionValue.user">
              <button class="btn btn-primary" @click="redirectLogin">Login</button>
              <button class="btn btn-danger" @click="redirectSignup">Signup</button>
            </template>
            <template v-else>
              <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart Modal -->
    <div class="modal fade" id="cartModal" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Your Cart / Checkout</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="cart.length">
              <div v-for="(item,i) in cart" :key="item.id" class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <div><strong>{{ item.title }}</strong><div class="small text-muted">₹{{ item.price }} × {{ item.qty }}</div></div>
                <div class="text-end d-flex gap-1 align-items-center">
                  <div>₹{{ (item.price * item.qty).toFixed(2) }}</div>
                  <div class="d-flex gap-1 ms-2">
                    <button class="btn btn-sm btn-outline-secondary" @click="changeQty(item,-1)">-</button>
                    <button class="btn btn-sm btn-outline-secondary" @click="changeQty(item,1)">+</button>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between fw-bold mt-3 mb-3">
                <span>Total:</span><span>₹{{ total.toFixed(2) }}</span>
              </div>

              <!-- Checkout Form -->
              <!-- Checkout Form -->
<div class="mb-2">
  <input type="text" v-model="userDetails.name" placeholder="Name" class="form-control mb-1" />
  <input type="email" v-model="userDetails.email" placeholder="Email" class="form-control mb-1" />
  <input type="text" v-model="userDetails.phone" placeholder="Phone" class="form-control mb-1" />
  <textarea v-model="userDetails.address" placeholder="Address (Include Pincode)" class="form-control mb-2"></textarea>

  <!-- 🟢 Delivery Option -->
  <div class="border rounded p-2 mb-2">
    <label class="form-label fw-semibold mb-1 d-block">Delivery Option:</label>
    <div class="form-check">
      <input class="form-check-input" type="radio" id="cod" value="Cash on Delivery" v-model="userDetails.paymentMethod" />
      <label class="form-check-label" for="cod">💵 Cash on Delivery</label>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="radio" id="upi" value="UPI Online" v-model="userDetails.paymentMethod" />
      <label class="form-check-label" for="upi">📱 UPI Online Payment</label>
    </div>
  </div>
</div>

<button class="btn btn-primary w-100" @click="submitOrder">
  Place Order 💳
</button>

            </div>
            <p v-else class="text-muted">Your cart is empty.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Wishlist Modal -->
    <div class="modal fade" id="wishlistModal" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Your Wishlist</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="wishlist.length">
              <div v-for="item in wishlist" :key="item.id" class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" v-model="item.selected" />
                  <div>
                    <strong>{{ item.title }}</strong>
                    <div class="small text-muted">₹{{ item.price }}</div>
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary" @click.stop="goToProduct(item.id)">View</button>
                  <button class="btn btn-sm btn-outline-danger" @click.stop="removeWishlistItem(item)">Remove</button>
                </div>
              </div>
              <div class="mt-3">
                <button class="btn btn-success w-100" @click="checkoutSelectedWishlist">
                  Order Selected Items 💖
                </button>
              </div>
            </div>
            <p v-else class="text-muted">Wishlist is empty.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders Modal -->
    <div class="modal fade" id="orderHistoryModal" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Order History</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="text-info mb-3">You can cancel order within 24 hours only.</p>
            <div v-if="orders.length">
              <div v-for="o in orders" :key="o.order_id" class="mb-3 border-bottom pb-2">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ o.order_id }}</strong>
                    <span class="small text-muted">{{ new Date(o.created_at).toLocaleString() }}</span>
                  </div>
                  <div class="d-flex gap-2">
                    <button 
                      v-if="o.status==='placed' && canCancelOrder(o)" 
                      class="btn btn-sm btn-outline-danger" 
                      @click="cancelOrder(o)">
                      Cancel
                    </button>
                    <button 
                      v-if="o.status==='cancelled'" 
                      class="btn btn-sm btn-outline-secondary" 
                      @click="removeOrderFromView(o)">
                      Remove
                    </button>
                  </div>
                </div>
                <div class="small text-muted">Status: {{ o.status }}</div>
                <div class="small text-muted">Total: ₹{{ o.total }}</div>
                <ul class="mt-1">
                  <li v-for="item in o.items" :key="item.id">{{ item.title }} × {{ item.qty }} = ₹{{ item.price*item.qty }}</li>
                </ul>
              </div>
            </div>
            <p v-else class="text-muted">No orders yet.</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- State ---
const products = ref([])
const categories = ref([])
const selectCategory = ref('All')
const cart = ref([])
const wishlist = ref([])
const orders = ref([])
const placeholderImage = 'https://via.placeholder.com/300x300?text=No+Image'
const alertMessage = ref('')
const userDetails = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  paymentMethod: 'Cash on Delivery'
})
const sessionValue = ref({ user: null })

// --- Debounced Storage ---
let saveCartTimeout
let saveWishlistTimeout
function saveCartToStorage(){
  if(!sessionValue.value.user) return
  clearTimeout(saveCartTimeout)
  saveCartTimeout = setTimeout(() => {
    localStorage.setItem('cart_'+sessionValue.value.user.id, JSON.stringify(cart.value))
  }, 200)
}
function saveWishlistToStorage(){
  if(!sessionValue.value.user) return
  clearTimeout(saveWishlistTimeout)
  saveWishlistTimeout = setTimeout(() => {
    localStorage.setItem('wishlist_'+sessionValue.value.user.id, JSON.stringify(wishlist.value))
  }, 200)
}

// --- Computed ---
const filteredProducts = computed(() => {
  const category = selectCategory.value.toLowerCase()
  if(category === 'all') return products.value
  return products.value.filter(p => (p.category||'').toLowerCase() === category)
})
const cartCount = computed(() => cart.value.reduce((s,i)=> s+(i.qty||0),0))
const total = computed(() => cart.value.reduce((s,i)=> s+(Number(i.price)||0)*(i.qty||0),0))

// --- Navigation ---
function redirectLogin(){ router.push('/login') }
function redirectSignup(){ router.push('/signup') }

// --- User Details ---
function setUserDetails(user){
  userDetails.value.name = user.user_metadata?.full_name || ''
  userDetails.value.email = user.email || ''
}

// --- Cart & Wishlist ---
function loadCartFromStorage(){
  if(!sessionValue.value.user) return
  const data = localStorage.getItem('cart_'+sessionValue.value.user.id)
  cart.value = data ? JSON.parse(data) : []
}
function loadWishlistFromStorage(){
  if(!sessionValue.value.user) return
  const data = localStorage.getItem('wishlist_'+sessionValue.value.user.id)
  wishlist.value = data ? JSON.parse(data) : []
}
function addToCart(p){
  if(!sessionValue.value.user){ showLoginAlert(); return }
  const existing = cart.value.find(i=>i.id===p.id)
  if(existing) existing.qty++
  else cart.value.push({id:p.id,title:p.title,price:Number(p.price||0),qty:1})
  saveCartToStorage()
}
function changeQty(item,delta){
  const idx = cart.value.findIndex(i=>i.id===item.id)
  if(idx<0) return
  cart.value[idx].qty += delta
  if(cart.value[idx].qty<=0) cart.value.splice(idx,1)
  saveCartToStorage()
}
function toggleWishlist(p){
  if(!sessionValue.value.user){ showLoginAlert(); return }
  const idx = wishlist.value.findIndex(i=>i.id===p.id)
  if(idx>=0) wishlist.value.splice(idx,1)
  else wishlist.value.push({id:p.id,title:p.title,price:Number(p.price||0),selected:false})
  saveWishlistToStorage()
}
function isInWishlist(p){ return wishlist.value.some(i=>i.id===p.id) }
function removeWishlistItem(item){ wishlist.value = wishlist.value.filter(i=>i.id!==item.id); saveWishlistToStorage() }

// --- Checkout Selected Wishlist ---
function checkoutSelectedWishlist(){
  if(!sessionValue.value.user){ showLoginAlert(); return }
  const selected = wishlist.value.filter(i=>i.selected)
  if(!selected.length){ showLoginAlert('Select at least one item!'); return }

  selected.forEach(i=>{
    const existing = cart.value.find(c=>c.id===i.id)
    if(existing) existing.qty++
    else cart.value.push({...i, qty:1})
  })
  saveCartToStorage()
  openModal('cartModal')
}

// --- Orders ---
async function submitOrder(){
  if(!sessionValue.value.user || !cart.value.length) return
  const { name, email, phone, address, paymentMethod } = userDetails.value
  if (!name || !email || !phone || !address || !paymentMethod) {
    showLoginAlert('All fields and delivery option are required')
    return
  }

  const orderItems = cart.value.map(i=>({id:i.id,title:i.title,price:i.price,qty:i.qty}))
  const totalAmount = orderItems.reduce((sum,i)=>sum+i.price*i.qty,0)
  const order_id = 'ORD-'+Date.now()
  const { error } = await supabase.from('orders').insert([{
    order_id,
    user_id: sessionValue.value.user.id,
    name,
    email,
    phone,
    address,
    payment_preference: paymentMethod,
    items: orderItems,
    total: totalAmount,
    status: 'placed',
    payment_status: 'pending'
  }])

  if(error){ showLoginAlert('Failed to place order'); return }
  cart.value=[]
  saveCartToStorage()
  wishlist.value = wishlist.value.filter(i=>!i.selected)
  saveWishlistToStorage()
  alertMessage.value='✅ Order placed successfully!'
  openModal('alertModal')
}

// --- Load Orders ---
async function loadOrders(){
  if(!sessionValue.value.user) return
  const {data,error} = await supabase.from('orders')
    .select('*')
    .eq('user_id',sessionValue.value.user.id)
    .order('created_at',{ascending:false})
  if(error) console.error(error)
  else orders.value = data || []
}
function openOrders(){ loadOrders(); openModal('orderHistoryModal') }
function canCancelOrder(o){
  const orderTime = new Date(o.created_at).getTime()
  const now = Date.now()
  return (now - orderTime) <= 24*60*60*1000
}
async function cancelOrder(o){
  const {error} = await supabase.from('orders').update({status:'cancelled'}).eq('order_id',o.order_id)
  if(error) console.error(error); else o.status='cancelled'
}
async function removeOrderFromView(o){
  if(o.status === 'cancelled'){
    const { error } = await supabase.from('orders').delete().eq('order_id', o.order_id)
    if(error){ console.error('Failed to remove order:', error); return }
  }
  orders.value = orders.value.filter(x=>x.order_id !== o.order_id)
}

// --- Logout ---
async function logout(){
  await supabase.auth.signOut()
  cart.value=[]
  wishlist.value=[]
  orders.value=[]
  userDetails.value = {name:'',email:'',phone:'',address:'', paymentMethod:'Cash on Delivery'}
  sessionValue.value.user = null
  router.push('/')
}

// --- Modal & Alerts ---
function openModal(modalId){
  document.querySelectorAll('.modal.show').forEach(m => bootstrap.Modal.getInstance(m)?.hide())
  setTimeout(()=>{ new bootstrap.Modal(document.getElementById(modalId)).show() }, 100)
}
function showLoginAlert(msg='Please login or signup first!'){
  alertMessage.value = msg
  openModal('alertModal')
}

// --- Go To Product with Prefetch ---
async function goToProduct(id){
  document.querySelectorAll('.modal.show').forEach(m => bootstrap.Modal.getInstance(m)?.hide())
  // Prefetch
  await supabase.from('products').select('*').eq('id', id).single()
  router.push({ name: 'ProductDetails', params: { id } })
}

// --- Lifecycle ---
onMounted(async () => {
  // Remove leftover modal backdrops
  document.querySelectorAll('.modal-backdrop').forEach(b => b.remove())

  const { data: productsData } = await supabase.from('products').select('*').order('id',{ascending:true})
  products.value = productsData || []

  const { data: catData } = await supabase.from('categories').select('name').order('name',{ascending:true})
  categories.value = catData ? catData.map(c=>c.name) : []

  const { data: { session } } = await supabase.auth.getSession()
  sessionValue.value.user = session?.user || null

  if(sessionValue.value.user){
    setUserDetails(sessionValue.value.user)
    // Defer cart/wishlist load for smoother initial render
    nextTick(()=>{
      loadCartFromStorage()
      loadWishlistFromStorage()
      loadOrders()
    })
  }

  supabase.auth.onAuthStateChange((_event, newSession) => {
    sessionValue.value.user = newSession?.user || null
    if(newSession?.user){
      setUserDetails(newSession.user)
      loadCartFromStorage()
      loadWishlistFromStorage()
      loadOrders()
    } else {
      cart.value=[]
      wishlist.value=[]
      orders.value=[]
      userDetails.value = { name:'', email:'', phone:'', address:'', paymentMethod:'Cash on Delivery' }
    }
  })
})
</script>


<style scoped>
/* === Google Fonts Import === */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap');

/* === Branding Section === */
.branding {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.brand-logo {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  object-fit: cover;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.brand-logo:hover {
  transform: rotate(-5deg) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.shop-title {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 2.1rem;
  letter-spacing: 0.6px;
  background: linear-gradient(90deg, #ffea00, #e52e71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 1px 1px rgba(0, 0, 0, 0.05);
}

.subtitle {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  color: #555;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  margin-top: 0.2rem;
}

/* === Category Chips === */
.chip {
  border-radius: 50px;
  padding: 0.3rem 1rem;
  background: #eee;
  cursor: pointer;
  transition: 0.3s ease;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
}
.chip:hover {
  background: #f1f1f1;
}
.chip.active {
  background: #007bff;
  color: #fff;
}

/* === Product Gallery Grid === */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.product-tile {
  background: #fff;
  border-radius: 0.6rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.product-tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.product-tile, .gallery, .tile-caption {
  position: relative;
  z-index: 10;
}

.image-wrapper {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  height: 220px;
}
.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.4s ease, transform 0.3s ease;
}
.image-wrapper img.second-image {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}
.image-wrapper:hover img.second-image {
  opacity: 1;
}

.tile-caption {
  padding: 0.7rem;
}

.price-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.9rem;
}
.old-price {
  text-decoration: line-through;
  color: #888;
}
.save-badge {
  background: #ffc107;
  padding: 0 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  color: #000;
}
.no-results {
  text-align: center;
  color: #999;
  padding: 2rem;
  font-size: 1.1rem;
}

/* === Category Slider Buttons === */
.category-slider-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  gap: 0.2rem;
  overflow: hidden;
}

.category-slider {
  display: flex;
  gap: 0.3rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  padding: 0.2rem 0;
}

.scroll-btn {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: 0.2s;
}
.scroll-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}
.scroll-btn i {
  font-size: 0.8rem;
  color: #333;
}
.scroll-btn.left {
  margin-right: 0.2rem;
}
.scroll-btn.right {
  margin-left: 0.2rem;
}

@media (min-width: 769px) {
  .scroll-btn {
    display: none;
  }

  /* Desktop hover zoom */
  .image-wrapper img {
    object-fit: cover;
  }
  .image-wrapper:hover img {
    transform: scale(1.05);
  }
}

/* === MOBILE OPTIMIZATION === */
@media (max-width: 768px) {
  /* Header layout */
  header.d-flex {
    display: grid !important;
    grid-template-rows: auto auto auto;
    gap: 0.6rem;
    align-items: start;
  }

  /* Branding adjustments */
  .branding {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .brand-logo {
    width: 45px;
    height: 45px;
  }
  .shop-title {
    font-size: 1.7rem;
  }
  .subtitle {
    font-size: 0.8rem;
  }

  /* Buttons stack neatly */
  header .d-flex.gap-2 {
    justify-content: space-around !important;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  header .d-flex.gap-2 button {
    flex: 1 1 22%;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.7rem;
    padding: 0.35rem 0.4rem;
  }
  header .d-flex.gap-2 button i {
    font-size: 1.2rem;
    margin-bottom: 0.15rem;
  }

  /* Category chips scrollable bar */
  .chips-bar {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .chips-bar .d-flex {
    display: flex;
    gap: 0.3rem;
    padding-bottom: 0.2rem;
  }
  .chips-bar .chip {
    flex: 0 0 auto;
    font-size: 0.75rem;
    padding: 0.25rem 0.7rem;
    border-radius: 20px;
    background: #eee;
    transition: 0.3s;
  }
  .chips-bar .chip.active {
    background: #007bff;
    color: #fff;
  }

  /* ✅ Product gallery one-column with full image view */
  .gallery {
    grid-template-columns: 1fr !important;
    gap: 0.6rem !important;
  }
  .product-tile {
    border-radius: 0.4rem;
  }
  .image-wrapper {
    height: auto;
    min-height: 180px;
    max-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .image-wrapper img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }
  .tile-caption .title {
    font-size: 0.9rem;
  }
  .price-row {
    font-size: 0.8rem;
    flex-wrap: wrap;
  }
  .tile-caption button {
    font-size: 0.75rem;
    padding: 0.25rem 0.4rem;
  }

  /* Modals full width */
  .modal-dialog {
    max-width: 95% !important;
    margin: 1rem auto;
  }
  .modal-body input,
  .modal-body textarea {
    font-size: 0.85rem;
  }
  .modal-body button {
    font-size: 0.75rem;
    padding: 0.3rem 0.5rem;
  }

  /* Orders section text */
  #orderHistoryModal .modal-body p.text-info,
  #orderHistoryModal .modal-body div.mb-3,
  #orderHistoryModal .modal-body ul li {
    font-size: 0.75rem;
  }
}
</style>

