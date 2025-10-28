        const PIZZAS = [
            { id: 'pepperoni', name: 'Pepperoni', price: 12.50, tags: ['spicy'], desc: 'Mozzarella, pepperoni, tomato sauce', img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop' },
            { id: 'bbq', name: 'BBQ Chicken', price: 13.90, tags: ['meat'], desc: 'Chicken, BBQ sauce, mozzarella, onion', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop' },
            { id: 'Spicy', name: 'Spicy', price: 12.90, tags: ['spicy'], desc: 'Spicy salami, tomato sauce, mozzarella', img: 'https://images.unsplash.com/photo-1547609434-b732edfee020?q=80&w=800&auto=format&fit=crop' },
        ];

        const fmt = new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' });
        const $ = (sel, root = document) => root.querySelector(sel);
        const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

        const CART_KEY = 'pizza_primo_cart_v1';
        const state = {
            cart: loadCart(),
            query: ''
        };

        function loadCart() {
            try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return [] }
        }
        function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); }

        function renderMenu() {
            const list = $('#menu');
            list.innerHTML = '';
            const q = state.query.trim().toLowerCase();
            const items = PIZZAS.filter(p => !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)));

            items.forEach(p => {
                const el = document.createElement('article');
                el.className = 'item';
                el.innerHTML = `
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        <div>
          <h3>${p.name}${p.tags?.length ? `<span class="badge">${p.tags.join(', ')}</span>` : ''}</h3>
          <p>${p.desc}</p>
          <div class="actions">
            <span class="price">${fmt.format(p.price)}</span>
            <button class="btn primary" data-add="${p.id}">Добави</button>
          </div>
        </div>
      `;
                list.appendChild(el);
            });

            list.addEventListener('click', onAddClick);
        }

        function onAddClick(e) {
            const btn = e.target.closest('[data-add]');
            if (!btn) return;
            const id = btn.getAttribute('data-add');
            const pizza = PIZZAS.find(p => p.id === id);
            if (!pizza) return;
            const existing = state.cart.find(i => i.id === id);
            if (existing) existing.qty += 1;
            else state.cart.push({ id, name: pizza.name, price: pizza.price, img: pizza.img, qty: 1 });
            saveCart();
            renderCart();
            flashCartCount();
        }

        function renderCart() {
            const list = $('#cartList');
            const empty = $('#cartEmpty');
            const summary = $('#summary');
            const count = state.cart.reduce((a, i) => a + i.qty, 0);
            $('#cartCount').textContent = count;
            list.innerHTML = '';

            if (state.cart.length === 0) {
                empty.hidden = false; summary.hidden = true; return;
            }

            empty.hidden = true; summary.hidden = false;

            let subtotal = 0;
            state.cart.forEach(item => {
                subtotal += item.price * item.qty;
                const row = document.createElement('div');
                row.className = 'cart-row';
                row.innerHTML = `
        <img src="${item.img}" alt="${item.name}" />
        <div>
          <p class="cart-title">${item.name}</p>
          <p class="muted">${fmt.format(item.price)} / бр.</p>
          <div class="qty" data-id="${item.id}">
            <button class="icon-btn" data-dec>–</button>
            <span aria-live="polite">${item.qty}</span>
            <button class="icon-btn" data-inc>+</button>
            <button class="del" data-del>Премахни</button>
          </div>
        </div>
        <strong>${fmt.format(item.price * item.qty)}</strong>
      `;
                list.appendChild(row);
            });

            $('#subtotal').textContent = fmt.format(subtotal);
            $('#grandTotal').textContent = fmt.format(subtotal);
        }

        $('#cartList').addEventListener('click', e => {
            const wrap = e.target.closest('.qty');
            if (!wrap) return;
            const id = wrap.getAttribute('data-id');
            const item = state.cart.find(i => i.id === id);
            if (!item) return;

            if (e.target.matches('[data-inc]')) item.qty += 1;
            if (e.target.matches('[data-dec]')) item.qty = Math.max(1, item.qty - 1);
            if (e.target.matches('[data-del]')) {
                state.cart = state.cart.filter(i => i.id !== id);
            }
            saveCart();
            renderCart();
        });

        $('#search').addEventListener('input', (e) => { state.query = e.target.value; renderMenu(); });

        $('#cartJump').addEventListener('click', () => {
            $('#cart').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        function flashCartCount() {
            const pill = $('#cartCount');
            pill.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(1)' }
            ], { duration: 300, easing: 'ease-out' });
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderMenu();
            renderCart();
            $('#year').textContent = new Date().getFullYear();
        });