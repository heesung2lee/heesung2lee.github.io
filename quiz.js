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
/* Quiz data (moved from maps.js — 함수와 같은 파일) */
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

/* ── Init carousels + reveal + quiz ──
   Runs on DOMContentLoaded (not immediately): quiz.js loads BEFORE
   index inline globals (curLang/SITE), so immediate crsShowQuiz would
   render into an unready host. Retry guard covers slow DOM. */
function crsBootQuiz() {
var cards = document.querySelectorAll('#pg-courses .course-card');
document.querySelectorAll('#pg-courses .course-carousel').forEach(function(el, i) { try { crsStartCarousel(el); } catch (e) {} });
try {
var obs = new IntersectionObserver(function(entries) {
entries.forEach(function(entry) {
if (entry.isIntersecting) {
entry.target.classList.add('revealed');
obs.unobserve(entry.target);
}
});
}, {threshold:0.06, rootMargin:'0px 0px -40px 0px'});
cards.forEach(function(card) { obs.observe(card); });
} catch (e) {}
var tries = 0;
(function tryQuiz() {
var qEl = document.getElementById('quizQ');
if (qEl && typeof CRS_QUIZ !== 'undefined' && CRS_QUIZ.length) { crsInitQuiz(); return; }
if (++tries < 20) setTimeout(tryQuiz, 250);
})();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crsBootQuiz);
else crsBootQuiz();
