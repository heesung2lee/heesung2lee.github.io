/* quiz.js — ③ 퀴즈 모듈 (tour-base-quiz)
   F_퀴즈 6 + crs퀴즈 5. 외부의존은 호스트(index)가 제공: F_showResult F_renderAll F_el F_renderNav F_gVal F_selOpt F_travelTop5 F_updateKakao F_renderCards F_picks F_cardEl F_actToggle crsStartCarousel
   booking 연동점: F_picks() 결과가 견적 입력. */
function F_curQ(){return F_QBANK[F_flow[F_fi]][F_qi];}
var qsel=null;
function F_renderQ(){
 F_renderNav();
 qsel=null;
 var host=F_el('qhost');host.innerHTML='';
 var bank=F_QBANK[F_flow[F_fi]];
 var bar=F_el('prog');bar.innerHTML='';
 bank.forEach(function(_,i){var b=document.createElement('i');if(i<F_qi)b.className='done';bar.appendChild(b);});
 var q=F_curQ();
 var h=document.createElement('h2');h.style.cssText='font-size:17px;margin:6px 0 14px';
 h.innerHTML='<span class="ko">'+q.t[0]+'</span><span class="en">'+q.t[1]+'</span>';host.appendChild(h);
 var box=document.createElement('div');box.className='opts';
 q.o.forEach(function(o){
  var b=document.createElement('button');b.className='opt';
  b.innerHTML='<span class="ko">'+o[0].split('|')[0]+'</span><span class="en">'+o[1].split('|')[0]+'</span>';
  b.onclick=function(){box.querySelectorAll('.opt').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');qsel=o;F_el('qnext').disabled=false;};box.appendChild(b);
 });
 host.appendChild(box);
 {var f=document.createElement('div');f.className='qfree';
  var ex=F_freeExample();
  f.innerHTML='<label><span class="ko">✏️ 덧붙일 말 (선택 — '+ex[0]+')</span><span class="en">✏️ Add a note (optional — '+ex[1]+')</span></label><textarea id="qfree" rows="2" placeholder="없으면 비워두세요"></textarea>';
  host.appendChild(f);}
 var nav=document.createElement('div');nav.className='qnav';
 var bk=document.createElement('button');bk.className='backbtn';bk.textContent=curLang==='ko'?'← 돌아가기':'← Back';bk.disabled=!(F_qi>0||F_fi>0);bk.style.opacity=(F_qi>0||F_fi>0)?'1':'.4';bk.onclick=F_qback;nav.appendChild(bk);
 var nx=document.createElement('button');nx.className='nextbtn';nx.id='qnext';nx.textContent=curLang==='ko'?'제출 →':'Submit →';nx.disabled=true;nx.onclick=function(){if(qsel)F_qpick(qsel);};nav.appendChild(nx);
 host.appendChild(nav);
}
function F_freeExample(){
 var m=F_flow[F_fi];
 if(m==='golf')return ['예: 특정 코스명, 레슨 희망, 싫은 잔디·코스 타입','e.g. course name, lesson request'];
 if(m==='food')return ['예: 알레르기, 특정 식당, 싫은 음식','e.g. allergies, restaurant, dislikes'];
 return ['예: 기념일, 꼭 가고 싶은 곳, 싫은 일정','e.g. anniversary, must-visit, dislikes'];
}
function F_ansKey(){return F_flow[F_fi]+'_'+F_qi;}
function F_qpick(o){
 var fr=F_el('qfree');
 F_answers[F_ansKey()]={ko:o[0],en:o[1],free:fr?fr.value.trim():''};
 var bank=F_QBANK[F_flow[F_fi]];
 if(F_qi<bank.length-1){F_qi++;F_renderQ();}
 else if(F_fi<F_flow.length-1){F_fi++;F_qi=0;F_renderQ();}
 else{F_showResult();}
 window.scrollTo({top:0,behavior:'smooth'});
}
function F_qback(){if(F_qi>0){F_qi--;}else if(F_fi>0){F_fi--;F_qi=F_QBANK[F_flow[F_fi]].length-1;}F_renderQ();}
/* ---- results ---- */
function crsInitQuiz() { crsQi = 0; crsQs = {views:0,skill:0,vibe:0,challenge:0,comfort:0}; crsShowQuiz(); }
function crsRp() {
var h = '';
for (var i = 0; i < CRS_QUIZ.length; i++) h += '<div class="quiz-dot ' + (i < crsQi ? 'done' : (i === crsQi ? 'cur' : '')) + '"></div>';
var el = document.getElementById('quizProgress'); if (el) el.innerHTML = h;
}
function crsShowQuiz() {
if (crsQi >= CRS_QUIZ.length) { crsShowResult(); return; }
crsRp();
var q = CRS_QUIZ[crsQi];
var qEl = document.getElementById('quizQ');
if (qEl) qEl.innerHTML = 'Q' + (crsQi + 1) + '. <span class="ko">' + q.q_ko + '</span><span class="en">' + q.q_en + '</span>';
var oEl = document.getElementById('quizOpts');
if (oEl) { oEl.innerHTML = q.opts; oEl.style.display = 'flex'; }
var rEl = document.getElementById('quizResult'); if (rEl) rEl.classList.remove('show');
}
function pickAnswer(idx) {
var m = crsOM[crsQi];
if (m && m[idx]) crsQs[m[idx]] += 2;
if (crsQi === 1 && (idx === 2 || idx === 3)) crsQs.challenge++;
crsQi++;
crsShowQuiz();
}
function crsShowResult() {
crsRp();
var oEl = document.getElementById('quizOpts'); if (oEl) oEl.style.display = 'none';
var qEl = document.getElementById('quizQ'); if (qEl) qEl.textContent = '';
var res = document.getElementById('quizResult');
if (!res) return;
res.classList.add('show');
var top = Object.entries(crsQs).sort(function(a,b){ return b[1] - a[1]; });
var p = top[0][0];
var r = CRS_RES[p] || CRS_RES.balanced;
var L = curLang;
var recs = r.rec.map(function(x){ return '<span>' + x + '</span>'; }).join('');
var qBody = encodeURIComponent((L==='ko' ? '골퍼 유형: ' : 'Golfer Profile: ') + p + '\n\n' + (L==='ko' ? '추천 코스:\n' : 'Recommended courses:\n') + r.rec.join('\n'));
var qHref = 'mailto:' + SITE.email + '?subject=' + encodeURIComponent('Resonate Tour - Custom Quote Request') + '&body=' + qBody;
res.innerHTML = '<h3><span class="ko">🎯 당신의 골퍼 유형</span><span class="en">🎯 Your Golfer Profile</span></h3><p><span class="ko">' + r.d_ko + '</span><span class="en">' + r.d_en + '</span></p><div class="rec-courses"><b><span class="ko">추천 코스:</span><span class="en">Recommended courses:</span></b> ' + recs + '</div><button class="quiz-opt" style="margin-top:16px;text-align:center;width:100%" onclick="crsInitQuiz()"><span class="ko">🔄 다시 테스트하기</span><span class="en">🔄 Retake the test</span></button><a class="quiz-opt" href="' + qHref + '" style="margin-top:10px;text-align:center;width:100%;display:block;text-decoration:none;color:inherit"><span class="ko">💬 이 결과로 맞춤 견적 요청</span><span class="en">💬 Request a quote with this result</span></a>';
}

/* ── Init carousels + reveal ── */
(function(){
var cards = document.querySelectorAll('#pg-courses .course-card');
document.querySelectorAll('#pg-courses .course-carousel').forEach(function(el, i) { crsStartCarousel(el); });
var obs = new IntersectionObserver(function(entries) {
entries.forEach(function(entry) {
if (entry.isIntersecting) {
entry.target.classList.add('revealed');
obs.unobserve(entry.target);
}
});
}, {threshold:0.06, rootMargin:'0px 0px -40px 0px'});
cards.forEach(function(card) { obs.observe(card); });
crsInitQuiz();
})();
