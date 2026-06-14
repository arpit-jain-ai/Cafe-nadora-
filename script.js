/* ============================================================
   Singhai Cafe — script.js
   All Interactive JavaScript Logic
   Developed by: Arpit Jain (Demo Version)
   ============================================================ */
  const API_URL = "http://localhost:5000";
/* ============================================================
   1. LOADING SCREEN
   ============================================================ */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2200);
});

/* ============================================================
   2. NAVBAR — Scroll Effect & Mobile Toggle
   ============================================================ */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 80);
});

function toggleMenu() {
  const links = document.getElementById('navLinks');
  links.classList.toggle('open');
}

/* ============================================================
   3. FLOATING COFFEE BEANS (Hero Animation)
   ============================================================ */
const beansContainer = document.getElementById('beans');
for (let i = 0; i < 15; i++) {
  const bean = document.createElement('div');
  bean.className = 'floating-bean';
  bean.style.cssText = `
    left: ${Math.random() * 100}%;
    animation-duration: ${6 + Math.random() * 8}s;
    animation-delay: ${Math.random() * 8}s;
    width: ${6 + Math.random() * 6}px;
    height: ${10 + Math.random() * 8}px;
  `;
  beansContainer.appendChild(bean);
}

/* ============================================================
   4. MENU DATA
   ============================================================ */
const menuItems = [
  // ☕ Coffee
  { name: 'Espresso',         cat: 'coffee',    price: 99,  emoji: '☕', desc: 'Rich & bold single shot',              cal: '5 kcal',   veg: true, badge: 'Popular'   },
  { name: 'Cappuccino',       cat: 'coffee',    price: 149, emoji: '☕', desc: 'Velvety foam, perfect balance',         cal: '120 kcal', veg: true, badge: 'Bestseller'},
  { name: 'Café Latte',       cat: 'coffee',    price: 159, emoji: '☕', desc: 'Smooth espresso & steamed milk',        cal: '150 kcal', veg: true                     },
  { name: 'Hazelnut Latte',   cat: 'coffee',    price: 189, emoji: '☕', desc: 'Nutty sweetness in every sip',          cal: '180 kcal', veg: true, badge: 'Must Try'  },
  { name: 'Cold Coffee',      cat: 'coffee',    price: 169, emoji: '🥤', desc: 'Chilled & refreshing classic',          cal: '200 kcal', veg: true                     },

  // 🍝 Italian
  { name: 'Alfredo Pasta',    cat: 'italian',   price: 249, emoji: '🍝', desc: 'Creamy parmesan perfection',            cal: '520 kcal', veg: true, badge: 'Signature' },
  { name: 'Arrabiata Pasta',  cat: 'italian',   price: 229, emoji: '🍝', desc: 'Spicy tomato, roasted garlic',          cal: '480 kcal', veg: true                     },
  { name: 'White Sauce Pasta',cat: 'italian',   price: 239, emoji: '🍝', desc: 'Rich béchamel with herbs',              cal: '510 kcal', veg: true                     },
  { name: 'Panini Sandwich',  cat: 'italian',   price: 199, emoji: '🥖', desc: 'Grilled, crispy, loaded with love',     cal: '380 kcal', veg: true, badge: 'Popular'   },
  { name: 'Garlic Bread',     cat: 'italian',   price: 129, emoji: '🍞', desc: 'Herb butter & toasted perfection',      cal: '280 kcal', veg: true                     },

  // 🍕 Pizza
  { name: 'Margherita Pizza', cat: 'pizza',     price: 299, emoji: '🍕', desc: 'Classic tomato & mozzarella',           cal: '680 kcal', veg: true, badge: 'Classic'   },
  { name: 'Farmhouse Pizza',  cat: 'pizza',     price: 349, emoji: '🍕', desc: 'Farm-fresh veggies & cheese',           cal: '720 kcal', veg: true, badge: 'Popular'   },
  { name: 'Veggie Delight',   cat: 'pizza',     price: 329, emoji: '🍕', desc: 'Loaded with seasonal vegetables',       cal: '700 kcal', veg: true                     },

  // 🍔 Burgers
  { name: 'Veg Burger',       cat: 'burger',    price: 179, emoji: '🍔', desc: 'Crispy patty, fresh veggies',           cal: '420 kcal', veg: true                     },
  { name: 'Cheese Burger',    cat: 'burger',    price: 199, emoji: '🍔', desc: 'Double cheese, signature sauce',        cal: '480 kcal', veg: true, badge: 'Popular'   },

  // 🥢 Chinese
  { name: 'Hakka Noodles',    cat: 'chinese',   price: 189, emoji: '🍜', desc: 'Wok-tossed, full of flavour',           cal: '440 kcal', veg: true                     },
  { name: 'Schezwan Noodles', cat: 'chinese',   price: 199, emoji: '🍜', desc: 'Fiery & aromatic Schezwan',             cal: '460 kcal', veg: true, badge: 'Spicy'     },

  // 🍰 Desserts
  { name: 'Cheesecake',       cat: 'dessert',   price: 179, emoji: '🍰', desc: 'New York style, velvety smooth',        cal: '380 kcal', veg: true, badge: 'Signature' },
  { name: 'Waffles',          cat: 'dessert',   price: 199, emoji: '🧇', desc: 'Belgian waffles with maple syrup',      cal: '420 kcal', veg: true, badge: 'Must Try'  },
  { name: 'Pastries',         cat: 'dessert',   price: 89,  emoji: '🥐', desc: 'Freshly baked every morning',           cal: '280 kcal', veg: true                     },

  // 🧋 Beverages
  { name: 'Chocolate Shake',  cat: 'beverages', price: 199, emoji: '🥤', desc: 'Thick, rich, indulgent',                cal: '360 kcal', veg: true, badge: 'Popular'   },
  { name: 'Mango Mocktail',   cat: 'beverages', price: 169, emoji: '🧃', desc: 'Fresh mango with mint & lime',          cal: '180 kcal', veg: true                     },
  { name: 'Iced Tea',         cat: 'beverages', price: 129, emoji: '🧊', desc: 'Refreshing peach or lemon',             cal: '80 kcal',  veg: true                     },
];

let activeCart = [];
let favs = new Set();
let currentCat = 'all';

/* ============================================================
   5. MENU RENDER & FILTER
   ============================================================ */
function renderMenu(items) {
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';

  if (!items.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">No items found. Try a different search.</div>';
    return;
  }

  items.forEach((item, idx) => {
    const isFav = favs.has(idx);
    grid.innerHTML += `
      <div class="menu-card reveal" style="transition-delay:${idx % 6 * 0.05}s" data-idx="${idx}">
        <div class="menu-card-img" style="padding:2rem">
          ${item.badge ? `<span class="menu-badge${item.veg ? ' veg' : ''}">${item.veg ? 'VEG' : item.badge}</span>` : ''}
          <span style="font-size:3.5rem">${item.emoji}</span>
          <span class="menu-fav${isFav ? ' active' : ''}" onclick="toggleFav(${idx},this)" title="Favourite">♥</span>
        </div>
        <div class="menu-card-body">
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          <div class="menu-calories">🔥 ${item.cal}</div>
          <div class="menu-card-footer" style="margin-top:0.75rem">
            <div class="menu-price"><sup>₹</sup>${item.price}</div>
            <button class="add-btn" onclick="addToCart(${idx})" title="Add to order">+</button>
          </div>
        </div>
      </div>`;
  });
  observeReveal();
}

function setMenuCat(btn, cat) {
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  currentCat = cat;
  filterMenu();
}

function filterMenu() {
  const q = document.getElementById('menuSearch').value.toLowerCase();
  const filtered = menuItems.filter(item => {
    const matchCat    = currentCat === 'all' || item.cat === currentCat;
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
  renderMenu(filtered);
}

/* ============================================================
   6. CART & FAVOURITES
   ============================================================ */
function toggleFav(idx, el) {
  if (favs.has(idx)) favs.delete(idx);
  else favs.add(idx);
  el.classList.toggle('active');
}

function addToCart(idx) {
  activeCart.push(menuItems[idx]);
  const total = activeCart.reduce((a, i) => a + i.price, 0);
  const btn = event.target;
  btn.innerHTML = '✓';
  btn.style.background = '#4CAF50';
  setTimeout(() => { btn.innerHTML = '+'; btn.style.background = 'var(--gold)'; }, 1500);
  showCartToast(menuItems[idx].name, total);
}

function showCartToast(name, total) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.style.cssText = `
      position: fixed; bottom: 8rem; left: 50%; transform: translateX(-50%);
      background: var(--bg-card); border: 1px solid var(--border-gold);
      border-radius: 4px; padding: 0.75rem 1.5rem; font-size: 0.82rem;
      color: var(--cream); z-index: 9999; transition: opacity 0.3s;
      display: flex; gap: 1rem; align-items: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <span style="color:var(--gold)">✓</span> ${name} added ·
    <a href="https://wa.me/917999588503?text=I'd+like+to+order:+${encodeURIComponent(activeCart.map(i => i.name).join(', '))}"
       target="_blank" style="color:var(--gold)">Order via WhatsApp (₹${total})</a>
  `;
  toast.style.opacity = '1';
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 4000);
}

/* ============================================================
   7. GALLERY
   ============================================================ */
const galleryItems = [
  { emoji: '🍕', label: 'Margherita Pizza',  h: 220 },
  { emoji: '☕', label: 'Latte Art',          h: 280 },
  { emoji: '🍝', label: 'Alfredo Pasta',      h: 200 },
  { emoji: '🍰', label: 'Cheesecake',         h: 240 },
  { emoji: '🥐', label: 'Fresh Pastries',     h: 180 },
  { emoji: '🧇', label: 'Belgian Waffles',    h: 260 },
  { emoji: '🍔', label: 'Cheese Burger',      h: 200 },
  { emoji: '☕', label: 'Cappuccino Art',      h: 300 },
  { emoji: '🍹', label: 'Summer Mocktail',    h: 220 },
];

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  galleryItems.forEach(item => {
    grid.innerHTML += `
      <div class="gallery-item" onclick="openLightbox('${item.emoji}','${item.label}')">
        <div class="gallery-item-inner"
             style="height:${item.h}px;font-size:4rem;flex-direction:column;gap:1rem;display:flex">
          <span>${item.emoji}</span>
          <span style="font-family:var(--font-display);font-size:0.85rem;color:var(--text-secondary)">${item.label}</span>
        </div>
        <div class="gallery-overlay">
          <div class="gallery-overlay-icon">⊕</div>
        </div>
      </div>`;
  });
}

function openLightbox(emoji, label) {
  const lb = document.createElement('div');
  lb.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.9);
    z-index: 9999; display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 1rem; cursor: pointer;
  `;
  lb.innerHTML = `
    <div style="font-size:8rem">${emoji}</div>
    <div style="font-family:var(--font-display);font-size:1.5rem;color:var(--cream)">${label}</div>
    <div style="font-size:0.75rem;color:var(--text-muted);margin-top:1rem">Click anywhere to close</div>
  `;
  lb.onclick = () => lb.remove();
  document.body.appendChild(lb);
}

/* ============================================================
   8. REVIEWS CAROUSEL
   ============================================================ */
const reviews = [
  { name: 'Priya Sharma',  avatar: 'PS', date: '2 weeks ago',  rating: 5, text: 'Absolutely stunning café! The Alfredo pasta melted in my mouth and the cappuccino was world-class. The ambience is perfect for a date night. Will definitely return!' },
  { name: 'Rahul Verma',   avatar: 'RV', date: '1 month ago',  rating: 5, text: "Nadora AI helped me plan the perfect anniversary dinner. The staff was incredibly attentive and the food was phenomenal. The cheesecake is the best in Bhopal!" },
  { name: 'Ananya Singh',  avatar: 'AS', date: '3 weeks ago',  rating: 5, text: "As a coffee lover, I've been to many cafes in Bhopal, but Café Nadora truly stands apart. The hazelnut latte is divine and the bakery items are fresh every single day." },
  { name: 'Vikram Patel',  avatar: 'VP', date: '1 week ago',   rating: 4, text: 'Great place to work from! Fast WiFi, comfortable seating, excellent coffee. The cold coffee is super refreshing. Would recommend to all work-from-café people in the city.' },
  { name: 'Shreya Joshi',  avatar: 'SJ', date: '2 months ago', rating: 5, text: "We celebrated my daughter's birthday here and it was magical! The team decorated the table beautifully, the custom cake was perfect. 10/10 for the experience." },
  { name: 'Arjun Mishra',  avatar: 'AM', date: '3 days ago',   rating: 5, text: "The pizza is genuinely wood-fire quality and the pasta rivals any Italian restaurant I've been to in bigger cities. Bhopal needed a place like this. Brilliant!" },
];

let carouselIdx = 0;

function renderReviews() {
  const track = document.getElementById('reviewsTrack');
  reviews.forEach(r => {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    track.innerHTML += `
      <div class="review-card">
        <div class="reviewer-row">
          <div class="reviewer-avatar">${r.avatar}</div>
          <div>
            <div class="reviewer-name">${r.name}</div>
            <div style="color:var(--gold);font-size:0.8rem">${stars}</div>
            <div class="reviewer-date">${r.date} · Google Review</div>
          </div>
        </div>
        <p class="review-text">${r.text}</p>
      </div>`;
  });
}

function moveCarousel(dir) {
  const track = document.getElementById('reviewsTrack');
  const cards = track.querySelectorAll('.review-card');
  const cardW = 340;
  carouselIdx = Math.max(0, Math.min(cards.length - 3, carouselIdx + dir));
  track.style.transform = `translateX(-${carouselIdx * (cardW + 24)}px)`;
}

/* ============================================================
   9. COUNTER ANIMATION (Stats in About Section)
   ============================================================ */
function animateCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target   = parseInt(el.dataset.target);
    const duration = 2000;
    const step     = target / 60;
    let current    = 0;

    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + (current >= target ? '+' : '');
      if (current >= target) clearInterval(interval);
    }, duration / 60);
  });
}

/* ============================================================
   10. SCROLL REVEAL (IntersectionObserver API)
   ============================================================ */
function observeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Trigger counters when about section comes into view
        if (e.target.closest('#about') && !window.countersDone) {
          window.countersDone = true;
          animateCounters();
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(el => observer.observe(el));
}

/* ============================================================
   11. AI CHATBOT — Nadora AI
   ============================================================ */
const botResponses = {
  'what should i order': [
    'Our top picks right now: Alfredo Pasta (₹249), Hazelnut Latte (₹189), and Cheesecake (₹179). A crowd-favourite trio! 😍',
    'Try our Cappuccino + Margherita Pizza + Cheesecake combo — the ultimate Nadora experience! ☕🍕🍰',
  ],
  'coffee':             'Try our Hazelnut Latte (₹189) or the classic Cappuccino (₹149). Both are barista favourites! ☕',
  'coffee under ₹200':  'We have Espresso (₹99), Cappuccino (₹149), Café Latte (₹159), and Cold Coffee (₹169) — all under ₹200! ☕',
  'pasta':              'Our Alfredo Pasta (₹249) is our bestseller — creamy, rich, and divine! Arrabiata (₹229) is great if you like it spicy 🍝',
  'pizza':              'Our Farmhouse Pizza (₹349) is a crowd-pleaser. For classics, the Margherita (₹299) never fails! 🍕',
  'date night':         'Romantic menu: Panini → Alfredo Pasta → Mango Mocktail → Cheesecake. Total ~₹850 for two! 💑✨',
  'suggest a date night menu': 'Perfect date night: Garlic Bread & Panini to start, Alfredo Pasta as main, Hazelnut Latte & Mango Mocktail to drink, Cheesecake to finish. ~₹850 for two! 💕',
  'birthday party':     'Birthday packages start at ₹1,999! Custom cakes, decorations & dedicated server. <a href="https://wa.me/917999588503?text=Birthday party booking" target="_blank" style="color:var(--gold)">Book via WhatsApp →</a> 🎂',
  'birthday party package': 'Birthday packages start at ₹1,999 — custom cake slice, table decoration, dedicated server & a birthday surprise! <a href="https://wa.me/917999588503?text=Birthday party booking" target="_blank" style="color:var(--gold)">Book via WhatsApp →</a>',
  'reservation':        'Reserve your table via our <a href="#reservation" style="color:var(--gold)">booking form</a> or call <a href="tel:+917999588503" style="color:var(--gold)">+91 79995 88503</a> 📞',
  'timing':             'We\'re open daily from 11:00 AM to 11:00 PM, all 7 days! 🕐',
  'location':           'We\'re at Plot 131, Sahayog Vihar, Gulmohar Colony, Bhopal. <a href="https://maps.google.com" target="_blank" style="color:var(--gold)">Get Directions →</a> 📍',
  'default': [
    'Great question! Our team would love to help. <a href="https://wa.me/917999588503" target="_blank" style="color:var(--gold)">Chat on WhatsApp →</a>',
    'For personalised help, we\'re just a WhatsApp message away! <a href="https://wa.me/917999588503" target="_blank" style="color:var(--gold)">Message Us →</a>',
  ],
};

function toggleChat() {
  document.getElementById('chatWindow').classList.toggle('open');
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg   = input.value.trim();
  if (!msg) return;

  appendMsg(msg, 'user');
  input.value = '';

  setTimeout(() => {
    const key  = Object.keys(botResponses).find(k => msg.toLowerCase().includes(k));
    const resp = botResponses[key || 'default'];
    const reply = Array.isArray(resp) ? resp[Math.floor(Math.random() * resp.length)] : resp;
    appendMsg(reply, 'bot');
  }, 600);
}

function sendQuick(msg) {
  document.getElementById('chatInput').value = msg;
  sendChat();
}

function appendMsg(text, role) {
  const msgs = document.getElementById('chatMessages');
  const div  = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

/* ============================================================
   12. TABLE RESERVATION — WhatsApp Integration
   ============================================================ */
  async function submitReservation() {

  const reservationData = {
    name: document.getElementById("resName").value,
    phone: document.getElementById("resPhone").value,
    date: document.getElementById("resDate").value,
    time: document.getElementById("resTime").value,
    guests: Number(document.getElementById("resGuests").value),
    occasion: document.getElementById("resOccasion").value,
    specialRequest: document.getElementById("resRequests").value
  };

  try {

    const response = await fetch(
      "http://localhost:5000/api/reservations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reservationData)
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.success) {
      alert(data.message);
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
    alert("Backend Connection Failed");
  }
}

/* ============================================================
   13. EVENT BOOKING — WhatsApp Integration
   ============================================================ */
function bookEvent(name) {
  const wa = `https://wa.me/917999588503?text=Hello%20Café%20Nadora!%20I%27d%20like%20to%20book:%20${encodeURIComponent(name)}`;
  window.open(wa, '_blank');
}

/* ============================================================
   14. INIT — Run everything on DOM ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderMenu(menuItems);   // Render all menu items
  renderGallery();          // Render gallery grid
  renderReviews();          // Render reviews carousel
  observeReveal();          // Start scroll-reveal observer

  // Auto-rotate reviews carousel every 5 seconds
  setInterval(() => moveCarousel(1), 5000);
});
