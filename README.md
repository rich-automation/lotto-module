# @rich-automation/lotto

[![npm](https://img.shields.io/npm/v/@rich-automation/lotto.svg?style=popout&colorB=yellow)](https://www.npmjs.com/package/@rich-automation/lotto)  
[![ci](https://github.com/rich-automation/lotto-module/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/rich-automation/lotto-module/actions/workflows/ci.yml)  
[![codecov](https://codecov.io/gh/rich-automation/lotto-module/branch/main/graph/badge.svg?token=18IAW1OW77)](https://codecov.io/gh/rich-automation/lotto-module)

`@rich-automation/lotto`는 headless browser를 활용해 JS 환경에서 로또를 자동으로 구매할 수 있는 인터페이스를 제공합니다.

## 설치

```bash
# npm
npm install @rich-automation/lotto

# pnpm
pnpm add @rich-automation/lotto
```

## 준비 사항

1. 내부적으로 Playwright 또는 Puppeteer를 사용하므로, Chromium이 사전에 설치되어 있어야 합니다. ([링크](https://github.com/rich-automation/lotto-module/blob/main/package.json#L38-L39))
2. 구매는 [동행복권](https://dhlottery.co.kr/common.do?method=main) 사이트에서 진행되며, 예치금 충전 기능은 없으므로 미리 계정에 예치금을 충전해두어야 합니다.
3. 건전 구매 서약서에 동의하세요 (https://www.dhlottery.co.kr/hpns/sdnsCamPainView), 1년 주기로 동의가 필요합니다.

## 사용법

### 기본 설정

```js
import { LottoService } from '@rich-automation/lotto';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';

// playwright 로 시작, 모든 기능 사용 가능
const lottoService = new LottoService({
  controller: chromium // puppeteer
});

// puppeteer 로 시작, 모든 기능 사용 가능
const lottoService = new LottoService({
  controller: puppeteer
});

// API 모드로 시작, check / getCheckWinningLink 기능만 사용 가능
const lottoService = new LottoService({
  controller: 'api'
});
```

옵션 설명:

- `controller`: (필수) `puppeteer`, `playwright` 모듈 또는 `"api"`
- `headless`: 기본값 `false`
- `defaultViewport`: 기본값 `{ width: 1080, height: 1024 }`
- `logLevel`: 기본값 `2` (NONE = -1, ERROR = 0, WARN = 1, INFO = 2, DEBUG = 3)

```js
import { LottoService, LogLevel } from '@rich-automation/lotto';

const lottoService = new LottoService({
  controller: chromium,
  headless: true,
  defaultViewport: { width: 1280, height: 720 },
  logLevel: LogLevel.DEBUG
});
```

### 로또 구매

```js
const ID = '<YOUR_ID>';
const PWD = '<YOUR_PASSWORD>';

await lottoService.signIn(ID, PWD);

const numbers = await lottoService.purchase(5);

console.log(numbers); // [[ 1, 14, 21, 27, 30, 44 ],[ 4, 5, 27, 29, 40, 44 ],[ 9, 18, 19, 24, 38, 42 ],[ 4, 6, 13, 20, 38, 39 ],[ 8, 9, 10, 19, 32, 40 ]]
```

### 당첨 확인

이번 회차 확인:

```js
import { getLastLottoRound } from '@rich-automation/lotto';

const numbers = [
  [1, 2, 3, 4, 5, 6],
  [5, 6, 7, 8, 9, 10]
];

const currentRound = getLastLottoRound();

const result = await lottoService.check(numbers, currentRound);

console.log(result); // [{rank:1,matchedNumbers:[1,2,3,4,5,6]},{rank:5,matchedNumbers:[5,6]]
```

다음 회차 링크 생성:

```js
import { getNextLottoRound } from '@rich-automation/lotto';

const nextRound = getNextLottoRound();
const link = lottoService.getCheckWinningLink(numbers, nextRound);

console.log(link); // "https://dhlottery.co.kr/qr.do?method=winQr&v=1071q010203040506q050607080910";
```

## API

`LottoService`는 브라우저 기반 메서드와 API 전용 메서드로 나뉩니다.

### 인증 / 세션

- `signIn(id: string, password: string): Promise<string>`
  동행복권 계정으로 로그인하고, 성공 시 재사용 가능한 쿠키 문자열을 반환합니다.
- `signInWithCookie(cookies: string): Promise<string>`
  이미 저장된 쿠키로 세션을 복구하고, 유효한 경우 최신 쿠키 문자열을 반환합니다.

### 구매

- `purchase(amount?: number): Promise<number[][]>`
  로그인된 상태에서 로또를 자동 구매합니다. `amount`는 1~5 게임이며, 반환값은 구매된 번호 목록입니다.

### 조회

- `check(numbers: number[][], round?: number): Promise<{ rank: number; matchedNumbers: number[] }[]>`
  당첨 결과를 조회합니다. `round`를 생략하면 직접 현재 회차를 계산해서 넘기는 방식을 권장합니다.
- `getCheckWinningLink(numbers: number[][], round?: number): string`
  동행복권 당첨 확인 페이지 링크를 생성합니다.

### 정리

- `destroy(): Promise<void>`
  내부 브라우저 인스턴스를 정리합니다. 브라우저 컨트롤러 사용 시 마지막에 호출하는 편이 안전합니다.

### API 모드 제한

- `controller: 'api'` 모드에서는 `check`, `getCheckWinningLink`만 사용할 수 있습니다.
- `signIn`, `signInWithCookie`, `purchase`는 브라우저 컨트롤러(`playwright`, `puppeteer`)가 필요합니다.
