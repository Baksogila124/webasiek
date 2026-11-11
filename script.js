(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sorotan mengikuti kursor
  var hero = document.querySelector('.hero');
  hero.addEventListener('pointermove', function(e){
    var r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  // Kartu foto 3D
  var card = document.getElementById('card');
  if(!reduce){
    card.addEventListener('pointermove', function(e){
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left)/r.width - .5, y = (e.clientY - r.top)/r.height - .5;
      card.style.transform = 'perspective(800px) rotateY(' + (x*18) + 'deg) rotateX(' + (-y*18) + 'deg)';
      card.style.setProperty('--gx', (x+.5)*100 + '%');
      card.style.setProperty('--gy', (y+.5)*100 + '%');
    });
    card.addEventListener('pointerleave', function(){ card.style.transform = ''; });
  }

  // Jaringan partikel interaktif
  var cv = document.getElementById('net'), cx = cv.getContext('2d'), pts = [], bursts = [], mp = {x:-999,y:-999};
  function size(){ cv.width = hero.offsetWidth; cv.height = hero.offsetHeight; var n = Math.min(70, Math.round(cv.width/16)); pts = []; for(var i=0;i<n;i++) pts.push({x:Math.random()*cv.width,y:Math.random()*cv.height,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4}); }
  size(); window.addEventListener('resize', size); window.addEventListener('load', size);
  hero.addEventListener('pointermove', function(e){ var r = hero.getBoundingClientRect(); mp.x = e.clientX-r.left; mp.y = e.clientY-r.top; });
  hero.addEventListener('pointerleave', function(){ mp.x = mp.y = -999; });
  function draw(){
    var col = getComputedStyle(document.documentElement).getPropertyValue('--cobalt').trim() || '#2B50FF';
    cx.clearRect(0,0,cv.width,cv.height); cx.fillStyle = col; cx.strokeStyle = col;
    pts.forEach(function(p,i){
      var dx = p.x-mp.x, dy = p.y-mp.y, d = Math.sqrt(dx*dx+dy*dy);
      if(d > 0 && d < 140){ p.x += dx/d*1.2; p.y += dy/d*1.2; }
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>cv.width) p.vx *= -1;
      if(p.y<0||p.y>cv.height) p.vy *= -1;
      cx.globalAlpha = .7; cx.beginPath(); cx.arc(p.x,p.y,2,0,6.283); cx.fill();
      for(var j=i+1;j<pts.length;j++){ var q = pts[j], a = p.x-q.x, b = p.y-q.y, dd = Math.sqrt(a*a+b*b); if(dd<110){ cx.globalAlpha = (1-dd/110)*.35; cx.beginPath(); cx.moveTo(p.x,p.y); cx.lineTo(q.x,q.y); cx.stroke(); } }
    });
    bursts = bursts.filter(function(b){ return b.life > 0; });
    bursts.forEach(function(b){ b.x += b.vx; b.y += b.vy; b.vy += .08; b.life -= 1; cx.globalAlpha = Math.min(Math.max(b.life/50,0),1); cx.fillStyle = b.c; cx.beginPath(); cx.arc(b.x,b.y,3,0,6.283); cx.fill(); });
    if(!reduce) requestAnimationFrame(draw);
  }
  draw();

  // Bilah progres scroll
  var bar = document.getElementById('bar');
  window.addEventListener('scroll', function(){ var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h>0 ? scrollY/h : 0) + ')'; }, {passive:true});

  // Teks peran yang diketik
  var roles = ['Mahasiswa Sistem Informasi','Staf administrasi data','Pengelola data pelanggan'], ri = 0, ci = 0, del = false, rl = document.getElementById('role');
  function type(){
    var w = roles[ri];
    if(reduce){ rl.textContent = w; ri = (ri+1)%roles.length; setTimeout(type,2500); return; }
    ci += del ? -1 : 1; rl.textContent = w.slice(0,ci);
    var t = del ? 40 : 90;
    if(!del && ci === w.length){ del = true; t = 1400; } else if(del && ci === 0){ del = false; ri = (ri+1)%roles.length; t = 300; }
    setTimeout(type,t);
  }
  type();

  // Kursor khusus dan tombol magnetik
  var cur = document.getElementById('cur');
  if(!reduce && matchMedia('(hover:hover)').matches){
    window.addEventListener('pointermove', function(e){ cur.style.transform = 'translate('+e.clientX+'px,'+e.clientY+'px)'; });
    document.querySelectorAll('a,button,.card3d,.skills li').forEach(function(el){ el.addEventListener('pointerenter', function(){ cur.classList.add('big'); }); el.addEventListener('pointerleave', function(){ cur.classList.remove('big'); }); });
    document.querySelectorAll('.btn').forEach(function(b){
      b.addEventListener('pointermove', function(e){ var r = b.getBoundingClientRect(); b.style.transform = 'translate('+((e.clientX-r.left-r.width/2)*.25)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)'; });
      b.addEventListener('pointerleave', function(){ b.style.transform = ''; });
    });
  } else { cur.style.display = 'none'; }

  // Mode terang/gelap
  document.getElementById('theme').addEventListener('click', function(){
    var root = document.documentElement, dark = getComputedStyle(root).colorScheme === 'dark';
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    if(reduce) draw();
  });

  // Muncul saat di-scroll
  if('IntersectionObserver' in window && !reduce){
    var rv = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ var t = e.target; t.classList.add('in'); rv.unobserve(t); setTimeout(function(){ t.style.transitionDelay = ''; }, 1000); } }); }, {threshold:.15});
    document.querySelectorAll('.proj,.row>*').forEach(function(el,i){ el.classList.add('reveal'); el.style.transitionDelay = (i%3)*90 + 'ms'; rv.observe(el); });
  }

  // Cahaya di kartu proyek
  document.querySelectorAll('.proj').forEach(function(el){ el.addEventListener('pointermove', function(e){ var r = el.getBoundingClientRect(); el.style.setProperty('--px', (e.clientX-r.left) + 'px'); el.style.setProperty('--py', (e.clientY-r.top) + 'px'); if(!reduce && matchMedia('(hover:hover)').matches){ var x = (e.clientX-r.left)/r.width - .5, y = (e.clientY-r.top)/r.height - .5; el.style.transform = 'perspective(900px) rotateY(' + (x*6) + 'deg) rotateX(' + (-y*6) + 'deg) translateY(-6px)'; } }); el.addEventListener('pointerleave', function(){ el.style.transform = ''; }); });

  // Ledakan titik saat hero diklik
  hero.addEventListener('click', function(e){
    if(reduce || e.target.closest('a,button')) return;
    var r = hero.getBoundingClientRect(), cols = ['#FFD84D','#2B50FF','#7C93FF'];
    for(var i=0;i<28;i++){ var a = Math.random()*6.283, s = 2 + Math.random()*4; bursts.push({x:e.clientX-r.left,y:e.clientY-r.top,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:50+Math.random()*30,c:cols[i%3]}); }
  });

  // Nama besar bergeser saat di-scroll
  var bn = document.querySelector('.bigname span');
  if(!reduce){ window.addEventListener('scroll', function(){ var r = bn.parentNode.getBoundingClientRect(); bn.style.setProperty('--sx', ((innerHeight - r.top)*-.8 + 300) + 'px'); }, {passive:true}); }

  // Parallax lencana
  var pw = document.querySelector('.photo-wrap');
  if(!reduce){ hero.addEventListener('pointermove', function(e){ pw.style.setProperty('--bx', (e.clientX/innerWidth - .5)*40); pw.style.setProperty('--by', (e.clientY/innerHeight - .5)*40); }); }

  // Penanda bagian aktif
  var dl = document.querySelectorAll('.dots a');
  if('IntersectionObserver' in window){
    var so = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ dl.forEach(function(a){ a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); }); } }); }, {rootMargin:'-45% 0px -50% 0px'});
    ['atas','pengalaman','proyek','keahlian','pendidikan','kontak'].forEach(function(id){ var s = document.getElementById(id); if(s) so.observe(s); });
  }

  // Unduh CV
  var toastTimer;
  function say(t){
    var el = document.getElementById('toast');
    if(!el){ el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role','status'); document.body.appendChild(el); }
    el.textContent = t; el.style.display = 'block';
    clearTimeout(toastTimer); toastTimer = setTimeout(function(){ el.style.display = 'none'; }, 4500);
  }
  
  // Formulir pesan
  var cf = document.getElementById('cform');
  cf.addEventListener('submit', function(e){
    e.preventDefault();
    var d = new FormData(cf);
    var body = 'Nama: ' + d.get('nama') + '\nEmail: ' + d.get('email') + '\n\n' + d.get('pesan');
    var url = 'https://mail.google.com/mail/?view=cm&to=alifrrahman29@gmail.com&su=' + encodeURIComponent(d.get('subjek')) + '&body=' + encodeURIComponent(body);
    window.open(url, '_blank', 'noopener');
    say('Gmail terbuka di tab baru. Tekan Kirim di sana untuk mengirim pesan.');
  });

  // Lagu Spotify: tempel link lagu dari Spotify di antara tanda kutip
  var SPOTIFY_URL = 'https://open.spotify.com/track/7g9wCeUwy03JavOtqZEvX2?si=a5b2f52c07fc4fc1';
  var spm = String(SPOTIFY_URL).match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/);
  ['video','vmodal'].forEach(function(id){ var o = document.getElementById(id); if(o) o.remove(); });
  var lagu = document.getElementById('lagu');
  if(!lagu){
    var anc = document.getElementById('cv') || document.querySelector('.bigname');
    if(anc){
      lagu = document.createElement('section'); lagu.id = 'lagu'; lagu.className = 'row';
      lagu.innerHTML = '<h2>Lagu</h2><div class="spot" id="spot"></div>';
      anc.parentNode.insertBefore(lagu, anc);
    }
  }
  var spot = document.getElementById('spot');
  if(spot){
    var sst = document.createElement('style');
    sst.textContent = '.spot{max-width:720px}.spot iframe{width:100%;border:0;border-radius:16px;display:block}.spot.empty{border:2px dashed var(--line);border-radius:16px;padding:2rem;color:var(--muted);text-align:center}.spnote{margin:.8rem 0 0;color:var(--muted);font-size:.9rem}';
    document.head.appendChild(sst);
    if(spm){
      var sh = (spm[1] === 'track' || spm[1] === 'episode') ? 152 : 352;
      spot.innerHTML = '<iframe title="Pemutar Spotify" src="https://open.spotify.com/embed/' + spm[1] + '/' + spm[2] + '?utm_source=generator" height="' + sh + '" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe><p class="spnote">Kalau belum masuk ke Spotify di browser ini, biasanya yang terputar cuplikan 30 detik.</p>';
    } else {
      spot.classList.add('empty'); spot.textContent = 'Tempel link lagu Spotify di script.js (SPOTIFY_URL)';
    }
  }

  // Salin email
  var cp = document.getElementById('copy');
  cp.addEventListener('click', function(){
    var t = 'alifrrahman29@gmail.com';
    function ok(){ cp.textContent = 'Tersalin ✓'; setTimeout(function(){ cp.textContent = 'Salin email'; }, 2000); }
    function fb(){ var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); ok(); } catch(e){ cp.textContent = t; } document.body.removeChild(a); }
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(ok, fb); } else fb();
  });

  // Marquee
  var words = ['Input data','Verifikasi data','Excel','Google Sheets','Pengelolaan website','Rekap laporan','Teliti'];
  var html = ''; for(var k=0;k<2;k++){ words.forEach(function(w){ html += '<span>' + w + '</span><span>✦</span>'; }); }
  document.getElementById('track').innerHTML = html + html;
  var mq = document.querySelector('.marquee'), t2 = document.getElementById('track').cloneNode(true);
  t2.removeAttribute('id'); t2.classList.add('rev'); mq.appendChild(t2);

  // Hitung angka saat terlihat
  var nums = document.querySelectorAll('[data-to]');
  function count(el){
    var to = +el.dataset.to, t0 = null;
    if(reduce){ el.textContent = to; return; }
    function step(t){ if(!t0) t0 = t; var p = Math.min((t - t0)/1400, 1); el.textContent = Math.round(to*(1 - Math.pow(1-p,3))) + (p === 1 && to === 99 ? '' : ''); if(p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ count(e.target); io.unobserve(e.target); } }); }, {threshold:.6});
    nums.forEach(function(n){ io.observe(n); });
  } else { nums.forEach(function(n){ n.textContent = n.dataset.to; }); }
})();
