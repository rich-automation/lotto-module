# @rich-automation/lotto

[![ci](https://github.com/rich-automation/lotto-module/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/rich-automation/lotto-module/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/rich-automation/lotto-module/branch/main/graph/badge.svg?token=18IAW1OW77)](https://codecov.io/gh/rich-automation/lotto-module)

rich automation은 headless browser를 이용해 js환경에서 자동으로 로또를 구매할 수 있는 인터페이스를 제공합니다.



## Installation
```shell
# npm
npm install @rich-automation/lotto

# yarn
yarn add @rich-automation/lotto
```

## Preparation
1. 내부적으로 puppeteer를 사용하므로 직접 실행하기 위해서는 머신에 chrome이나 chromium이 설치되어 있어야합니다.
2. <a href='https://dhlottery.co.kr/common.do?method=main'>동행복권</a> 사이트를 통해 구매가 이루어지며 예치금 충전은 지원하지 않으므로 미리 동행복권 계정에 예치금을 충전해두어야합니다.

## Usage
### 공통
lottoService 객체 인스턴스를 생성합니다.
```js
import { LottoService } from '@rich-automation/lotto';

const lottoService = new LottoService();
//...
```
LottoService 클래스의 생성자는 BrowserConfigs를 인수로 받을 수 있습니다. 인수로 전달된 configs는 다음과 같은 속성을 가질 수 있습니다:

- headless(기본값: false): 브라우저의 헤드리스 모드 여부를 설정합니다.
- defaultViewport(기본값: { width: 1080, height: 1024 }): 브라우저의 기본 뷰포트 크기를 설정합니다.
- 기타 puppeteer의 launch 메소드에 전달할 수 있는 속성들
```js
//example
const lottoService = new LottoService({
  headless: true,
  defaultViewport: { width: 1280, height: 720 },
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
import {getCurrentLottoRound,LottoService} from "@rich-automation/lotto";

const numbers = "<YOUR_NUMBERS>";

const lottoService = new LottoService({
    headless:true
});

const thisRound = getCurrentLottoRound();
numbers.map((singleGameNumbers)=>{
    const result = lottoService.check(singleGameNumbers,thisRound)
    console.log(result) //{rank:1,matchedNumbers:[1,2,3,4,5,6]}
})
```
다음 회차 당첨 링크 생성
```js
import {getCurrentLottoRound,LottoService} from "@rich-automation/lotto";

const numbers = "<YOUR_NUMBERS>";

const lottoService = new LottoService({
    headless:true
});

const nextRound = getCurrentLottoRound()+1;
const link = lottoService.getCheckWinningLink(nextRound,numbers);
console.log(link) //"https://dhlottery.co.kr/qr.do?method=winQr&v=1071q011421273044q040527294044q091819243842q040613203839q080910193240";

```


## Method
### signIn
- type: (id: string, password: string)=>Promise&lt;string&gt;
- description: id와 pwd를 입력받아 동행복권에 로그인합니다. 성공할경우 로그인 쿠키를 반환합니다.
### signInWithCookie
- type:(cookies: string)=>Promise&lt;string&gt;
- description: 로그인 쿠키를 입력받아 동행복권에 로그인합니다. 성공할경우 로그인 쿠키를 반환합니다.
### purchase
- type:(amount: number = 5):Promise&lt;number[][]&gt;
- description: 구매할 게임 횟수를 입력받아 로또를 구매하고, 구매한 번호를 이차원 배열 형태로 반환합니다. amount는 1~5사이 값을 가집니다.
### check
- type:(numbers: number[], round: number = getCurrentLottoRound()):Promise&lt;{rank:number;matchedNumbers:number[]}&gt;
- description: 로또번호와 회차를 입력받아 당첨 등수(rank)와 맞춘 번호(matchedNumbers)를 반환합니다. 회차를 지정하지 않으면 최신 회차를 기준으로 확인합니다.
### getCheckWinningLink
- type:(round: number, numbers: number[][]): string
- description: 회차와 구매한 로또 번호를 입력받아 당첨 확인 링크를 생성합니다. 로또 번호는 해당 회차에 구매한 모든 게임을 이차원 배열 형태로 입력받습니다.
### destroy
- type:():Promise&lt;void&gt;
- description: LottoService 인스턴스에서 사용한 브라우저 컨트롤러를 종료합니다.
