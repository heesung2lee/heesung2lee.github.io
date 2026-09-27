# 투어사이트 의존도 지도 (2026-09-27, tour-base-deps)

## 스크립트 블록 (index.html 인라인, 총 175 funcs)
| 블록 | 바이트 | 함수 | 내용 |
|---|---|---|---|
| 0 gtag | 152 | 1 | GA |
| 1 finder | 29K | 44 | F_ 퀴즈/카드/i18n |
| 2 finderModal | 370 | 2 | finderOpen/Close |
| 3 main | 135K | 128 | 갤러리/지도/코스/쉘 |

## finder 블록 (44) — 진입점 12
- 진입: F_toggleLang F_modeToggle F_startFlow F_qback F_backToStart F_themePick F_airPick F_singlePick F_multiPick topN F_cardsToggle F_composeMsg
- 허브: F_renderAll(14) F_renderQ(5) F_prefillFromQuiz(5) F_composeMsg(5) F_qpick(4) F_renderCards(4)
- 전역: F_KAKAO F_ITEMS F_PERSONA F_CATS F_QBANK F_flow qsel F_CARDKEY
- 주의: F_renderAll이 퀴즈+카드+테마+i18n 전부 호출 — 분할 시 이 함수 경계가 핵심

## main 블록 (128) — 모듈 후보
- gallery(32): buildGallery* lightbox* yt* cinematic* showDirect*
- canvas-fx(21): draw* make* tick init show hide spawnRipple runTyping countUp
- courses(27): crs* + buildSchedule buildPanel switchDay rebuildSchedule renderPlans
- shell(33): nav modal faq ham tab highlight mapLinks
- i18n: setLang _applyLang toggleLangCurrency curLang + MODAL_TEXTS
- 전역: imgs PLAN_DATA DAYS curLang curPage DAY_META GAL_ITEMS CRS_USA CRS_CAN map bounds

## HTML 진입점 TOP
crsLbOpen(42) nav(24) F_singlePick(18) crsRegion(12) toggleFaq(12)

## booking API 자리
- courses 모듈 옆에 `booking/` 신설 예정: 견적→예약→결제
- 입력: courses의 CRS_* 데이터 + finder의 F_picks 결과
- 전역 curLang/curPage는 shell에 유지, booking은 read-only 참조
