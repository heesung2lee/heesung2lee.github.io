/* maps.js — ⑤ 지도/코스 모듈 (tour-base-maps)
   지도/코스/일정 22 funcs. 외부의존은 호스트 제공: syncDayVisuals countUp runTyping step type addHearts curLang + Leaflet L
   전역: CRS_USA CRS_CAN crsMapUsa crsMapKr map bounds curDay schedBuilt DAY_META DAYS PLAN_DATA
   booking 연동점: CRS_* + renderPlans() 결과가 예약 입력. */
function buildSchedule() {
 if (schedBuilt) return;
 schedBuilt = true;
 const L = curLang;
 const tabBar = document.getElementById('dayTabBar');
 const panels = document.getElementById('dayPanels');
 if (curDay < 0 || curDay >= DAYS.length) curDay = 0;

 // Phase band (bracket "rounds")
 const pb = document.getElementById('jPhaseBand');
 if (pb) pb.innerHTML = JPHASES.map((p, pi) => '<div class="jphase" id="jph' + pi + '">' + (L === 'ko' ? p.ko : p.en) + '</div>').join('');

 // Connected day nodes + connector links
 let railHTML = '';
 DAYS.forEach((day, i) => {
 const m = DAY_META[i] || { ic: '📍', tyk: '', tye: '' };
 const title = L === 'ko' ? day.ko : day.en;
 const type = L === 'ko' ? m.tyk : m.tye;
 const wk = day.weekend;
 if (i > 0) railHTML += '<div class="jlink" id="jlk' + i + '"></div>';
 railHTML += '<div class="jnode" id="dt' + i + '" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();this.click()}" onclick="switchDay(' + i + ')">'
 + '<div class="jn-top"><span class="jn-num">' + day.n + '</span></div>'
 + '<div class="jn-ttl">' + title + '</div>'
 + '<div class="jn-tag' + (wk ? ' wk' : '') + '">' + (wk ? (L === 'ko' ? '주말 · ' : 'WEEKEND · ') : '') + type + '</div>'
 + '</div>';
 });
 tabBar.innerHTML = railHTML;

 // Panels
 panels.innerHTML = '';
 DAYS.forEach((day, i) => {
 const panel = document.createElement('div');
 panel.className = 'dpanel' + (i === curDay ? ' act' : '');
 panel.id = 'dp' + i;
 panel.innerHTML = buildPanel(day, i);
 panels.appendChild(panel);
 });

 syncDayVisuals(curDay);
}
 
function buildPanel(day, i) {
 const L = curLang;
 
 // cost tags
 const tags = day.costs.map(c => {
 let cls = 't-fam';
    let label = c.t;
    if (c.t[0] === '$') { cls = 't-paid'; label = L === 'ko' ? '문의' : 'Inquire'; }
 return `<span class="dp-tag ${cls}">${label}</span>`;
 }).join('');
 const wk = day.weekend ? `<span class="dp-tag t-wk">WEEKEND</span>` : '';
 
 // rows
 const rows = day.rows.map((r, ri) => {
 let badge = '';
 const prevSpot = ri > 0 ? (day.rows[ri-1].spot || '') : '';
 if (r.badge === 'stay') badge = (prevSpot === '숙소') ? '' : `<span class="tl-badge b-stay"><span class="ico-hotel" style="display:inline-flex;margin-right:2px"></span>${L === 'ko' ? '숙소' : 'Stay'}</span>`;
 else if (r.badge === 'jc') badge = `<span class="tl-badge b-jc">${L==='ko'?'현지 맛집':'Local Fave'}</span>`;
 else if (r.badge === 'tbd') badge = `<span class="tl-badge b-tbd">${L === 'ko' ? '미정' : 'TBD'}</span>`;
 else if (r.badge && r.badge[0] === '$') {
 badge = '<span class="tl-badge b-inquire">' + (L === 'ko' ? '맞춤 견적' : 'Custom Quote') + '</span>';
 } else if (r.badge && r.badge !== '') badge = `<span class="tl-badge">${r.badge}</span>`;
 return `<div class="tl-item">
 <div class="tl-time">${r.time}</div>
 <div>
 <div class="tl-name">${L === 'ko' ? r.ko : r.en}</div>
 ${(r.spot && r.spot !== prevSpot) ? `<div class="tl-spot"><span class="ico-pin" style="display:inline-flex;margin-right:3px"></span>${r.spot}</div>` : ''}
 <div class="tl-note">${L === 'ko' ? r.note_ko : r.note_en}</div>
 ${badge}
 </div>
 </div>`;
 }).join('');
 
 const prev = i > 0
 ? `<button class="day-nav-btn" onclick="switchDay(${i-1})">← ${L==='ko'?'이전 날':'Previous'}</button>`
 : `<button class="day-nav-btn" disabled>←</button>`;
 const next = i < DAYS.length - 1
 ? `<button class="day-nav-btn" onclick="switchDay(${i+1})">${L==='ko'?'다음 날':'Next'} →</button>`
 : `<button class="day-nav-btn" disabled>→</button>`;
 
 return `
 <div class="dp-meta">
 <span class="dp-num">${day.n}</span>
 <span class="dp-date">${day.date}</span>
 ${tags}${wk}
 </div>
 <div class="dp-h">${L === 'ko' ? day.ko : day.en}</div>
 <div class="dp-route">${day.route || ""}</div>
 <div class="tl-list">${rows}</div>
 <div class="day-nav-row">${prev}${next}</div>`;
}
 
function switchDay(i) {
 curDay = i;
 document.querySelectorAll('.dpanel').forEach((p, j) => p.classList.toggle('act', j === i));
 syncDayVisuals(i);
 const tab = document.getElementById('dt' + i);
 const bar = document.getElementById('dayTabBar');
 if (tab && bar) {
 const targetScroll = tab.offsetLeft - (bar.offsetWidth / 2) + (tab.offsetWidth / 2);
 bar.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
 }
 // Scroll page to just below sticky header when switching days
 const sh = document.querySelector('.sched-sticky-header');
 const offset = sh ? sh.getBoundingClientRect().bottom + window.scrollY + 8 : 0;
 if (window.scrollY > offset) window.scrollTo({ top: offset, behavior: 'smooth' });
}
 
function rebuildSchedule() {
 schedBuilt = false;
 if (curPage === 'schedule') buildSchedule();
}
 
/* ══════════════════════════════
 PRICING
══════════════════════════════ */
function renderPlans() {
 const grid = document.getElementById('planGrid');
 if (!grid || grid.dataset.lang === curLang) return;
 grid.dataset.lang = curLang;
 const L = curLang;
 grid.innerHTML = `<div style="text-align:center;padding:22px 24px 6px;max-width:680px">
<p style="font-size:17px;color:#3d4854;line-height:1.8;margin:0 0 18px">
<span class="ko">⏳ 모든 투어는 맞춤형 프라이빗으로 진행됩니다.<br>일정·인원·예산에 맞춘 견적을 요청해 주세요.</span>
<span class="en">⏳ All tours are private and customized to your group.<br>Request a quote tailored to your dates, group size, and preferences.</span>
</p>`;
}
 
 
/* ══════════════════════════════
 LANGUAGE + CURRENCY
══════════════════════════════ */
var FLAG_US = '<svg viewBox="0 0 18 12" width="16" height="11" style="vertical-align:-1px;border-radius:2px"><rect width="18" height="12" fill="#fff"/><g fill="#b22234"><rect width="18" height="1"/><rect y="2" width="18" height="1"/><rect y="4" width="18" height="1"/><rect y="6" width="18" height="1"/><rect y="8" width="18" height="1"/><rect y="10" width="18" height="1"/></g><rect width="8" height="6.5" fill="#3c3b6e"/></svg>';
var FLAG_KR = '<svg viewBox="0 0 18 12" width="16" height="11" style="vertical-align:-1px;border-radius:2px"><rect width="18" height="12" fill="#fff"/><circle cx="9" cy="6" r="3" fill="#cd2e3a"/><path d="M9 3a3 3 0 0 1 0 6z" fill="#0047a0"/><g fill="#0b0b0b"><rect x="3.1" y="1.4" width="2.6" height=".42"/><rect x="3.1" y="2.24" width="2.6" height=".42"/><rect x="3.1" y="3.08" width="2.6" height=".42"/><rect x="12.3" y="1.4" width=".85" height=".42"/><rect x="14.05" y="1.4" width=".85" height=".42"/><rect x="12.3" y="2.24" width="2.6" height=".42"/><rect x="12.3" y="3.08" width=".85" height=".42"/><rect x="14.05" y="3.08" width=".85" height=".42"/><rect x="3.1" y="8.5" width="2.6" height=".42"/><rect x="3.1" y="9.34" width=".85" height=".42"/><rect x="4.85" y="9.34" width=".85" height=".42"/><rect x="3.1" y="10.18" width="2.6" height=".42"/><rect x="12.3" y="8.5" width=".85" height=".42"/><rect x="14.05" y="8.5" width=".85" height=".42"/><rect x="12.3" y="9.34" width=".85" height=".42"/><rect x="14.05" y="9.34" width=".85" height=".42"/><rect x="12.3" y="10.18" width=".85" height=".42"/><rect x="14.05" y="10.18" width=".85" height=".42"/></g></svg>';
function addMapLinks() {
 var maps = {
 'Heartwell Golf': 'https://maps.google.com/?q=Heartwell+Golf+Course+Long+Beach',
 'Skylinks': 'https://maps.google.com/?q=Skylinks+Golf+Course+Long+Beach',
 'Dad Miller': 'https://maps.google.com/?q=Dad+Miller+Golf+Course+Anaheim',
 'La Mirada': 'https://maps.google.com/?q=La+Mirada+Golf+Course',
 'Sandpiper': 'https://maps.google.com/?q=Sandpiper+Golf+Course+Santa+Barbara',
 'Alisal': 'https://maps.google.com/?q=Alisal+River+Course+Solvang',
 'Glen Ivy': 'https://maps.google.com/?q=Glen+Ivy+Golf+Club',
 'Golf Club of CA': 'https://maps.google.com/?q=Golf+Club+of+California+Fallbrook',
 'The Crossings': 'https://maps.google.com/?q=The+Crossings+Golf+Course+Carlsbad',
 'Elim': 'https://maps.google.com/?q=Elim+Hot+Springs+Warner+Springs',
 'Haskell': 'https://maps.google.com/?q=Haskells+Beach+Santa+Barbara',
 'Solvang': 'https://maps.google.com/?q=Solvang+California',
 'Bernardo Winery': 'https://maps.google.com/?q=Bernardo+Winery+San+Diego',
 'LAX': 'https://maps.google.com/?q=Los+Angeles+International+Airport',
 };
 document.querySelectorAll('.tl-spot').forEach(function(el) {
 var txt = el.textContent.trim();
 for (var k in maps) {
 if (txt.indexOf(k) > -1 && !el.querySelector('a')) {
 var a = document.createElement('a');
 a.href = maps[k];
 a.target = '_blank';
 a.rel = 'noopener noreferrer';
 a.style.cssText = 'font-size:9px;color:#aaa;margin-left:6px;text-decoration:none;vertical-align:middle';
 a.innerHTML = '<span class="ico-pin" style="display:inline-block;color:#aaa;font-size:16px"></span>';
 el.appendChild(a);
 break;
 }
 }
 });
}
 
/* ── #44 Enhanced price calculator: person selector ── */
/* ── #46 Skeleton loading for schedule ── */
function showScheduleSkeleton() {
 var panels = document.getElementById('dayPanels');
 if (!panels) return;
 panels.innerHTML = Array(3).fill(0).map(function() {
 return '<div style="padding:28px 24px"><div class="skeleton skeleton-line w60"></div><div class="skeleton skeleton-line w80"></div><div class="skeleton skeleton-block"></div></div>';
 }).join('');
}
 
/* ── #47 Swipe to close ham menu — 제거됨: 슬라이드로 인해 시트가 오른쪽으로 밀린 채 stuck되는 문제 방지. 메뉴 선택은 탭(tap)으로만. */

/* ── #48 Form autocomplete attributes ── */
(function(){
 var map = {
 'f-name': 'name',
 'f-email': 'email',
 'f-phone': 'tel',
 'f-msg': 'off',
 };
 for (var id in map) {
 var el = document.getElementById(id);
 if (el) el.setAttribute('autocomplete', map[id]);
 }
})();
 
/* ── #52 Phone tap-to-call ── */
(function(){
 document.querySelectorAll('.c-phone, [data-phone]').forEach(function(el) {
 var num = el.textContent.replace(/[^+0-9]/g,'');
 if (num) {
 el.style.cursor = 'pointer';
 el.onclick = function(){ window.location.href = 'tel:' + num; };
 }
 });
})();
 
/* ── #55 Haptic feedback on tap ── */
(function(){
 if (!navigator.vibrate) return;
 document.addEventListener('touchstart', function(e) {
 var el = e.target;
 var isBtn = el.matches('button,.btn-book,.dtab,.jnode,.nav-tab,.ham-item,.plan-btn,.soc-btn,.f-submit, a[href]');
 if (isBtn) {
 try { navigator.vibrate(8); } catch(err){}
 }
 }, { passive: true });
})();
 
/* ── #56 Typing effect on hero H1 ── */
(function(){
 var done = false;
 function runTyping() {
 if (done) return;
 done = true;
 var h1 = document.querySelector('.hero-slide.hero-h1.ko');
 if (!h1) return;
 var text = h1.textContent;
 h1.textContent = '';
 var cursor = document.createElement('span');
 cursor.className = 'typing-cursor';
 h1.appendChild(cursor);
 var i = 0;
 function type() {
 if (i < text.length) {
 cursor.insertAdjacentText('beforebegin', text[i++]);
 setTimeout(type, text[i-1] === '\n' ? 250 : 55 + Math.random()*30);
 } else {
 setTimeout(function(){ cursor.remove(); }, 900);
 }
 }
 setTimeout(type, 600);
 }
 if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', runTyping);
 } else {
 runTyping();
 }
})();
 
/* ── #57 Count-up animation on stats ── */
(function(){
 function countUp(el, target, duration) {
 var start = 0, startTime = null;
 function step(ts) {
 if (!startTime) startTime = ts;
 var p = Math.min((ts - startTime) / duration, 1);
 var ease = 1 - Math.pow(1 - p, 3);
 el.textContent = (target < 20 ? Math.round(ease * target) : Math.floor(ease * target)).toLocaleString() + (el.dataset.suffix || '');
 if (p < 1) requestAnimationFrame(step);
 else el.textContent = target.toLocaleString() + (el.dataset.suffix || '');
 }
 requestAnimationFrame(step);
 }
 var obs = new IntersectionObserver(function(entries) {
 entries.forEach(function(e) {
 if (!e.isIntersecting) return;
 var el = e.target;
 var target = parseInt(el.dataset.target);
 if (!isNaN(target)) countUp(el, target, 1800);
 obs.unobserve(el);
 });
 }, { threshold: 0.5 });
 // Run after stats render
 setTimeout(function() {
 document.querySelectorAll('.stat-val[data-target]').forEach(function(el) { obs.observe(el); });
 }, 500);
})();
 
/* ── #61 PWA Service Worker ── */
(function(){
 if ('serviceWorker' in navigator) {
 // Inline SW as blob for single-file deployment
 var swCode = [
 "const CACHE='resonate-v1';",
 "const ASSETS=['/'];",
 "self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));",
 "self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('/')))));",
 ].join('\n');
 var blob = new Blob([swCode], { type: 'application/javascript' });
 var swUrl = URL.createObjectURL(blob);
 navigator.serviceWorker.register(swUrl).catch(function(){});
 }
})();
 
/* ── #62 In-page search for schedule ── */
function initScheduleSearch() {
 var header = document.querySelector('.sched-sticky-header');
 if (!header || header.querySelector('#sched-search')) return;
 var wrap = document.createElement('div');
 wrap.style.cssText = 'padding:6px 16px 8px;';
 wrap.innerHTML = '<input id="sched-search" type="search" placeholder="일정 검색 (Search schedule)." autocomplete="off" style="width:100%;padding:8px 14px;border:1.5px solid #e0e0e0;border-radius:100px;font-size:13px;font-family:inherit;outline:none;background:#f8f8f8;box-sizing:border-box">';
 header.appendChild(wrap);
 var input = wrap.querySelector('#sched-search');
 input.addEventListener('input', function() {
 var q = input.value.trim().toLowerCase();
 if (!q) {
 document.querySelectorAll('.tl-item').forEach(function(el){ el.style.display=''; });
 document.querySelectorAll('.dpanel').forEach(function(p){ p.style.display=''; });
 return;
 }
 // Show days containing the search term
 document.querySelectorAll('.dpanel').forEach(function(panel, i) {
 var matches = panel.textContent.toLowerCase().indexOf(q) > -1;
 panel.style.display = matches ? '' : 'none';
 var tab = document.getElementById('dt' + i);
 if (tab) tab.style.opacity = matches ? '1' : '0.35';
 });
 });
}
 
/* ── #64 Bookmark hearts ── */
(function(){
 var saved = JSON.parse(localStorage.getItem('resonate-bookmarks') || '{}');
 function addHearts() {
 document.querySelectorAll('.dpanel').forEach(function(p, i) {
 if (p.querySelector('.bookmark-btn')) return;
 var btn = document.createElement('button');
 btn.className = 'bookmark-btn' + (saved['day'+i] ? ' saved' : '');
 btn.innerHTML = saved['day'+i] ? '♥' : '♡';
 btn.title = '즐겨찾기';
 btn.onclick = function(e) {
 e.stopPropagation();
 saved['day'+i] = !saved['day'+i];
 btn.className = 'bookmark-btn' + (saved['day'+i] ? ' saved' : '');
 btn.innerHTML = saved['day'+i] ? '♥' : '♡';
 btn.style.transform = 'scale(1.4)';
 setTimeout(function(){ btn.style.transform = ''; }, 200);
 localStorage.setItem('resonate-bookmarks', JSON.stringify(saved));
 };
 p.style.position = 'relative';
 p.insertBefore(btn, p.firstChild);
 });
 }
 })();
 
 
 
/* ── Wire #43 map links + #46 skeleton + #62 search into nav ── */
 
/* PC Dropdown */
var _dropTimer = null;
function crsCreateMap(containerId, courses) {
var map = L.map(containerId, {zoomControl:true, scrollWheelZoom:false, touchZoom:true, doubleClickZoom:true, dragging:true, attributionControl:true});
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>', subdomains:'abcd', maxZoom:19}).addTo(map);
courses.forEach(function(c) {
var icon = L.divIcon({className:'course-marker-icon', html:'<div class="course-marker">'+c.num+'</div>', iconSize:[28,28], iconAnchor:[14,14], popupAnchor:[0,-16]});
L.marker([c.lat, c.lng], {icon:icon}).addTo(map)
.bindPopup('<b>'+c.name+'</b><br>'+c.loc+'<br><a href="javascript:void(0)" onclick="crsScrollToCourse(\''+c.country+'\','+c.num+')" style="color:#d4af37;font-size:11px;text-decoration:underline">'+((curLang==='ko')?'코스 상세 보기 →':'View course →')+'</a>');
});
var bounds = L.latLngBounds(courses.map(function(c){ return [c.lat, c.lng]; }));
map.fitBounds(bounds, {padding:[40,40]});
// PC: Ctrl + 마우스휠 줌 (일반 휠은 페이지 스크롤 유지)
(function(){
var el = map.getContainer();
el.addEventListener('wheel', function(e){
if (!e.ctrlKey) return;
e.preventDefault();
var z = map.getZoom();
if (e.deltaY < 0) map.setZoom(Math.min(z + 1, map.getMaxZoom()));
else map.setZoom(Math.max(z - 1, map.getMinZoom()));
}, {passive:false});
})();
return {map:map, bounds:bounds};
}
function crsInitMaps() {
if (crsMapsInit || typeof L === 'undefined') return;
if (!document.getElementById('crsMapUsa')) return;
CRS_USA.forEach(function(c){ c.country = 'usa'; });
CRS_CAN.forEach(function(c){ c.country = 'canada'; });
var u = crsCreateMap('crsMapUsa', CRS_USA);
crsMapUsa = u.map; crsUsaBounds = u.bounds;
var cn = crsCreateMap('crsMapCan', CRS_CAN);
crsMapCan = cn.map; crsCanBounds = cn.bounds;
crsMapsInit = true;
}
function crsOnShow() {
crsInitMaps();
crsSwitch('usa', true);
if (document.getElementById('crsMapKr') && !crsMapKr) crsInitKrMap();
setTimeout(function() {
if (crsMapUsa) { crsMapUsa.invalidateSize(); crsMapUsa.fitBounds(crsUsaBounds, {padding:[40,40]}); }
if (crsMapCan) { crsMapCan.invalidateSize(); crsMapCan.fitBounds(crsCanBounds, {padding:[40,40]}); }
}, 80);
// reveal cards already in viewport
document.querySelectorAll('#pg-courses .course-card').forEach(function(card) {
var r = card.getBoundingClientRect();
if (r.top < window.innerHeight && r.bottom > 0) card.classList.add('revealed');
});
}
function crsInitKrMap() {
if (!document.getElementById('crsMapKr') || typeof L === 'undefined' || crsMapKr) return;
var map = L.map('crsMapKr', {zoomControl:true, scrollWheelZoom:false, touchZoom:true, attributionControl:true});
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>', subdomains:'abcd', maxZoom:18}).addTo(map);
var KR_MARKERS = [
{num:1,name:'La Vie Belle CC',loc:'Chuncheon, Gangwon-do',lat:37.92,lng:127.67},
{num:2,name:'Bear Creek GC',loc:'Chuncheon, Gangwon-do',lat:37.82,lng:127.72},
{num:3,name:'Seongmunan CC',loc:'Wonju, Gangwon-do',lat:37.34,lng:127.95},
{num:4,name:'Cascadia CC',loc:'Hongcheon, Gangwon-do',lat:37.70,lng:127.88},
{num:5,name:'Sagewood',loc:'Hongcheon, Gangwon-do',lat:37.8827,lng:128.1201},
{num:6,name:'Ferrum CC',loc:'Yeoju, Gyeonggi-do',lat:37.2093,lng:127.6836},
{num:7,name:'Lakeside CC',loc:'Yongin, Gyeonggi-do',lat:37.3214,lng:127.1784},
{num:8,name:'South Springs GC',loc:'Icheon, Gyeonggi-do',lat:37.1752,lng:127.451},
{num:9,name:'Bears Best Cheongna',loc:'Incheon, Cheongna',lat:37.532,lng:126.642},
{num:10,name:'Club72 Sky Course',loc:'Yeongjongdo, Incheon',lat:37.48,lng:126.42},
{num:11,name:'Southcape',loc:'Namhae, Gyeongsangnam-do',lat:34.8373,lng:128.0728},
{num:12,name:'Haeundae Beach Golf & Resort',loc:'Busan, Gijang-gun',lat:35.25,lng:129.22}
];
var bounds = [];
KR_MARKERS.forEach(function(c) {
bounds.push([c.lat, c.lng]);
var icon = L.divIcon({className:'course-marker-icon', html:'<div class="course-marker">'+c.num+'</div>', iconSize:[28,28], iconAnchor:[14,14], popupAnchor:[0,-16]});
L.marker([c.lat, c.lng], {icon:icon}).addTo(map).bindPopup('<b>'+c.name+'</b><br>'+c.loc+'<br><a href="javascript:void(0)" onclick="crsScrollToCourse(\'kr\','+c.num+')" style="color:#d4af37;font-size:11px;text-decoration:underline">'+((curLang==='ko')?'코스 상세 보기 →':'View course →')+'</a>');
});
map.fitBounds(L.latLngBounds(bounds), {padding:[30,30]});
crsMapKr = map; crsKrBounds = L.latLngBounds(bounds);
(function(){
var el = map.getContainer();
el.addEventListener('wheel', function(e){
if (!e.ctrlKey) return;
e.preventDefault();
var z = map.getZoom();
if (e.deltaY < 0) map.setZoom(Math.min(z + 1, map.getMaxZoom()));
else map.setZoom(Math.max(z - 1, map.getMinZoom()));
}, {passive:false});
})();
}
var crsRegionCur = 'usa1';
function crsRegion(r, skipScroll) {
var t = document.querySelector('#pg-courses .region-tab[data-region="'+r+'"]');
var c = t ? t.getAttribute('data-country') : null;
if (c && c !== crsCur) crsSwitch(c, true);
crsRegionCur = r;
document.querySelectorAll('#pg-courses .region-tab').forEach(function(x) { x.classList.toggle('act', x.dataset.region === r); });
if (!skipScroll) { var hdr = document.querySelector('#pg-courses .region-header[data-region="'+r+'"]:not(.hidden)'); if (hdr) { var y = hdr.getBoundingClientRect().top + window.scrollY - 178; window.scrollTo({top: Math.max(0, y), behavior: 'smooth'}); } }
}
var crsSpyTimer = null;
function crsSpyTick() {
if (curPage !== 'courses') return;
var line = 180, best = null, bestTop = -1e9;
document.querySelectorAll('#pg-courses .region-header:not(.hidden)').forEach(function(g) {
var b = g.getBoundingClientRect();
if (b.top <= line && b.top > bestTop) { best = g; bestTop = b.top; }
});
if (best) {
var c = best.getAttribute('data-country');
var r = best.getAttribute('data-region');
if (c && c !== crsCur) crsSwitch(c, true);
if (r && r !== crsRegionCur) {
crsRegionCur = r;
document.querySelectorAll('#pg-courses .region-tab').forEach(function(t) { t.classList.toggle('act', t.dataset.region === r); });
}
}
}
window.addEventListener('scroll', function() {
if (crsSpyTimer) return;
crsSpyTimer = setTimeout(function() { crsSpyTimer = null; crsSpyTick(); }, 120);
}, { passive: true });
function crsSwitch(c, noScroll) {
document.getElementById('crs-tab-usa').classList.toggle('act', c==='usa');
document.getElementById('crs-tab-canada').classList.toggle('act', c==='canada');
var tk = document.getElementById('crs-tab-kr'); if (tk) tk.classList.toggle('act', c==='kr');
document.getElementById('crs-map-usa').style.display = c==='usa'?'':'none';
document.getElementById('crs-map-canada').style.display = c==='canada'?'':'none';
var km = document.getElementById('crs-map-kr'); if (km) km.style.display = c==='kr'?'':'none';
crsCur = c;
document.querySelectorAll('#pg-courses .region-group').forEach(function(g) { g.classList.toggle('hidden', g.getAttribute('data-country') !== c); });
document.querySelectorAll('#pg-courses .region-header').forEach(function(h) { h.classList.toggle('hidden', h.getAttribute('data-country') !== c); });
document.querySelectorAll('#pg-courses .region-tab').forEach(function(t) { t.style.display = (t.getAttribute('data-country') === c) ? '' : 'none'; });
crsRegion(c === 'usa' ? 'usa1' : (c === 'canada' ? 'canada1' : 'kr1'), true);

crsInitMaps();
if (c === 'kr') crsInitKrMap();
setTimeout(function() {
if (c==='usa' && crsMapUsa) { crsMapUsa.invalidateSize(); crsMapUsa.fitBounds(crsUsaBounds, {padding:[40,40]}); }
if (c==='canada' && crsMapCan) { crsMapCan.invalidateSize(); crsMapCan.fitBounds(crsCanBounds, {padding:[40,40]}); }
if (c==='kr' && crsMapKr) { crsMapKr.invalidateSize(); crsMapKr.fitBounds(crsKrBounds, {padding:[30,30]}); }
}, 100);
if (!noScroll) {
var g = document.querySelector('#pg-courses .region-group[data-country="'+c+'"]');
if (g) { var y = g.getBoundingClientRect().top + window.scrollY - 150; window.scrollTo({top: Math.max(0, y), behavior:'smooth'}); }
}
}
function crsScrollToCourse(country, num) {
var cards = document.querySelectorAll('#pg-courses .course-card');
for (var i = 0; i < cards.length; i++) {
if (cards[i].getAttribute('data-course') === String(num) && cards[i].getAttribute('data-country') === country) {
setTimeout(function() {
cards[i].scrollIntoView({behavior:'smooth', block:'center'});
cards[i].style.boxShadow = '0 0 40px rgba(212,175,55,.6)';
cards[i].style.borderColor = '#d4af37';
setTimeout(function(){ cards[i].style.boxShadow = ''; cards[i].style.borderColor = ''; }, 2500);
}, 100);
break;
}
}
}

/* ── Course carousels ── */
function crsStartCarousel(el) {
var track = el.querySelector('.carousel-track');
var slides = el.querySelectorAll('.carousel-slide');
if (!track || slides.length < 2) return;
var dots = el.querySelectorAll('.carousel-dot');
var counter = el.querySelector('.carousel-counter');
var rotate = el.dataset.rotate !== 'false';
var idx = parseInt(el.dataset.start) || 0;
function goTo(i) {
idx = i;
track.style.transform = 'translateX(-' + (idx * 100) + '%)';
dots.forEach(function(d, di){ d.classList.toggle('act', di === idx); });
if (counter) counter.textContent = (idx + 1) + ' / ' + slides.length;
}
goTo(idx);
if (rotate) {
var id = setInterval(function(){ goTo((idx + 1) % slides.length); }, 5000);
el.addEventListener('mouseenter', function(){ clearInterval(id); });
el.addEventListener('mouseleave', function(){ id = setInterval(function(){ goTo((idx + 1) % slides.length); }, 5000); });
}
}

/* ── Course lightbox ── */
var crsLbImages = [], crsLbIndex = 0;
var COURSE_INFO = {
"usa-1":{par:71,yards:6844,slope:144,rating:74.6,designer:{ko:"피트 다이",en:"Pete Dye"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-2":{par:70,yards:6408,designer:{ko:"지미 하인스",en:"Jimmy Hines"},diff:{ko:"프라이빗",en:"Private"}},
"usa-3":{par:71,slope:137,rating:74.1,designer:{ko:"맥스 베어",en:"Max Behr"},diff:{ko:"프라이빗",en:"Private"}},
"usa-4":{par:72,slope:141,rating:74.9,designer:{ko:"윌리엄 F. 벨",en:"William F. Bell"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-5":{par:71,yards:6826,designer:{ko:"윌리엄 F. 벨",en:"William F. Bell"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-6":{par:72,yards:6721,slope:140,rating:74.0,diff:{ko:"챔피언십",en:"Championship"}},
"usa-7":{par:72,yards:6835,designer:{ko:"그렉 내시",en:"Greg Nash"},diff:{ko:"퍼블릭",en:"Public"}},
"usa-8":{par:72,yards:7038,designer:{ko:"아널드 파머",en:"Arnold Palmer"},diff:{ko:"리조트",en:"Resort"}},
"usa-9":{par:72,yards:6850,designer:{ko:"웨이드 케이블 & 조니 포츠",en:"Wade Cable & Johnny Potts"},diff:{ko:"프라이빗",en:"Private"}},
"usa-10":{par:71,yards:6780,designer:{ko:"아서 힐스",en:"Arthur Hills"},diff:{ko:"퍼블릭",en:"Public"}},
"usa-11":{par:72,yards:7093,designer:{ko:"아서 힐스",en:"Arthur Hills"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-12":{par:72,yards:7300,slope:150,rating:76.1,designer:{ko:"피트 다이",en:"Pete Dye"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-13":{par:72,yards:6666,designer:{ko:"피트 다이",en:"Pete Dye"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-14":{par:72,yards:7126,designer:{ko:"잭 니클라우스",en:"Jack Nicklaus"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-15":{par:72,yards:7232,designer:{ko:"톰 파지오",en:"Tom Fazio"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-16":{par:72,yards:7159,designer:{ko:"윌리엄 F. 벨",en:"William F. Bell"},diff:{ko:"링크스",en:"Links"}},
"usa-17":{par:72,yards:7105,designer:{ko:"로버트 뮤어 그레이브스",en:"Robert Muir Graves"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-18":{par:72,yards:6831,designer:{ko:"잭 다레이 주니어",en:"Jack Daray Jr"},diff:{ko:"리조트",en:"Resort"}},
"usa-19":{par:72,designer:{ko:"길 한스",en:"Gil Hanse"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-20":{par:72,yards:7802,slope:148,rating:78.8,designer:{ko:"리스 존스",en:"Rees Jones"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-21":{par:72,yards:7258,designer:{ko:"윌리엄 F. 벨 · 웨이스코프 2016",en:"William F. Bell · Weiskopf 2016"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-22":{par:70,yards:7042,designer:{ko:"톰 파지오",en:"Tom Fazio"},diff:{ko:"리조트",en:"Resort"}},
"usa-23":{par:72,yards:7112,designer:{ko:"피트 다이",en:"Pete Dye"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-24":{par:72,yards:7146,designer:{ko:"피트 다이",en:"Pete Dye"},diff:{ko:"챔피언십",en:"Championship"}},
"usa-25":{par:72,yards:7604,designer:{ko:"피트 다이",en:"Pete Dye"},diff:{ko:"챔피언십",en:"Championship"}},
"canada-1":{par:72,diff:{ko:"퍼블릭",en:"Public"}},
"canada-2":{par:72,yards:7140,designer:{ko:"레스 퍼버",en:"Les Furber"},diff:{ko:"리조트",en:"Resort"}},
"canada-3":{par:72,yards:7000,designer:{ko:"게리 브라우닝",en:"Gary Browning"},diff:{ko:"챔피언십",en:"Championship"}},
"canada-4":{par:71,designer:{ko:"스탠리 톰슨",en:"Stanley Thompson"},diff:{ko:"챔피언십",en:"Championship"}},
"canada-5":{par:72,designer:{ko:"로버트 트렌트 존스 Sr.",en:"Robert Trent Jones Sr."},diff:{ko:"챔피언십",en:"Championship"}},
"kr-1":{par:72,yards:7222,diff:{ko:"챔피언십",en:"Championship"}},
"kr-2":{par:72,yards:7206,designer:{ko:"노준택",en:"No Joon-taek"},diff:{ko:"프리미엄",en:"Premier"}},
"kr-3":{par:72,yards:7274,designer:{ko:"노준택",en:"No Joon-taek"},diff:{ko:"프리미엄",en:"Premier"}},
"kr-4":{par:72,yards:7330,designer:{ko:"짐 엔프",en:"Jim Engh"},diff:{ko:"프리미엄",en:"Premier"}},
"kr-5":{par:72,designer:{ko:"잭 니클라우스",en:"Jack Nicklaus"},diff:{ko:"리조트",en:"Resort"}},
"kr-6":{par:72,diff:{ko:"챔피언십",en:"Championship"}},
"kr-7":{par:72,diff:{ko:"프리미엄",en:"Premier"}},
"kr-8":{par:72,yards:7902,designer:{ko:"짐 파지오 주니어",en:"Jim Fazio Jr"},diff:{ko:"프리미엄",en:"Premier"}},
"kr-9":{par:72,designer:{ko:"잭 니클라우스",en:"Jack Nicklaus"},diff:{ko:"챔피언십",en:"Championship"}},
"kr-10":{par:72,yards:7165,designer:{ko:"화인에이엠",en:"FINEAM"},diff:{ko:"챔피언십",en:"Championship"}},
"kr-11":{par:72,yards:7313,designer:{ko:"카일 필립스",en:"Kyle Phillips"},diff:{ko:"챔피언십",en:"Championship"}},
"kr-12":{par:72,yards:7250,designer:{ko:"JDG 어소시에이츠",en:"JDG Associates"},diff:{ko:"리조트",en:"Resort"}},
};
function crsLbOpen(e, urls) {
e.stopPropagation();
crsLbImages = Array.isArray(urls) ? urls : [urls];
crsLbIndex = 0;
var img = document.getElementById('crsLbImg');
if (img) img.src = crsLbImages[0];
document.getElementById('crsLb').classList.add('show');
document.body.style.overflow = 'hidden';
}
function crsLbClose() { document.getElementById('crsLb').classList.remove('show'); crsLbImages = []; document.body.style.overflow = ''; }
function crsLbPrev() { if (crsLbImages.length < 2) return; crsLbIndex = (crsLbIndex - 1 + crsLbImages.length) % crsLbImages.length; document.getElementById('crsLbImg').src = crsLbImages[crsLbIndex]; }
function crsLbNext() { if (crsLbImages.length < 2) return; crsLbIndex = (crsLbIndex + 1) % crsLbImages.length; document.getElementById('crsLbImg').src = crsLbImages[crsLbIndex]; }
document.addEventListener('keydown', function(e) {
if (!document.getElementById('crsLb') || !document.getElementById('crsLb').classList.contains('show')) return;
if (e.key === 'ArrowLeft') crsLbPrev();
if (e.key === 'ArrowRight') crsLbNext();
if (e.key === 'Escape') crsLbClose();
});
/* ── Course lightbox touch swipe ── */
document.addEventListener('touchstart', function(e) {
  var lb = document.getElementById('crsLb');
  if (!lb || !lb.classList.contains('show')) return;
  window.__crsLbSwipeX = e.touches[0].clientX;
}, {passive:true});
document.addEventListener('touchend', function(e) {
  if (window.__crsLbSwipeX == null) return;
  var lb = document.getElementById('crsLb');
  if (!lb || !lb.classList.contains('show')) { window.__crsLbSwipeX = null; return; }
  var dx = e.changedTouches[0].clientX - window.__crsLbSwipeX;
  window.__crsLbSwipeX = null;
  if (Math.abs(dx) > 50) { if (dx < 0) crsLbNext(); else crsLbPrev(); }
}, {passive:true});

/* ── Quiz ── */
var CRS_QUIZ = [{q_ko:"라운딩에서 가장 중요하게 생각하는 것은?",q_en:"What matters most in your round?",opts:"<button class='quiz-opt' onclick='pickAnswer(0)'><span class='ko'>⛰️ 경치</span><span class='en'>⛰️ Scenery</span></button><button class='quiz-opt' onclick='pickAnswer(1)'><span class='ko'>🏆 스코어</span><span class='en'>🏆 Score</span></button><button class='quiz-opt' onclick='pickAnswer(2)'><span class='ko'>😄 분위기</span><span class='en'>😄 Atmosphere</span></button><button class='quiz-opt' onclick='pickAnswer(3)'><span class='ko'>💪 도전</span><span class='en'>💪 Challenge</span></button>"},{q_ko:"자신의 실력 수준은?",q_en:"What's your skill level?",opts:"<button class='quiz-opt' onclick='pickAnswer(0)'><span class='ko'>초보</span><span class='en'>Beginner</span></button><button class='quiz-opt' onclick='pickAnswer(1)'><span class='ko'>중급 80~90대</span><span class='en'>Mid 80s–90s</span></button><button class='quiz-opt' onclick='pickAnswer(2)'><span class='ko'>상급 70대</span><span class='en'>Low 70s</span></button><button class='quiz-opt' onclick='pickAnswer(3)'><span class='ko'>프로급</span><span class='en'>Tour-level</span></button>"},{q_ko:"선호하는 코스 스타일?",q_en:"Preferred course style?",opts:"<button class='quiz-opt' onclick='pickAnswer(0)'><span class='ko'>🌊 오션뷰</span><span class='en'>🌊 Ocean views</span></button><button class='quiz-opt' onclick='pickAnswer(1)'><span class='ko'>🏔️ 산악</span><span class='en'>🏔️ Mountain</span></button><button class='quiz-opt' onclick='pickAnswer(2)'><span class='ko'>🌿 자연·숲</span><span class='en'>🌿 Nature & forest</span></button><button class='quiz-opt' onclick='pickAnswer(3)'><span class='ko'>🏛️ 클래식</span><span class='en'>🏛️ Classic</span></button>"},{q_ko:"라운딩 중 가장 싫은 것은?",q_en:"What do you hate most mid-round?",opts:"<button class='quiz-opt' onclick='pickAnswer(0)'><span class='ko'>🐢 느린 플레이</span><span class='en'>🐢 Slow play</span></button><button class='quiz-opt' onclick='pickAnswer(1)'><span class='ko'>💨 강풍</span><span class='en'>💨 Strong wind</span></button><button class='quiz-opt' onclick='pickAnswer(2)'><span class='ko'>🏠 주택가 뷰</span><span class='en'>🏠 Houses lining the fairway</span></button><button class='quiz-opt' onclick='pickAnswer(3)'><span class='ko'>👥 붐비는 코스</span><span class='en'>👥 Crowded course</span></button>"},{q_ko:"동반자 구성은?",q_en:"Who are you playing with?",opts:"<button class='quiz-opt' onclick='pickAnswer(0)'><span class='ko'>혼자·2인</span><span class='en'>Solo or a pair</span></button><button class='quiz-opt' onclick='pickAnswer(1)'><span class='ko'>4인 비슷한 실력</span><span class='en'>Foursome, similar skill</span></button><button class='quiz-opt' onclick='pickAnswer(2)'><span class='ko'>실력 편차 큼</span><span class='en'>Mixed skill levels</span></button><button class='quiz-opt' onclick='pickAnswer(3)'><span class='ko'>가족·비골퍼</span><span class='en'>Family / non-golfers</span></button>"},{q_ko:"라운드 후 원하는 것?",q_en:"What do you want after the round?",opts:"<button class='quiz-opt' onclick='pickAnswer(0)'><span class='ko'>🍷 와인·미식</span><span class='en'>🍷 Wine & dining</span></button><button class='quiz-opt' onclick='pickAnswer(1)'><span class='ko'>🌅 경치 감상</span><span class='en'>🌅 Scenery</span></button><button class='quiz-opt' onclick='pickAnswer(2)'><span class='ko'>📊 스코어 복기</span><span class='en'>📊 Score review</span></button><button class='quiz-opt' onclick='pickAnswer(3)'><span class='ko'>😴 휴식</span><span class='en'>😴 Rest</span></button>"},{q_ko:"여행 스타일은?",q_en:"Your travel style?",opts:"<button class='quiz-opt' onclick='pickAnswer(0)'><span class='ko'>🏃 액티브 36홀</span><span class='en'>🏃 Active, 36 holes</span></button><button class='quiz-opt' onclick='pickAnswer(1)'><span class='ko'>⚖️ 밸런스</span><span class='en'>⚖️ Balanced</span></button><button class='quiz-opt' onclick='pickAnswer(2)'><span class='ko'>🛌 릴랙스 여유</span><span class='en'>🛌 Relaxed pace</span></button>"},{q_ko:"골프 외에 즐기고 싶은 활동은?",q_en:"What non-golf experiences do you want?",opts:"<button class='quiz-opt' onclick='pickAnswer(0)'><span class='ko'>🍷 와인·미식</span><span class='en'>🍷 Wine & dining</span></button><button class='quiz-opt' onclick='pickAnswer(1)'><span class='ko'>🥾 하이킹·자연</span><span class='en'>🥾 Hiking & nature</span></button><button class='quiz-opt' onclick='pickAnswer(2)'><span class='ko'>🐋 고래·해양 관찰</span><span class='en'>🐋 Whale watching</span></button><button class='quiz-opt' onclick='pickAnswer(3)'><span class='ko'>🎯 사격 체험</span><span class='en'>🎯 Range shooting</span></button><button class='quiz-opt' onclick='pickAnswer(4)'><span class='ko'>🎈 열기구·일몰</span><span class='en'>🎈 Hot-air balloon</span></button><button class='quiz-opt' onclick='pickAnswer(5)'><span class='ko'>🏛️ 미술관·문화</span><span class='en'>🏛️ Museums & culture</span></button><button class='quiz-opt' onclick='pickAnswer(6)'><span class='ko'>🏖️ 해변·휴양</span><span class='en'>🏖️ Beach & relax</span></button><button class='quiz-opt' onclick='pickAnswer(7)'><span class='ko'>♨️ 온천·힐링</span><span class='en'>♨️ Hot springs</span></button>"}];
var crsQi = 0, crsQs = {views:0,skill:0,vibe:0,challenge:0,comfort:0};
var crsOM = [['views','skill','vibe','challenge'],['comfort','skill','skill','skill'],['views','challenge','comfort','comfort'],['comfort','views','views','comfort'],['comfort','skill','comfort','comfort'],['vibe','views','skill','comfort'],['challenge','skill','comfort',null],['vibe','views','views','challenge','views','vibe','comfort','comfort']];
var CRS_RES = {
views:{d_ko:'<b>경치형 골퍼</b> — 스코어보다 풍경! 티샷보다 배경부터 찾는 타입.',d_en:'<b>Scenery Golfer</b> — views over scores! You look for the backdrop before the tee shot.',rec:['Sandpiper','Trump National','Silvertip','Fairmont Banff Springs']},
challenge:{d_ko:'<b>도전형 골퍼</b> — 쉬우면 심심, 어려울수록 🔥.',d_en:'<b>Challenge Seeker</b> — easy is boring, the harder the better 🔥.',rec:['La Purisima','Trump National','Hacienda','Silvertip','Kananaskis']},
skill:{d_ko:'<b>실력파 골퍼</b> — 한 타 한 타 진지하게.',d_en:'<b>Purist Golfer</b> — every stroke, played seriously.',rec:['La Purisima','Friendly Hills','Golf Club of CA','Cross Creek','Kananaskis']},
vibe:{d_ko:'<b>분위기형 골퍼</b> — 웃고 떠들고 와인 한 잔!',d_en:'<b>Vibe Golfer</b> — laughs, chatter, and a glass of wine!',rec:['Alisal Ranch','Cross Creek','Stewart Creek','Canmore G&CC']},
comfort:{d_ko:'<b>힐링형 골퍼</b> — 골프는 휴식. 여유롭게 자연을.',d_en:'<b>Healing Golfer</b> — golf is rest. Nature, at an easy pace.',rec:['Alisal Ranch','The Crossings','Stewart Creek','Canmore G&CC']},
balanced:{d_ko:'<b>밸런스형 골퍼</b> — 경치·도전·분위기 두루!',d_en:'<b>Balanced Golfer</b> — scenery, challenge and atmosphere in equal measure!',rec:['Sandpiper','Hacienda','Golf Club of CA','The Crossings','Stewart Creek']}
};
