document.addEventListener('DOMContentLoaded', () => {
    // HIDE PAGE LOADER WHEN ALL RESOURCES ARE LOADED
    const pageLoader = document.getElementById('page-loader');
    if(pageLoader){
        window.addEventListener('load', ()=>{
            pageLoader.classList.add('hidden');
            // remove after transition so it's not in the accessibility tree
            setTimeout(()=>{ try{ pageLoader.remove(); }catch(e){} }, 600);
        });
    }
    // NAV TOGGLE (mobile)
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if(navToggle && navMenu){
        navToggle.addEventListener('click', () => {
            const open = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active', open);
            navToggle.setAttribute('aria-expanded', String(open));
        });
        document.addEventListener('click', (e)=>{
            if(window.innerWidth <= 768 && !navMenu.contains(e.target) && !navToggle.contains(e.target)){
                navMenu.classList.remove('active'); navToggle.classList.remove('active'); navToggle.setAttribute('aria-expanded','false');
            }
        });
        document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ navMenu.classList.remove('active'); navToggle.classList.remove('active'); }});
    }

    // SMOOTH SCROLL for internal links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e){
            const href = this.getAttribute('href');
            if(href && href.length > 1){
                const target = document.querySelector(href);
                if(target){
                    e.preventDefault();
                    target.scrollIntoView({behavior:'smooth', block:'start'});
                }
            }
            // close mobile menu when navigating
            if(navMenu && navMenu.classList.contains('active')){
                navMenu.classList.remove('active');
                if(navToggle) navToggle.classList.remove('active');
            }
        });
    });

    // Buttons with data-target (hero buttons)
    document.querySelectorAll('[data-target]').forEach(btn => {
        btn.addEventListener('click', (e)=>{
            const target = btn.dataset.target;
            if(target){
                const el = document.querySelector(target);
                if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
            }
        });
    });

    // PROJECT FILTERS (data-category on projects) with accessible aria-pressed
    const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
    const projectCards = document.querySelectorAll('.project-card');

    // initialize aria-pressed
    filterBtns.forEach(btn => {
        btn.setAttribute('role', 'button');
        const isActive = btn.classList.contains('active');
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        // click handler
        btn.addEventListener('click', () => applyFilter(btn));
        // keyboard support
        btn.addEventListener('keydown', (e) => {
            if(e.key === 'Enter' || e.key === ' '){
                e.preventDefault();
                btn.click();
            }
        });
    });

    function applyFilter(selectedBtn){
        const filter = selectedBtn.dataset.filter;
        filterBtns.forEach(b => {
            const active = b === selectedBtn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        projectCards.forEach(card => {
            const cat = card.dataset.category || card.dataset.type;
            card.style.display = (filter === 'all' || cat === filter) ? '' : 'none';
        });
    }

    // APPLICATION FORM: show grade/department conditional fields
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const gradeGroup = document.getElementById('grade-group');
    const departmentGroup = document.getElementById('department-group');
    if(roleRadios.length){
        roleRadios.forEach(r => r.addEventListener('change', ()=>{
            if(r.checked){
                if(gradeGroup && departmentGroup){
                    if(r.value === 'student'){ gradeGroup.style.display='block'; departmentGroup.style.display='none'; }
                    else { gradeGroup.style.display='none'; departmentGroup.style.display='block'; }
                }
            }
        }));
    }

    // APPLICATION and CONTACT forms are informational on this page.
    // Form submissions use `mailto:` fallback (handled by browser email client) or can be wired
    // to a server/spreadsheet endpoint later. No client-side interception is performed here.

    // MURAL MODAL trigger
    const muralBtn = document.getElementById('view-murals');
    const muralModal = document.getElementById('mural-modal');
    if(muralBtn && muralModal){
        muralBtn.addEventListener('click', ()=>{ muralModal.style.display='block'; document.body.style.overflow='hidden'; });
        const muralClose = muralModal.querySelector('.modal-close');
        if(muralClose) muralClose.addEventListener('click', ()=>{ muralModal.style.display='none'; document.body.style.overflow=''; });
        muralModal.addEventListener('click', (e)=>{ if(e.target === muralModal){ muralModal.style.display='none'; document.body.style.overflow=''; }});
    }

    // BACK TO TOP
    const backBtn = document.getElementById('back-to-top');
    if(backBtn){
        window.addEventListener('scroll', ()=>{ backBtn.style.display = window.scrollY > 300 ? 'block' : 'none'; });
        backBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
    }

    // SCROLL-TRIGGERED ANIMATIONS USING INTERSECTION OBSERVER
    const animateTargets = document.querySelectorAll('[data-animate]');
    if('IntersectionObserver' in window && animateTargets.length){
        const animObserver = new IntersectionObserver((entries)=>{
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    const el = entry.target;
                    const delay = parseInt(el.getAttribute('data-animate-delay') || '0', 10);
                    setTimeout(()=> el.classList.add('in-view'), delay);
                    animObserver.unobserve(el);
                }
            });
        }, { threshold: 0.15 });
        animateTargets.forEach(el => animObserver.observe(el));
    } else {
        // fallback: reveal all
        animateTargets.forEach(el => el.classList.add('in-view'));
    }

    // COUNT-UP STATS
    const countUpElements = document.querySelectorAll('.stat-number[data-count], .stat-number');
    function animateCount(el, end, duration = 1000){
        let start = 0;
        const range = end - start;
        let startTime = null;
        function step(timestamp){
            if(!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = Math.floor(progress * range + start);
            el.textContent = value.toString();
            if(progress < 1) requestAnimationFrame(step);
            else el.textContent = end.toString();
        }
        requestAnimationFrame(step);
    }

    if('IntersectionObserver' in window && countUpElements.length){
        const countObserver = new IntersectionObserver((entries)=>{
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    const numEl = entry.target;
                    const target = parseInt(numEl.closest('.stat-item')?.getAttribute('data-count') || numEl.getAttribute('data-count') || numEl.textContent || '0', 10) || 0;
                    animateCount(numEl, target, 1200);
                    countObserver.unobserve(numEl);
                }
            });
        }, { threshold: 0.5 });
        countUpElements.forEach(el => countObserver.observe(el));
    } else {
        countUpElements.forEach(el => {
            const target = parseInt(el.getAttribute('data-count') || el.textContent || '0', 10) || 0;
            el.textContent = target;
        });
    }

    // UNIQUE VISITOR COUNTER: prefer contacting local server; fallback to localStorage per browser
    const visitServerGet = 'http://localhost:3000/count';
    const visitServerPost = 'http://localhost:3000/visit';

    function updateParticipantDisplay(n){
        const item = document.querySelector('.stat-item[data-count]');
        if(!item) return;
        const raw = item.getAttribute('data-count') || String(n);
        const plus = /\+$/.test(raw) ? '+' : '';
        const display = `${n}${plus}`;
        const numEl = item.querySelector('.stat-number');
        if(numEl) numEl.textContent = display;
    }

    // fetchWithRetry helper
    async function fetchWithRetry(url, opts = {}, retries = 3, backoff = 300){
        for(let i=0;i<=retries;i++){
            try{
                const res = await fetch(url, opts);
                if(!res.ok) throw new Error(`HTTP ${res.status}`);
                return res;
            }catch(err){
                if(i === retries) throw err;
                await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)));
            }
        }
    }

    (async function(){
        const key = 'selc_unique_visitor_v1';
        const globalKey = 'selc_global_visits_v1';
        const statusEl = document.getElementById('visitor-status');
        function setStatus(msg, kind='info'){
            if(!statusEl) return;
            statusEl.textContent = msg;
            statusEl.className = `stat-status ${kind}`;
        }

        // show loading state
        setStatus('Loading count...', 'loading');

        // First: try to GET current count with retry
        try{
            const res = await fetchWithRetry(visitServerGet, {}, 2, 200);
            const json = await res.json();
            const serverCount = (typeof json.count === 'number') ? json.count : null;
            if(serverCount !== null){
                updateParticipantDisplay(serverCount);
                setStatus('Connected — showing live count', 'ok');

                // If this browser hasn't been counted, POST to increment (optimistic)
                const already = localStorage.getItem(key);
                if(!already){
                    try{
                        setStatus('Recording your visit...', 'loading');
                        const post = await fetchWithRetry(visitServerPost, { method: 'POST' }, 2, 300);
                        const pjson = await post.json();
                        if(pjson && typeof pjson.count === 'number'){
                            updateParticipantDisplay(pjson.count);
                            localStorage.setItem(key, '1');
                            setStatus('Thanks — your visit counted', 'ok');
                        } else {
                            setStatus('Connected, but server response invalid', 'error');
                        }
                    }catch(e){
                        setStatus('Unable to record visit (server error).', 'error');
                    }
                } else {
                    setStatus('Welcome back — already counted today', 'muted');
                }
                return;
            }
        }catch(e){
            setStatus('Server unreachable — using fallback', 'warning');
        }

        // SERVER unreachable → fallback to localStorage method (best-effort)
        try{
            const rawGlobal = localStorage.getItem(globalKey);
            let currentGlobal = (rawGlobal === null) ? 579 : (parseInt(rawGlobal || '0', 10) || 579);
            const already = localStorage.getItem(key);
            if(!already){
                const next = currentGlobal + 1;
                localStorage.setItem(globalKey, String(next));
                localStorage.setItem(key, '1');
                updateParticipantDisplay(next);
                setStatus('Offline mode — visit recorded locally', 'warning');
            } else {
                updateParticipantDisplay(currentGlobal);
                setStatus('Offline mode — showing last known count', 'muted');
            }
        }catch(e){ setStatus('Unable to read local storage.', 'error'); }
    })();

    // COOKIE CONSENT BANNER (stores choice but does not block counting)
    const cookieKey = 'selc_cookie_consent_v1';
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAccept = document.getElementById('cookie-accept');
    const cookieDecline = document.getElementById('cookie-decline');

    function showCookieBanner(){
        if(!cookieBanner) return;
        cookieBanner.hidden = false;
    }

    function hideCookieBanner(){
        if(!cookieBanner) return;
        cookieBanner.hidden = true;
    }

    try{
        const existing = localStorage.getItem(cookieKey);
        if(!existing){
            // show the banner if no choice stored
            showCookieBanner();
        }
    }catch(e){
        // storage not available — still show banner
        showCookieBanner();
    }

    if(cookieAccept){
        cookieAccept.addEventListener('click', ()=>{
            try{ localStorage.setItem(cookieKey, 'accepted'); }catch(e){}
            hideCookieBanner();
        });
    }
    if(cookieDecline){
        cookieDecline.addEventListener('click', ()=>{
            try{ localStorage.setItem(cookieKey, 'declined'); }catch(e){}
            hideCookieBanner();
        });
    }

    // (hero toggle removed) hero paragraph is rendered directly in HTML and handled by CSS only

    // Simple toast helper for tiny notifications
    const toastContainer = document.getElementById('toast-container');
    function showToast(message, timeout = 3500){
        try{
            if(!toastContainer) return; const t = document.createElement('div');
            t.className = 'toast'; t.textContent = message; toastContainer.appendChild(t);
            setTimeout(()=> t.classList.add('visible'), 50);
            setTimeout(()=>{ t.classList.remove('visible'); setTimeout(()=> t.remove(), 350); }, timeout);
        }catch(e){ console.warn('toast failed', e); }
    }

    // Newsletter form uses `mailto:` fallback; no client-side interception to keep page informational.
});
