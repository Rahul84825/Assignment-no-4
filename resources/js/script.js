    const services = [
      { id: 1, name: 'Dry Cleaning', price: 200, icon: '🧼', iconLabel: 'Dry cleaning' },
      { id: 2, name: 'Wash & Fold', price: 100, icon: '🧺', iconLabel: 'Wash and fold' },
      { id: 3, name: 'Ironing', price: 30, icon: '🧷', iconLabel: 'Ironing' },
      { id: 4, name: 'Stain Removal', price: 500, icon: '✨', iconLabel: 'Stain removal' },
      { id: 5, name: 'Leather & Suede Cleaning', price: 999, icon: '🧥', iconLabel: 'Leather and suede cleaning' },
      { id: 6, name: 'Wedding Dress Cleaning', price: 2800, icon: '👗', iconLabel: 'Wedding dress cleaning' }
    ];

    const servicesList = document.getElementById('servicesList');
    const cartBody = document.getElementById('cartBody');
    const totalAmountEl = document.getElementById('totalAmount');

    let cart = JSON.parse(localStorage.getItem('laundry_cart') || '[]');

    function formatINR(n){
      return '₹' + Number(n).toFixed(2);
    }

    function renderServices(){
      servicesList.innerHTML = '';
      services.forEach(s=>{
        const li = document.createElement('li');
        li.className = 'service';
        li.innerHTML = `
          <div class="left">
            <div class="icon" role="img" aria-label="${s.iconLabel}">${s.icon}</div>
            <div class="title"><span class="name">${s.name}</span><span class="price">${formatINR(s.price)}</span></div>
          </div>
          <div class="actions">
            <button class="btn btn-add" data-id="${s.id}" aria-label="Add ${s.name} to cart" aria-controls="cartTable">Add Item +</button>
            <button class="btn btn-remove" data-id="${s.id}" aria-label="Remove ${s.name} from cart" aria-controls="cartTable" style="display:none">Remove Item −</button>
          </div>
        `;
        servicesList.appendChild(li);
      });
      updateAddRemoveButtons();
    }

    function updateAddRemoveButtons(){
      const inCartIds = new Set(cart.map(i=>i.id));
      document.querySelectorAll('#servicesList .service').forEach(li=>{
        const addBtn = li.querySelector('.btn-add');
        const remBtn = li.querySelector('.btn-remove');
        const id = Number(addBtn.dataset.id);
        if(inCartIds.has(id)){
          addBtn.style.display = 'none';
          remBtn.style.display = 'inline-block';
          addBtn.setAttribute('aria-pressed','false');
          remBtn.setAttribute('aria-pressed','true');
        } else {
          addBtn.style.display = 'inline-block';
          remBtn.style.display = 'none';
          addBtn.setAttribute('aria-pressed','false');
          remBtn.setAttribute('aria-pressed','false');
        }
      });
    }

    function renderCart(){
      cartBody.innerHTML = '';
      if (cart.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td colspan="3" style="text-align: center;">No items added.</td>
        `;
        cartBody.appendChild(tr);
      } else {
        cart.forEach((item, idx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="width:30px">${idx+1}</td>
            <td>${item.name}</td>
            <td style="text-align:right">${formatINR(item.price)}</td>
          `;
          cartBody.appendChild(tr);
        });
      }
      const total = cart.reduce((s,it)=>s+it.price,0);
      totalAmountEl.textContent = formatINR(total);
      localStorage.setItem('laundry_cart', JSON.stringify(cart));
      updateAddRemoveButtons();
    }

    function addToCart(id){
      const s = services.find(x=>x.id===id);
      if(!s) return;
      if(cart.some(x=>x.id === id)) return;
      cart.push({id:s.id,name:s.name,price:s.price});
      renderCart();
    }
    function removeFromCart(id){
      cart = cart.filter(x=>x.id !== id);
      renderCart();
    }

    servicesList.addEventListener('click', function(e){
      if(e.target.matches('.btn-add')){
        const id = Number(e.target.dataset.id);
        addToCart(id);
      } else if(e.target.matches('.btn-remove')){
        const id = Number(e.target.dataset.id);
        removeFromCart(id);
      }
    });

    renderServices();
    renderCart();

    function bookService(){
      const target = document.querySelector('.booking-section');
      if(target){
        target.scrollIntoView({behavior:'smooth',block:'start'});
        const nameInput = document.getElementById('fullName');
        if(nameInput){
          setTimeout(()=>nameInput.focus(),500);
        }
      }
    }
    window.bookService = bookService;

    document.addEventListener('DOMContentLoaded', function() {
      if (window.emailjs) {
        emailjs.init({
          publicKey: "mlt4Xt8ZZoGDxN_Kj"
        });
      }

      const bookForm = document.getElementById('bookForm');
      const bookingMessage = document.getElementById('bookingMessage');

      if (bookForm) {
        bookForm.addEventListener('submit', function(event) {
          event.preventDefault(); 

          if (cart.length === 0) {
            bookingMessage.textContent = 'Your cart is empty. Please add services before booking.';
            bookingMessage.style.color = 'red';
            return; 
          }

          const serviceID = 'service_5zz2a8h';
          const templateID = 'template_hj3g8uu';

          const servicesText = cart.map(item => `- ${item.name}: ${formatINR(item.price)}`).join('\n');
          const totalAmount = totalAmountEl.textContent;

          const templateParams = {
            name: document.getElementById('fullName').value,
            to_email: document.getElementById('emailId').value,
            phone: document.getElementById('phone').value,
            cart_items: `${servicesText}\n\nTotal: ${totalAmount}`
          };

          emailjs.send(serviceID, templateID, templateParams)
            .then(function(response) {
              console.log('SUCCESS!', response.status, response.text);
              bookingMessage.textContent = 'Thank you! Your booking has been sent successfully.';
              bookingMessage.style.color = 'green';
              bookForm.reset(); 
              cart = []; 
              renderCart(); 
            }, function(error) {
              console.log('FAILED...', error);
              bookingMessage.textContent = 'Failed to send booking. Please try again later.';
              bookingMessage.style.color = 'red';
            });
        });
      }
    });

    