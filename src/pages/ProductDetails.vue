<template>
  <div class="container py-5 position-relative">

    <!-- Top Navigation -->
    <div class="d-flex justify-content-between align-items-center mb-4 position-sticky top-0 bg-white py-2" style="z-index:100;">
      <button class="btn btn-outline-secondary btn-sm" @click="goBack">← Back</button>
      <h5 class="mb-0">Product Details</h5>
      <button class="btn btn-outline-secondary btn-sm" @click="closePage">✕</button>
    </div>

    <!-- Main Grid: Left (Images) | Right (Details) -->
    <div class="row g-4">

      <!-- Left: Images + Thumbnails + Buttons -->
      <div class="col-md-6">
        <!-- Main Image -->
        <div class="position-relative border rounded overflow-hidden mb-3" style="height:400px;">
          <img :src="currentImage" class="w-100 h-100 object-fit-contain" />
          <button class="carousel-nav left btn btn-dark btn-sm" @click="prevImage">‹</button>
          <button class="carousel-nav right btn btn-dark btn-sm" @click="nextImage">›</button>
        </div>

        <!-- Thumbnails -->
        <div class="d-flex gap-2 overflow-auto mb-3">
          <img 
            v-for="(img, idx) in images" 
            :key="idx" 
            :src="img" 
            class="img-thumbnail cursor-pointer" 
            :class="{ 'border-primary': idx===index }"
            style="width:80px; height:80px; object-fit:cover;"
            @click="index=idx"
          />
        </div>

        <!-- Action Buttons -->
        <div class="d-flex gap-2">
          <button class="btn btn-success flex-fill" @click="addToCart">Add to Cart</button>
          <button class="btn btn-primary flex-fill" @click="buyNow">Buy Now</button>
          <button class="btn btn-outline-danger flex-fill" @click="toggleWishlist">
            <i :class="isInWishlist ? 'fas fa-heart' : 'far fa-heart'"></i> Wishlist
          </button>
        </div>
      </div>

      <!-- Right: Product Details -->
      <div class="col-md-6 d-flex flex-column">
        <h2 class="fw-bold">{{ product?.title }}</h2>
        <div class="text-muted mb-2">{{ product?.category }}</div>
        <div class="h4 text-success mb-3">₹{{ product?.price }}</div>
        <p>{{ product?.description || product?.desc }}</p>
      </div>

    </div>

    <!-- Bottom: Recommended Products -->
    <div class="mt-5">
      <h5>Recommended Products</h5>
      <div class="d-flex gap-3 overflow-auto">
        <div v-for="r in recommended" :key="r.id" class="card flex-shrink-0" style="width:160px; cursor:pointer;" @click="openProduct(r.id)">
          <img :src="r.imageurl || placeholderImage" class="card-img-top" style="height:120px; object-fit:cover;" />
          <div class="card-body p-2">
            <h6 class="card-title text-truncate mb-1">{{ r.title }}</h6>
            <div class="text-success fw-bold">₹{{ r.price }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart / Checkout Modal -->
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
                <div>
                  <strong>{{ item.title }}</strong>
                  <div class="small text-muted">₹{{ item.price }} × {{ item.qty }}</div>
                </div>
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
              <div class="mb-2">
                <input type="text" v-model="userDetails.name" placeholder="Name" class="form-control mb-1" />
                <input type="email" v-model="userDetails.email" placeholder="Email" class="form-control mb-1" />
                <input type="text" v-model="userDetails.phone" placeholder="Phone" class="form-control mb-1" />
                <textarea v-model="userDetails.address" placeholder="Address (Include Pincode)" class="form-control mb-1"></textarea>
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

    <!-- Dynamic Message Modal -->
    <div class="modal fade" id="messageModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Notification</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p id="modalMessage"></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const product = ref(null)
const images = ref([])
const index = ref(0)
const recommended = ref([])
const placeholderImage = 'https://via.placeholder.com/300x300?text=No+Image'

const cart = ref([])
const wishlist = ref([])
const sessionValue = ref({ user: null })
const userDetails = ref({ name:'', email:'', phone:'', address:'' })

const currentImage = computed(() => images.value[index.value] || placeholderImage)
const isInWishlist = computed(() => wishlist.value.some(i => i.id === product.value?.id))
const total = computed(() => cart.value.reduce((sum,i)=>sum + (i.price*i.qty),0))

onMounted(async () => {
  await getSession()
  await loadProduct()
})

async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  sessionValue.value.user = session?.user || null
  loadLocalStorage()
  if(sessionValue.value.user){
    userDetails.value.name = sessionValue.value.user.user_metadata?.full_name || ''
    userDetails.value.email = sessionValue.value.user.email || ''
  }
}

function loadLocalStorage(){
  const uid = sessionValue.value.user?.id || 'guest'
  cart.value = JSON.parse(localStorage.getItem('cart_'+uid) || '[]')
  wishlist.value = JSON.parse(localStorage.getItem('wishlist_'+uid) || '[]')
}
function saveCart(){ localStorage.setItem('cart_'+(sessionValue.value.user?.id||'guest'), JSON.stringify(cart.value)) }
function saveWishlist(){ localStorage.setItem('wishlist_'+(sessionValue.value.user?.id||'guest'), JSON.stringify(wishlist.value)) }

async function loadProduct() {
  const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
  product.value = data || null
  if(product.value){
    images.value = [product.value.imageurl, product.value.imageurl2, product.value.imageurl3, product.value.imageurl4].filter(Boolean)
    const { data: recs } = await supabase.from('products').select('*').eq('category', product.value.category).neq('id', product.value.id).limit(8)
    recommended.value = recs || []
  }
}

function prevImage(){ if(index.value>0) index.value-- }
function nextImage(){ if(index.value<images.value.length-1) index.value++ }

function goBack(){ router.back() }
function closePage(){ router.push({ name:'Shop' }) }
function openProduct(newId){ router.push({ name:'ProductDetails', params:{id:newId} }).then(()=>window.location.reload()) }

// ========== Modal Message Helper ==========
function showMessage(msg){
  const modalEl = document.getElementById('messageModal')
  const modalMsgEl = modalEl.querySelector('#modalMessage')
  modalMsgEl.textContent = msg
  const modal = new bootstrap.Modal(modalEl)
  modal.show()
}

// Add to cart; showNotif controls whether to display modal message
async function addToCart(showNotif = true){
  if(!sessionValue.value.user){ if(showNotif) showMessage('Please login first!'); return }
  const p = product.value
  if(!p) return
  const ex = cart.value.find(i=>i.id===p.id)
  if(ex) ex.qty = (ex.qty||0)+1
  else cart.value.push({ id:p.id, title:p.title, price:Number(p.price||0), qty:1 })
  saveCart()
  const user_id = sessionValue.value.user.id
  const { data: existing } = await supabase.from('cart').select('*').eq('user_id', user_id).eq('product_id', p.id).limit(1).maybeSingle()
  if(existing) await supabase.from('cart').update({ qty: existing.qty+1 }).eq('id', existing.id)
  else await supabase.from('cart').insert({ user_id, product_id: p.id })

  if(showNotif) showMessage('Added to cart')
}

// Buy Now without showing notification
async function buyNow(){
  if(!sessionValue.value.user){ showMessage('Please login first!'); return }
  await addToCart(false)   // <-- no notification
  const modalEl = document.getElementById('cartModal')
  const modal = new bootstrap.Modal(modalEl)
  modal.show()
}

async function toggleWishlist(){
  if(!sessionValue.value.user){ showMessage('Please login first!'); return }
  const p = product.value
  if(!p) return
  const idx = wishlist.value.findIndex(i=>i.id===p.id)
  if(idx>=0){
    wishlist.value.splice(idx,1)
    await supabase.from('wishlist').delete().eq('user_id', sessionValue.value.user.id).eq('product_id', p.id)
    saveWishlist()
    showMessage('Removed from wishlist')
  } else {
    wishlist.value.push({ id:p.id, title:p.title, price:Number(p.price||0) })
    await supabase.from('wishlist').insert({ user_id: sessionValue.value.user.id, product_id: p.id })
    saveWishlist()
    showMessage('Added to wishlist')
  }
}

function changeQty(item, delta){
  const idx = cart.value.findIndex(i=>i.id===item.id)
  if(idx<0) return
  cart.value[idx].qty += delta
  if(cart.value[idx].qty <= 0) cart.value.splice(idx,1)
  saveCart()
}

async function submitOrder(){
  if(!sessionValue.value.user || !cart.value.length) return
  const { name, email, phone, address } = userDetails.value
  if(!name || !email || !phone || !address){ showMessage('All fields required'); return }
  const orderItems = cart.value.map(i=>({ id:i.id, title:i.title, price:i.price, qty:i.qty }))
  const totalAmount = orderItems.reduce((sum,i)=>sum+i.price*i.qty,0)
  const order_id = 'ORD-'+Date.now()
  const { error } = await supabase.from('orders').insert([{
    order_id, user_id: sessionValue.value.user.id,
    name,email,phone,address,
    items:orderItems, total: totalAmount, status:'placed', payment_status:'pending'
  }])
  if(error){ showMessage('Failed to place order'); return }
  cart.value=[]
  saveCart()
  showMessage('✅ Order placed successfully!')
  const modalEl = document.getElementById('cartModal')
  bootstrap.Modal.getInstance(modalEl)?.hide()
}
</script>

<style scoped>
.carousel-nav{
  position:absolute;
  top:45%;
  transform:translateY(-50%);
  z-index:10;
  opacity:0.7;
  width:32px;
  height:32px;
  padding:0;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:1.2rem;
}
.carousel-nav.left{ left:5px; }
.carousel-nav.right{ right:5px; }
.carousel-nav:hover{ opacity:1; }
.cursor-pointer{ cursor:pointer; }
.object-fit-contain{ object-fit:contain; }
</style>
