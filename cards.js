/* cards.js — ④ 카드 모듈 (tour-base-cards)
   카드/추천 16 funcs. 외부의존은 호스트 제공: F_el F_gVal F_actToggle F_renderAll F_showResult F_composeMsg
   booking 연동점: F_picks() + F_composeMsg() 결과가 견적 입력. */
function F_pcard(id,em,t,s,hint){
 var b=document.createElement('button');b.className='F_pcard';b.id='pc-'+id;
 var e1=document.createElement('span');e1.className='pem';e1.textContent=em;b.appendChild(e1);
 var e2=document.createElement('span');e2.className='pt';e2.textContent=t;b.appendChild(e2);
 var e3=document.createElement('span');e3.className='ps';e3.textContent=s;b.appendChild(e3);
 var e4=document.createElement('span');e4.className='phint';e4.textContent=hint;b.appendChild(e4);
 b.onclick=function(){F_pcardToggle(id);};
 return b;
}
function F_pcardToggle(id){
 var card=document.getElementById('pc-'+id);
 var det=document.getElementById('pd-'+id);
 if(!card||!det)return;
 var was=card.classList.contains('open');
 [].forEach.call(document.querySelectorAll('#resblocks .pdetail'),function(e){e.classList.remove('show');});
 [].forEach.call(document.querySelectorAll('#resblocks .F_pcard'),function(e){e.classList.remove('open');var h=e.querySelector('.phint');if(h)h.textContent=h.textContent.replace('\u25B4','\u25BE');});
 if(!was){card.classList.add('open');det.classList.add('show');var h2=card.querySelector('.phint');if(h2)h2.textContent=h2.textContent.replace('\u25BE','\u25B4');}
}
function F_cardsToggle(){
 var w=F_el('cardsWrap');if(!w)return;
 var open=w.style.display==='none'||w.style.display===''&&!w.classList.contains('show');
 open=w.style.display==='none';w.style.display=open?'':'none';w.classList.toggle('show',open);
 var h=document.querySelector('#F_cardsToggle .phint2');if(h)h.textContent=open?'\u25B4':'\u25BE';
 if(open)F_renderCards();
}
function F_renderCards(){
 var g=F_el('cardGroups');if(!g)return;g.innerHTML='';
 var keys=[];
 var pic=F_gVal('golf',3);
 if(pic.indexOf('바다')>=0)keys=keys.concat(F_CARDKEY.ocean);
 if(pic.indexOf('사막')>=0)keys=keys.concat(F_CARDKEY.desert);
 if(pic.indexOf('프라이빗')>=0)keys=keys.concat(F_CARDKEY.private);
 var lvl=F_gVal('golf',1);
 if(lvl.indexOf('120대')>=0)keys=keys.concat(F_CARDKEY.begin);
 if(lvl.indexOf('80대')>=0||lvl.indexOf('90대')>=0)keys=keys.concat(F_CARDKEY.champ);
 F_CATS.forEach(function(c){
  var h=document.createElement('h3');h.className='sec';h.style.cssText='font-size:15px;color:var(--navy);margin:26px 0 10px';
  h.innerHTML='<span class="ko">'+c[1]+'</span><span class="en">'+c[2]+'</span>';g.appendChild(h);
  var grid=document.createElement('div');grid.className='act-grid';grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:10px';
  F_ITEMS.filter(function(it){return it.cat===c[0]}).forEach(function(it){
   var pre=keys.some(function(k){return it.ko.indexOf(k)>=0;});
   var d=F_cardEl(it);if(pre)d.classList.add('on');d.onclick=function(){F_actToggle(d);};grid.appendChild(d);
  });
  g.appendChild(grid);
 });
 var n=document.querySelectorAll('#finderModal .act-item.on').length;var e=F_el('cardCount');
 if(e)e.textContent=curLang==='ko'?n+'개 선택됨':n+' selected';
}
function F_cardEl(it,staticMode){
 var d=document.createElement('div');d.className='act-item';d.dataset.ko=it.ko;d.dataset.en=it.en;
 if(staticMode){d.style.cursor='default';d.innerHTML='<span class="act-nm"><span class="ko">'+it.ko+'</span><span class="en">'+it.en+'</span></span>';}
 else d.innerHTML='<span class="act-ck">✓</span><span class="act-nm"><span class="ko">'+it.ko+'</span><span class="en">'+it.en+'</span></span>';
 return d;
}
/* detail cards with presets from all results */
function F_golfTop5(){
 var pic=F_gVal('golf',3),lvl=F_gVal('golf',1),mix=F_gVal('golf',0);
 var keys=[].concat(F_CARDKEY[{ '🌊 바다 옆 링크스':'ocean','🏜️ 사막 리조트':'desert','🔑 프라이빗 클럽 (섭외 지원)':'private'}[pic]||'']||[]);
 if(lvl.indexOf('120대')>=0)keys=keys.concat(F_CARDKEY.begin);
 if(lvl.indexOf('100대')>=0)keys=keys.concat(F_CARDKEY.mid);
 if(lvl.indexOf('80대')>=0||lvl.indexOf('90대')>=0)keys=keys.concat(F_CARDKEY.champ);
 var scored=F_ITEMS.map(function(it){var s=0;keys.forEach(function(k){if(k&&(it.ko.indexOf(k)>=0))s+=2;});if(it.cat==='golf')s+=1;if(mix.indexOf('관광')>=0&&it.cat!=='golf')s+=1;return {it:it,s:s};});
 scored.sort(function(a,b){return b.s-a.s;});
 return scored.slice(0,5).map(function(x){return x.it;});
}
function F_travelTop5(){
 var code=(F_answers.travel_0&&F_answers.travel_0.ko.indexOf('|E')>=0?'E':'I')+(F_answers.travel_1&&F_answers.travel_1.ko.indexOf('|N')>=0?'N':'S')+(F_answers.travel_2&&F_answers.travel_2.ko.indexOf('|P')>=0?'P':'J');
 var keys=[];
 if(code[0]==='E')keys.push('재즈','브루어리','마켓');else keys.push('스파','피크닉','선셋');
 if(code[1]==='N')keys.push('헬리콥터','요세미티','그랜드 캐니언');else keys.push('아울렛','맛집','와이너리');
 if(code[2]==='P')keys.push('서핑','바이크');else keys.push('박물관','랜드마크');
 var scored=F_ITEMS.filter(function(it){return it.cat!=='golf';}).map(function(it){var s=0;keys.forEach(function(k){if(it.ko.indexOf(k)>=0)s+=2;});return {it:it,s:s};});
 scored.sort(function(a,b){return b.s-a.s;});
 return {code:code,items:scored.slice(0,5).map(function(x){return x.it;})};
}
function F_foodProfileEn(){
 var parts=[];
 var a=F_enVal('food',0);if(a)parts.push(a);
 var b=F_enVal('food',3);if(b)parts.push(/Anything|Eat anything/i.test(b)?'adventurous taste':'careful taste');
 var c=F_enVal('food',4);if(c)parts.push(/Meat lover/i.test(c)?'meat lover':/Seafood/i.test(c)?'seafood lover':'meat & seafood');
 var d=F_enVal('food',5);if(d)parts.push(/wineries/i.test(d)?'likes wine':/No alcohol/i.test(d)?'no alcohol':'light drinks');
 return parts.length?parts.join(' · '):'Picked from your F_answers.';
}
function F_foodProfileKo(){
 var parts=[];
 var a=F_gVal('food',0);if(a)parts.push(a);
 var b=F_gVal('food',3);if(b)parts.push(b.indexOf('뭐든')>=0?'도전형 입맛':'신중형 입맛');
 var c=F_gVal('food',4);if(c)parts.push(c.indexOf('고기파')>=0?'고기파':c.indexOf('해산물')>=0?'해산물파':'고기·해산물 다 좋아');
 var d=F_gVal('food',5);if(d)parts.push(d.indexOf('와이너리')>=0?'와인 좋아함':d.indexOf('안 마셔')>=0?'술 안 마심':'가벼운 술');
 return parts.length?parts.join(' · '):'답을 바탕으로 뽑았습니다.';
}
function F_foodTop5(){
 var k1=F_gVal('food',0),k2=F_gVal('food',1),k3=F_gVal('food',2),k4=F_gVal('food',3);
 var keys=[];
 if(k1.indexOf('매끼')>=0)keys.push('한인타운');if(k2.indexOf('뭐든')>=0)keys.push('BBQ','해산물');else keys.push('퓨전');
 if(k3.indexOf('와이너리')>=0)keys.push('와이너리','와인바');if(k4.indexOf('카페')>=0||k4.indexOf('Daily')>=0)keys.push('카페');
 keys.push('맛집','셰프 테이블');
 var pool=F_ITEMS.filter(function(it){return it.cat==='dining'||it.cat==='local';});
 var scored=pool.map(function(it){var s=0;keys.forEach(function(k){if(it.ko.indexOf(k)>=0)s+=2;});return {it:it,s:s};});
 scored.sort(function(a,b){return b.s-a.s;});
 return scored.slice(0,5).map(function(x){return x.it;});
}
function F_golfSummaryEn(){
 var parts=[];
 var a=F_enVal('golf',0);if(a)parts.push(a);
 var b=F_enVal('golf',1);if(b)parts.push(b);
 var c=F_enVal('golf',2);if(c)parts.push(c);
 return parts.length?parts.join(' · '):'Your matched trip.';
}
function F_enVal(m,i){var a=F_answers[m+'_'+i];return a?a.en.split('|')[0]:'';}
function F_golfTitle(){
 return F_golfTitleLang(curLang==='ko');
}
function F_golfTitleLang(ko){
 var pic=ko?F_gVal('golf',3):F_enVal('golf',3),len=ko?F_gVal('golf',4):F_enVal('golf',4);
 if(ko){
  var base={'🌊 바다 옆 링크스':'바다 링크스형','🏜️ 사막 리조트':'사막 + 쇼형','🔑 프라이빗 클럽 (섭외 지원)':'프라이빗 섭외 지원형'}[pic]||'밸런스 추천형';
  var ln=len.indexOf('5박')>=0?' 5박':len.indexOf('10박')>=0?' 10박':' 7박';
  return base+ln;
 }
 var base={'🌊 Ocean links':'Ocean Links','🏜️ Desert resort':'Desert + Shows','🔑 Private club (sourcing help)':'Private Sourcing'}[pic]||'Balanced Pick';
 var ln=/5 nights/.test(len)?' 5N':/10 nights/.test(len)?' 10N':' 7N';
 return base+ln;
}
function topN(pool,n){return pool.slice(0,n);}
function F_picks(){return [].slice.call(document.querySelectorAll('#finderModal .act-item.on')).map(function(el){return curLang==='ko'?el.dataset.ko:el.dataset.en;});}

var F_CARDKEY={ocean:['오션뷰','해안 절벽','PCH','해산물'],desert:['사막','라스베이거스','BBQ','쇼'],private:['프라이빗','챔피언십','레슨','셰프 테이블'],champ:['챔피언십','도전적인'],begin:['부담 없는 초보'],mid:['균형 잡힌 중급'],veg:['채소','샐러드'],meat:['BBQ','스모크하우스','고기'],wine:['와이너리','와인바'],cafe:['카페','커피'],seafood:['해산물'],market:['파머스 마켓','마켓']};
