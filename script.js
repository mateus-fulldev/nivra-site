const API_URL='https://nivra-backend-s09l.onrender.com/api';
let products=[],cart=[],currentPage='home',prevPage='home',currentFilter='all',selectedProduct=null;
document.addEventListener('DOMContentLoaded',function(){carregarProdutos();updateCartUI();window.addEventListener('scroll',handleScroll);});
async function carregarProdutos(){try{const r=await fetch(API_URL+'/produtos');const d=await r.json();if(d.produtos&&d.produtos.length){products=d.produtos.map(function(p){return Object.assign({},p,{image:p.images&&p.images[0]?p.images[0]:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',originalPrice:p.original_price,scarcity:p.stock<=5,bestseller:p.badge==='Mais Vendido'});});}}catch(e){console.log(e);}renderBestsellers();renderAllProducts();}
function handleScroll(){var h=document.getElementById('header');if(window.scrollY>40)h.style.borderBottomColor='rgba(0,0,0,0.1)';else h.style.borderBottomColor='var(--gray-200)';}
function showPage(p){prevPage=currentPage;document.querySelectorAll('.page').forEach(function(x){x.classList.remove('active');});document.getElementById('page-'+p).classList.add('active');currentPage=p;window.scrollTo({top:0,behavior:'smooth'});closeNavMobile();}
function goBack(){showPage(prevPage==='product-detail'?'products':prevPage);}
function filterAndGo(c){currentFilter=c;showPage('products');setTimeout(function(){renderAllProducts(c);},100);}
document.getElementById('navToggle').addEventListener('click',function(){document.getElementById('mainNav').classList.toggle('open');});
function closeNavMobile(){document.getElementById('mainNav').classList.remove('open');}
function renderBestsellers(){var g=document.getElementById('bestsellersGrid');var b=products.filter(function(p){return p.bestseller||p.badge==='Mais Vendido';}).slice(0,4);g.innerHTML=(b.length?b:products.slice(0,4)).map(function(p){return productCard(p);}).join('');}
function renderAllProducts(f){f=f||currentFilter;var g=document.getElementById('allProductsGrid');var l=f==='all'?products:products.filter(function(p){return p.category===f;});g.innerHTML=l.map(function(p){return productCard(p);}).join('');}
function catLabel(c){return{casual:'Casual',fitness:'Fitness',feminino:'Feminino',masculino:'Masculino',lancamentos:'Lancamentos',camisetas:'Camisetas',calcas:'Calcas',acessorios:'Acessorios'}[c]||c;}
function productCard(p){var img=p.image||(p.images&&p.images[0])||'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600';var orig=p.originalPrice?'<span class=product-original>R$ '+Number(p.originalPrice).toFixed(2).replace('.',',')+'</span>':'';var badge=p.badge||(p.scarcity?'Ultimas':null);var bHTML=badge?'<div class=product-badge>'+badge+'</div>':'';return '<div class=product-card onclick=openProduct("'+p.id+'")><div class=product-img>'+bHTML+'<img src='+img+' loading=lazy><div class=product-quick-add onclick=event.stopPropagation();quickAdd("'+p.id+'")>+ Adicionar</div></div><div class=product-info><p class=product-category>'+catLabel(p.category)+'</p><h3 class=product-name>'+p.name+'</h3><p class=product-price>R$ '+Number(p.price).toFixed(2).replace('.',',')+orig+'</p></div></div>';}
function openProduct(id){selectedProduct=products.find(function(p){return String(p.id)===String(id);});if(!selectedProduct)return;var p=selectedProduct;var img=p.image||(p.images&&p.images[0])||'';var orig=p.originalPrice?'<span class=product-original>De R$ '+Number(p.originalPrice).toFixed(2).replace('.',',')+'</span>':'';var sizes=(p.sizes||[]).map(function(s){return '<button class=size-btn onclick=selectSize(this)>'+s+'</button>';}).join('');var feats=(p.features||[]).map(function(f){return '<li>'+f+'</li>';}).join('');document.getElementById('productDetailContent').innerHTML='<div class=detail-images><div class=detail-main-img><img src='+img+'></div></div><div class=detail-info><p class=detail-category>'+catLabel(p.category)+'</p><h1 class=detail-name>'+p.name+'</h1><p class=detail-price>R$ '+Number(p.price).toFixed(2).replace('.',',')+orig+'</p><p class=detail-desc>'+(p.description||'')+'</p><div><p class=size-label>Tamanho</p><div class=size-grid>'+sizes+'</div></div><button class=detail-add-btn onclick=addToCartFromDetail()>Adicionar ao Carrinho</button><div class=detail-features><h4>Caracteristicas</h4><ul>'+feats+'</ul></div></div>';var rel=products.filter(function(x){return String(x.id)!==String(p.id)&&x.category===p.category;}).slice(0,3);document.getElementById('relatedGrid').innerHTML=rel.map(function(x){return productCard(x);}).join('');showPage('product-detail');}
function selectSize(b){b.closest('.size-grid').querySelectorAll('.size-btn').forEach(function(x){x.classList.remove('active');});b.classList.add('active');}
function addToCartFromDetail(){if(selectedProduct)addToCart(selectedProduct.id);}
function addToCart(id){var p=products.find(function(x){return String(x.id)===String(id);});if(!p)return;var e=cart.find(function(x){return String(x.id)===String(id);});if(e)e.qty++;else cart.push(Object.assign({},p,{qty:1}));updateCartUI();showToast(p.name+' adicionado!');}
function quickAdd(id){addToCart(id);}
function removeFromCart(id){cart=cart.filter(function(x){return String(x.id)!==String(id);});updateCartUI();}
function updateQty(id,d){var i=cart.find(function(x){return String(x.id)===String(id);});if(!i)return;i.qty+=d;if(i.qty<=0)removeFromCart(id);else updateCartUI();}
function updateCartUI(){var n=cart.reduce(function(s,i){return s+i.qty;},0);var c=document.getElementById('cartCount');c.textContent=n;c.classList.toggle('visible',n>0);var el=document.getElementById('cartItems');var fl=document.getElementById('cartFooter');if(!cart.length){el.innerHTML='<p class=empty-cart>Carrinho vazio.</p>';fl.style.display='none';return;}el.innerHTML=cart.map(function(i){return '<div class=cart-item><div class=cart-item-img><img src='+(i.image||'')+' alt='+i.name+'></div><div><p class=cart-item-name>'+i.name+'</p><p class=cart-item-price>R$ '+Number(i.price).toFixed(2).replace('.',',')+'</p><div class=cart-item-qty><button class=qty-btn onclick=updateQty("'+i.id+'",-1)>-</button><span class=qty-num>'+i.qty+'</span><button class=qty-btn onclick=updateQty("'+i.id+'",1)>+</button></div></div><button class=cart-remove onclick=removeFromCart("'+i.id+'")>x</button></div>';}).join('');var t=cart.reduce(function(s,i){return s+i.price*i.qty;},0);document.getElementById('cartTotal').textContent='R$ '+t.toFixed(2).replace('.',',');fl.style.display='block';}
function toggleCart(){document.getElementById('cartSidebar').classList.toggle('open');document.getElementById('cartOverlay').classList.toggle('open');}
function checkout(){
  if(!cart.length)return;
  var modal = document.getElementById('checkoutModal');
  var content = modal.querySelector('.modal-success');
  if(!content) return;
  content.innerHTML = '<div class=checkmark>...</div><h2>Processando...</h2>';
  modal.style.display='flex';
  var itens = cart.map(function(i){return{produto_id:i.id,quantidade:i.qty,tamanho:i.selectedSize||null};});
  var email = prompt('Digite seu e-mail para confirmar o pedido:');
  if(!email){modal.style.display='none';return;}
  var nome = prompt('Digite seu nome:');
  var endereco = {cep:'00000-000',street:'A definir',number:'0',district:'A definir',city:'A definir',state:'SP'};
  fetch('https://nivra-backend-s09l.onrender.com/api/pedidos',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({itens:itens,endereco:endereco,metodo_pagamento:'mercadopago',email_cliente:email,nome_cliente:nome||email})
  }).then(function(r){return r.json();}).then(function(d){
    if(d.pedido){
      cart=[];updateCartUI();
      toggleCart();
      content.innerHTML = '<div class=checkmark>checkmark</div><h2>Pedido Confirmado!</h2><p>Obrigado pela sua compra!</p><p class=order-num>Pedido #'+d.pedido.id.slice(0,8).toUpperCase()+'</p><button class=btn-primary onclick=closeModal()>Continuar Comprando</button>';
    } else {
      content.innerHTML = '<h2>Erro!</h2><p>'+(d.erro||'Tente novamente')+'</p><button class=btn-primary onclick=closeModal()>Fechar</button>';
    }
  }).catch(function(){
    content.innerHTML = '<h2>Erro de conexao</h2><p>Tente novamente.</p><button class=btn-primary onclick=closeModal()>Fechar</button>';
  });
}
function closeModal(){document.getElementById('checkoutModal').style.display='none';showPage('home');}
function filterProducts(f,b){currentFilter=f;document.querySelectorAll('.filter-btn').forEach(function(x){x.classList.remove('active');});b.classList.add('active');renderAllProducts(f);}
function showToast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2800);}
function submitContact(){var n=document.getElementById('cName').value;var e=document.getElementById('cEmail').value;var m=document.getElementById('cMessage').value;if(!n||!e||!m){showToast('Preencha todos os campos.');return;}showToast('Mensagem enviada!');document.getElementById('cName').value='';document.getElementById('cEmail').value='';document.getElementById('cMessage').value='';}