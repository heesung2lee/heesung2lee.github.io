# Resonate Tour — 작업 기록 (progress.md)

## 목표 (고정)
1. 포트원 심사 통과 (대표 상품 + 결제금액 + 환불 + 사업자정보)
2. 기획여행으로 안 보이기 (모집 문구 0 + 견적서 결제 + 반복판매 로그)

## 2026-10-07
- PR #37 머지: 대표 상품 카드 (트럼프+명문 5일, $4,350부터 2인 기준)
- PR #38 머지: 정적 약관 페이지 4종 (terms/privacy/travel-terms/notice)
- footer: 개인정보·표준약관·이용약관 모달 + privacy.html 직접 링크
- 정정: PG 보증보험 요율 0.953%/년 (0.536% 구 수치 폐기)
- 정정: 월 2천만원 총비용 = 카드수수료 64만 + 보험 월할 1.6만 = 약 65.6만원/월 (보험은 연 19만원 선납)
- DS crosscheck 4R: 판정 SAFE

## 잔여 (다음 세션)
- [ ] DAYS 13일 vs 대표 5일 불일치 해소 (대표 5일 뼈대 DAY 1-5 매핑)
- [ ] privacy 보유기간 3년 → 거래기록 5년/상담 3년 분리 표기
- [ ] travel-terms.html 정적 파일도 동일 문구 동기화
- [ ] 포트원 가입신청서 제출 (갤럭시아/다날)
- [ ] 네이버페이 결제형 2단계
- [ ] 백업 미러 (resonate-docs divergence 정리 후)

## 2026-10-08
- PR #40 머지: 보유기간 5년/3년 분리, 일정헤더 13일 정합, footer 정적링크 4종
- PR #41 머지: FTC 링크·호스팅 제거
- PR #42 싱크, PR #43 머지: 공지·© row 삭제, footer 슬림 (276px)
- 복구: progress.md 싱크 충돌로 소실 → a2be9a6에서 복원

## 재발 방지 룰 (stuck/token 낭비)
1. main 직접 작업 금지 — 항상 tour/* 브랜치에서 작업 후 PR
2. pull 전 git status 깨끗한지 확인, divergence 있으면 origin/main 기준으로 새 브랜치
3. reset --hard·branch -D·force push 금지 (가드 우회 시도 금지)
4. 충돌 나면 원격 파일 직접 가져오기 (git show origin/main:파일), 로컬 덮어쓰기 금지
5. 싱크용 빈 커밋 만들지 않기 — 실작업 있을 때만 커밋
