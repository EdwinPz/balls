const KEY = 'ff_data_v1';

const seedPosts = [
  { id:'p1', title:'Smoky Chili Crunch Tacos', category:'Recipe', excerpt:'Weeknight heat in 20 minutes.', body:'Mix chili oil, lime juice, and garlic. Roast veggies and finish with citrus slaw.', tags:['tacos','spicy'], comments:[] },
  { id:'p2', title:'Spice Layering 101', category:'Tips', excerpt:'How to build flavor depth.', body:'Bloom spices in oil, then add aromatic base before acids and fresh herbs.', tags:['tips'], comments:[] }
];

function load() {
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);
  const initial = { users: [], currentUser: null, posts: seedPosts, chat: [], newsletter: [], visits: {}, cookieCredits: Number(getCookie('ff_guest_credits')||'0') };
  localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
}
function save(data){ localStorage.setItem(KEY, JSON.stringify(data)); }
function getCookie(name){ return document.cookie.split('; ').find(v=>v.startsWith(name+'='))?.split('=')[1]; }
function setCookie(name,val){ document.cookie = `${name}=${val}; path=/; max-age=2592000`; }

let db = load();

const creditCount = document.getElementById('credit-count');
const authState = document.getElementById('auth-state');
const logoutBtn = document.getElementById('logout-btn');

function user() { return db.users.find(u=>u.id===db.currentUser) || null; }
function addCredits(n, reason) {
  const u = user();
  if (u) { u.credits += n; u.creditLog.push({ at: new Date().toISOString(), amount: n, reason }); }
  else { db.cookieCredits += n; setCookie('ff_guest_credits', db.cookieCredits); }
  save(db); render();
}

function renderAuth() {
  const u = user();
  authState.textContent = u ? `Logged in as ${u.username}` : 'Not logged in (guest mode active)';
  logoutBtn.style.display = u ? 'inline-block' : 'none';
  creditCount.textContent = u ? u.credits : db.cookieCredits;
}

function renderBlog() {
  const wrap = document.getElementById('posts');
  wrap.innerHTML = '';
  db.posts.forEach(post => {
    const el = document.createElement('article');
    el.className = 'post';
    el.innerHTML = `<p>${post.category} • ${post.tags.join(', ')}</p><h3>${post.title}</h3><p>${post.excerpt}</p><p>${post.body}</p><div class="row"><a target="_blank" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}">Share</a></div><div class="stack"><textarea placeholder="Comment" data-cmt="${post.id}"></textarea><button data-add="${post.id}">Comment (+1 credit)</button></div><div id="comments-${post.id}"></div>`;
    wrap.appendChild(el);
    const cWrap = el.querySelector(`#comments-${post.id}`);
    post.comments.forEach(c => {
      const cEl = document.createElement('div');
      cEl.className='comment';
      cEl.innerHTML = `<strong>${c.user}</strong>: ${c.text} <small>${c.time}</small> <button data-report="${post.id}:${c.id}" class="ghost">Report</button>`;
      if (user() && c.userId===user().id) cEl.innerHTML += ` <button data-del="${post.id}:${c.id}" class="ghost">Delete</button>`;
      cWrap.appendChild(cEl);
    });
  });
}

function renderKitchen() {
  const preview = document.getElementById('kitchen-preview');
  const u = user();
  const k = u?.kitchen || { wall:'#f9e4c8', counter:'wood', appliance:'stainless', decor:'plants' };
  const counterMap = { wood:'#855c3a', granite:'#808285', marble:'#c3c4ca' };
  const appMap = { stainless:'#b9bcc1', 'retro-purple':'#9f7cff', 'matte-black':'#222' };
  preview.style.background = k.wall;
  preview.style.setProperty('--counter', counterMap[k.counter]);
  preview.style.setProperty('--appliance', appMap[k.appliance]);
  preview.innerHTML = `<div class="decor">${k.decor}</div><div class="appliance"></div>`;
  document.getElementById('k-wall').value = k.wall;
  document.getElementById('k-counter').value = k.counter;
  document.getElementById('k-appliance').value = k.appliance;
  document.getElementById('k-decor').value = k.decor;
}

function renderChat() {
  const box = document.getElementById('chat-box');
  box.innerHTML = db.chat.slice(-100).map(m=>`<p><strong>${m.user}</strong>: ${m.text} <small>${m.time}</small></p>`).join('');
  box.scrollTop = box.scrollHeight;
}

function renderGallery() {
  const g = document.getElementById('gallery');
  const u = user();
  g.innerHTML = '';
  if (!u) return;
  document.getElementById('bio').value = u.bio || '';
  u.images.forEach((src, i) => {
    const w = document.createElement('div');
    w.innerHTML = `<img src="${src}" alt="upload ${i+1}"/><button data-rmimg="${i}" class="ghost">Delete</button>`;
    g.appendChild(w);
  });
}

function render() { renderAuth(); renderBlog(); renderKitchen(); renderChat(); renderGallery(); }

function currentDay(){ return new Date().toISOString().slice(0,10); }
function dailyVisitReward(){
  const u = user();
  const key = u ? `user:${u.id}` : 'guest';
  if (db.visits[key] !== currentDay()) {
    db.visits[key] = currentDay();
    addCredits(3, 'daily_visit');
  }
}

document.getElementById('register-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const username = f.get('username').trim();
  const password = f.get('password');
  if (db.users.some(u=>u.username.toLowerCase()===username.toLowerCase())) return alert('Username taken');
  const id = crypto.randomUUID();
  db.users.push({ id, username, password, credits: 10, bio:'', images:[], creditLog:[], kitchen:{ wall:'#f9e4c8', counter:'wood', appliance:'stainless', decor:'plants' }});
  db.currentUser = id;
  save(db); addCredits(0,'register'); render();
});

document.getElementById('login-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const u = db.users.find(x=>x.username===f.get('username') && x.password===f.get('password'));
  if (!u) return alert('Invalid login');
  db.currentUser = u.id; save(db); dailyVisitReward(); render();
});

logoutBtn.addEventListener('click', ()=>{ db.currentUser = null; save(db); render(); });

document.addEventListener('click', (e)=>{
  if (e.target.dataset.add) {
    const pid = e.target.dataset.add;
    const ta = document.querySelector(`[data-cmt='${pid}']`);
    const text = ta.value.trim(); if (!text) return;
    const p = db.posts.find(x=>x.id===pid);
    p.comments.push({ id: crypto.randomUUID(), user:user()?.username || 'guest', userId:user()?.id || null, text, time:new Date().toLocaleString(), flagged:false });
    ta.value=''; addCredits(1, 'comment'); save(db); render();
  }
  if (e.target.dataset.del) {
    const [pid,cid]=e.target.dataset.del.split(':');
    const p = db.posts.find(x=>x.id===pid); p.comments=p.comments.filter(c=>c.id!==cid); save(db); render();
  }
  if (e.target.dataset.report) {
    const [pid,cid]=e.target.dataset.report.split(':');
    const c = db.posts.find(x=>x.id===pid).comments.find(c=>c.id===cid); c.flagged=true; alert('Reported to moderation placeholder'); save(db);
  }
  if (e.target.dataset.rmimg) {
    user().images.splice(Number(e.target.dataset.rmimg),1); save(db); render();
  }
});

document.getElementById('save-kitchen').addEventListener('click', ()=>{
  const u = user(); if (!u) return alert('Login required');
  u.kitchen = { wall:document.getElementById('k-wall').value, counter:document.getElementById('k-counter').value, appliance:document.getElementById('k-appliance').value, decor:document.getElementById('k-decor').value };
  save(db); render();
});
document.getElementById('reset-kitchen').addEventListener('click', ()=>{
  const u = user(); if (!u) return alert('Login required');
  u.kitchen = { wall:'#f9e4c8', counter:'wood', appliance:'stainless', decor:'plants' };
  save(db); render();
});

document.getElementById('chat-form').addEventListener('submit',(e)=>{
  e.preventDefault();
  const val = document.getElementById('chat-input').value.trim(); if (!val) return;
  const banned = ['badword'];
  let text = val;
  banned.forEach(b=> text = text.replaceAll(new RegExp(b,'ig'),'***'));
  db.chat.push({ user:user()?.username || 'guest', text, time:new Date().toLocaleTimeString() });
  document.getElementById('chat-input').value='';
  save(db); render();
});

document.getElementById('save-bio').addEventListener('click', ()=>{
  const u=user(); if(!u) return alert('Login required');
  u.bio=document.getElementById('bio').value.slice(0,200); save(db);
});

document.getElementById('image-upload').addEventListener('change',(e)=>{
  const u=user(); if(!u) return alert('Login required');
  const file=e.target.files[0]; if(!file) return;
  if (!file.type.startsWith('image/')) return alert('Images only');
  if (file.size > 2*1024*1024) return alert('Max 2MB');
  const r = new FileReader();
  r.onload = () => { u.images.push(String(r.result)); addCredits(2,'upload_image'); save(db); render(); };
  r.readAsDataURL(file);
});

document.getElementById('newsletter-form').addEventListener('submit',(e)=>{
  e.preventDefault();
  db.newsletter.push({ email: document.getElementById('newsletter-email').value, at: new Date().toISOString() });
  save(db); alert('Subscribed (placeholder)');
});

dailyVisitReward();
render();
