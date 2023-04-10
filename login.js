// import puppeteer from "puppeteer";
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size-1920,1080"],
    slowMo: 30,
  });
  const page = await browser.newPage();

  await Promise.all([
    page.goto("https://dhlottery.co.kr/user.do?method=login&returnUrl="),
    page.waitForNavigation(),
  ]);

  const id_input = "#userId";
  const password_input =
    "#article > div:nth-child(2) > div > form > div > div.inner > fieldset > div.form > input[type=password]:nth-child(2)";
  const login_button =
    "#article > div:nth-child(2) > div > form > div > div.inner > fieldset > div.form > a";

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  await page.type(id_input, "YOUR_ID");
  await page.type(password_input, "YOUR_PASSWORD");
  await page.click(login_button);

  page.on("dialog", async (dialog) => {
    //아이디 또는 비밀번호를 잘못 입력했을 경우 브라우저를 닫고 종료한다.
    if (dialog.message() === "아이디 또는 비밀번호를 잘못 입력하셨습니다") {
      console.error("아이디 또는 비밀번호를 잘못 입력하셨습니다");
      return browser.close();
    }
  });

  await page.waitForNavigation();

  //모든 팝업이 뜰때까지 기다리기
  await page.waitForTimeout(1000);

  //현재 사용중인 스크린빼고 모든 창을 닫는다.
  const pages = await browser.pages();
  pages.map((item, index) => {
    if (index !== 1) {
      item.close();
    }
  });

  //   await browser.close();
})();
