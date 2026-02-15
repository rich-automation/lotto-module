// WebView에 주입되는 브릿지 스크립트
// 모든 DOM 조작은 이 스크립트 내부에서 실행되며, postMessage로 결과를 반환함
export const BRIDGE_SCRIPT = `
(function() {
  if (window.__LOTTO_BRIDGE__) return;

  window.__LOTTO_BRIDGE__ = {
    fill: function(selector, value) {
      var el = document.querySelector(selector);
      if (!el) return { ok: false, error: 'Element not found: ' + selector };
      el.focus();
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    },

    click: function(selector, domDirect) {
      var el = document.querySelector(selector);
      if (!el) return { ok: false, error: 'Element not found: ' + selector };
      el.click();
      return { ok: true };
    },

    select: function(selector, value) {
      var el = document.querySelector(selector);
      if (!el) return { ok: false, error: 'Element not found: ' + selector };
      el.value = value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    },

    exists: function(selector, containsText) {
      var el = document.querySelector(selector);
      if (!el) return false;
      if (containsText) return (el.textContent || '').indexOf(containsText) !== -1;
      return true;
    },

    querySelectorAll: function(selector) {
      var MAX_DEPTH = 5;
      function toFakeDOM(el, depth) {
        return {
          className: el.className || '',
          innerHTML: el.innerHTML || '',
          children: depth < MAX_DEPTH
            ? Array.from(el.children).map(function(c) { return toFakeDOM(c, depth + 1); })
            : []
        };
      }
      return Array.from(document.querySelectorAll(selector)).map(function(el) { return toFakeDOM(el, 0); });
    },

    getUrl: function() {
      return window.location.href;
    },

    getCookies: function() {
      return document.cookie;
    },

    setCookies: function(cookieString) {
      cookieString.split('; ').forEach(function(cookie) {
        document.cookie = cookie;
      });
      return { ok: true };
    },

    waitForSelector: function(selector, timeout) {
      return new Promise(function(resolve) {
        var el = document.querySelector(selector);
        if (el) { resolve({ ok: true }); return; }

        var observer = new MutationObserver(function() {
          var found = document.querySelector(selector);
          if (found) {
            observer.disconnect();
            clearTimeout(timer);
            resolve({ ok: true });
          }
        });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

        var timer = setTimeout(function() {
          observer.disconnect();
          resolve({ ok: false, error: 'Timeout waiting for: ' + selector });
        }, timeout || 10000);
      });
    }
  };

  var ALLOWED_METHODS = ['fill','click','select','exists','querySelectorAll','getUrl','getCookies','setCookies','waitForSelector'];

  // 커맨드 수신 리스너
  window.addEventListener('message', function(e) {
    try {
      var msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (!msg || !msg.__lotto_call_id__ || !msg.method) return;
      if (ALLOWED_METHODS.indexOf(msg.method) === -1) return;

      var fn = window.__LOTTO_BRIDGE__[msg.method];
      if (!fn) return;

      Promise.resolve(fn.apply(null, msg.args || [])).then(function(result) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          __lotto_call_id__: msg.__lotto_call_id__,
          result: result
        }));
      });
    } catch (err) {
      if (msg && msg.__lotto_call_id__) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          __lotto_call_id__: msg.__lotto_call_id__,
          result: { ok: false, error: String(err) }
        }));
      }
    }
  });

  true;
})();
`;
