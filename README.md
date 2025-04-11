# @rich-automation/lotto

[![npm](https://img.shields.io/npm/v/@rich-automation/lotto.svg?style=popout&colorB=yellow)](https://www.npmjs.com/package/@rich-automation/lotto)  
[![ci](https://github.com/rich-automation/lotto-module/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/rich-automation/lotto-module/actions/workflows/ci.yml)  
[![codecov](https://codecov.io/gh/rich-automation/lotto-module/branch/main/graph/badge.svg?token=18IAW1OW77)](https://codecov.io/gh/rich-automation/lotto-module)

`@rich-automation/lotto`는 headless browser를 활용해 JS 환경에서 로또를 자동으로 구매할 수 있는 인터페이스를 제공합니다.

## 설치

```bash
# npm
npm install @rich-automation/lotto

# yarn
yarn add @rich-automation/lotto
```

## 준비 사항

1. 내부적으로 Playwright 또는 Puppeteer를 사용하므로, Chromium이 사전에 설치되어 있어야 합니다. ([링크](https://github.com/rich-automation/lotto-module/blob/main/package.json#L38-L39))
2. 구매는 [동행복권](https://dhlottery.co.kr/common.do?method=main) 사이트에서 진행되며, 예치금 충전 기능은 없으므로 미리 계정에 예치금을 충전해두어야 합니다.

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

console.log(numbers);
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

console.log(result);
```

다음 회차 링크 생성:

```js
import { getNextLottoRound } from '@rich-automation/lotto';

const nextRound = getNextLottoRound();
const link = lottoService.getCheckWinningLink(numbers, nextRound);

console.log(link);
```

## API

### `signIn(id: string, password: string): Promise<string>`

동행복권 로그인, 성공 시 로그인 쿠키 반환

### `signInWithCookie(cookies: string): Promise<string>`

쿠키 기반 로그인

### `purchase(amount?: number): Promise<number[][]>`

로또 번호 자동 구매 (1~5 게임)

### `check(numbers: number[][], round?: number): Promise<{ rank:number; matchedNumbers:number[] }[]>`

(API) 당첨 결과 확인

### `getCheckWinningLink(numbers: number[][], round?: number): string`

(API) 당첨 확인 링크 생성

### `destroy(): Promise<void>`

브라우저 인스턴스 종료
