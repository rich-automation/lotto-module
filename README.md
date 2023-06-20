# @rich-automation/lotto

[![npm](https://img.shields.io/npm/v/@rich-automation/lotto.svg?style=popout&colorB=yellow)](https://www.npmjs.com/package/@rich-automation/lotto)
[![ci](https://github.com/rich-automation/lotto-module/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/rich-automation/lotto-module/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/rich-automation/lotto-module/branch/main/graph/badge.svg?token=18IAW1OW77)](https://codecov.io/gh/rich-automation/lotto-module)

`@rich-automation/lotto` 패키지는 headless browser를 이용해 js환경에서 자동으로 로또를 구매할 수 있는 인터페이스를 제공합니다.



## Installation
```shell
# npm
npm install @rich-automation/lotto

# yarn
yarn add @rich-automation/lotto
```

## Preparation
1. 내부적으로 playwright/puppeteer를 사용하므로 머신에 chromium 을 미리 설치해주셔야 합니다. ([link](https://github.com/rich-automation/lotto-module/blob/main/package.json#L38-L39))
2. [동행복권](https://dhlottery.co.kr/common.do?method=main) 사이트를 통해 구매가 이루어지며 예치금 충전은 지원하지 않으므로 미리 동행복권 계정에 예치금을 충전해두어야합니다.

## Usage
### 공통
lottoService 객체 인스턴스를 생성합니다.
```js
import { LottoService } from '@rich-automation/lotto';

const lottoService = new LottoService();
//...
```
LottoService 클래스의 생성자는 BrowserConfigs를 인수로 받을 수 있습니다. 인수로 전달된 configs는 다음과 같은 속성을 가질 수 있습니다:

- `controller(default: 'playwright')`: 내부적으로 어떤 컨트롤러(puppeteer/playwright)를 사용할 지 지정할 수 있습니다.
- `headless(default: false)`: 브라우저의 헤드리스 모드 여부를 설정합니다.
- `defaultViewport(default: { width: 1080, height: 1024 })`: 브라우저의 기본 뷰포트 크기를 설정합니다.
- `logLevel(default:2)`:콘솔 로그 수준을 설정합니다. (NONE = -1, ERROR = 0, WARN = 1, INFO = 2, DEBUG = 3)
```js
//example
import {LottoService, LogLevel} from '@rich-automation/lotto'

const lottoService = new LottoService({
  headless: true,
  defaultViewport: { width: 1280, height: 720 }, 
  logLevel: LogLevel.DEBUG
});
```
### 구매
```js
import {LottoService} from "@rich-automation/lotto";

const ID = "<YOUR_ID>";
const PWD = "<YOUR_PASSWORD>";

const lottoService = new LottoService({
    headless:true
});

await lottoService.signIn(ID,PWD);

const numbers = await lottoService.purchase(5);
console.log(numbers); //[[ 1, 14, 21, 27, 30, 44 ],[ 4, 5, 27, 29, 40, 44 ],[ 9, 18, 19, 24, 38, 42 ],[ 4, 6, 13, 20, 38, 39 ],[ 8, 9, 10, 19, 32, 40 ]]



```

### 당첨 확인
이번 회차 당첨 확인
```js
import {getLastLottoRound,LottoService} from "@rich-automation/lotto";

const numbers = [[1,2,3,4,5,6],[5,6,7,8,9,10]];

const lottoService = new LottoService({
    headless:true
});

const currentRound = getLastLottoRound();

const result = await lottoService.check(numbers, currentRound)
console.log(result) //[{rank:1,matchedNumbers:[1,2,3,4,5,6]},{rank:5,matchedNumbers:[5,6]]
```
다음 회차 당첨 링크 생성
```js
import {getNextLottoRound,LottoService} from "@rich-automation/lotto";

const numbers = [[1,2,3,4,5,6],[5,6,7,8,9,10]];


const lottoService = new LottoService({
    headless:true
});

const nextRound = getNextLottoRound();
const link = lottoService.getCheckWinningLink(numbers, nextRound);
console.log(link) //"https://dhlottery.co.kr/qr.do?method=winQr&v=1071q010203040506q050607080910";

```


## Method
### signIn
- `(id: string, password: string) => Promise<string>`
- description: id와 pwd를 입력받아 동행복권에 로그인합니다. 성공할경우 로그인 쿠키를 반환합니다.
### signInWithCookie
- `(cookies: string) => Promise<string>`
- description: 로그인 쿠키를 입력받아 동행복권에 로그인합니다. 성공할경우 로그인 쿠키를 반환합니다.
### purchase
- `(amount?: number) => Promise<number[][]>`
- description: 구매할 게임 횟수를 입력받아 로또를 구매하고, 구매한 번호를 이차원 배열 형태로 반환합니다. amount는 1~5사이 값을 가집니다.
### check
- `(numbers: number[][], round?: number) => Promise<{ rank:number; matchedNumbers:number[] }[]>`
- description: 회차와 해당 회차에 구매한 로또번호를 입력받아 당첨 등수(rank)와 맞춘 번호(matchedNumbers)목록을 반환합니다. 회차를 지정하지 않으면 최신 회차를 기준으로 확인합니다.
### getCheckWinningLink
- `(numbers: number[][], round?: number) => string`
- description: 회차와 구매한 로또 번호를 입력받아 당첨 확인 링크를 생성합니다. 로또 번호는 해당 회차에 구매한 모든 게임을 이차원 배열 형태로 입력받습니다. 회차를 지정하지 않으면 다음 회차를 기준으로 링크를 생성합니다.
### destroy
- `() => Promise<void>`
- description: LottoService 인스턴스에서 사용한 브라우저 컨트롤러를 종료합니다.
