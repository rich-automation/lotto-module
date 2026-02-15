import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import type { WebViewBridge } from './controllers/webview/types';
import { BRIDGE_SCRIPT } from './controllers/webview/bridgeScript';
import { LottoServiceCore } from './services/lottoService.core';
import { WebViewController } from './controllers/webview';
import type { LottoServiceInterface } from './types';
import Logger, { type LogLevel } from './logger';

interface UseLottoServiceOptions {
  headless?: boolean;
  logLevel?: LogLevel;
}

interface UseLottoServiceReturn {
  LottoWebView: React.ComponentType;
  service: LottoServiceInterface;
}

const CALL_TIMEOUT = 15_000;
const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'file:', 'vbscript:'];
const DEDUP_METHODS = new Set(['exists', 'querySelectorAll', 'getUrl', 'getCookies']);

export function useLottoService(options: UseLottoServiceOptions = {}): UseLottoServiceReturn {
  const { headless = true, logLevel } = options;

  const webviewRef = useRef<WebView>(null);
  const pendingCalls = useRef<Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>>(new Map());
  const inflightCalls = useRef<Map<string, Promise<unknown>>>(new Map());
  const navigationPromise = useRef<{ resolve: () => void } | null>(null);
  const currentUrl = useRef('');
  const logLevelRef = useRef(logLevel);
  logLevelRef.current = logLevel;

  // P5: 네비게이션 promise resolve 헬퍼 (null 먼저 설정하여 이중 resolve 방지)
  const resolveNavigation = useCallback(() => {
    const pending = navigationPromise.current;
    if (pending) {
      navigationPromise.current = null;
      pending.resolve();
    }
  }, []);

  // WebView → RN 메시지 수신
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as { __lotto_call_id__?: string; result?: unknown };
      if (!data.__lotto_call_id__) return;

      const pending = pendingCalls.current.get(data.__lotto_call_id__);
      if (pending) {
        pending.resolve(data.result);
        pendingCalls.current.delete(data.__lotto_call_id__);
      }
    } catch {
      // non-bridge 메시지 무시
    }
  }, []);

  // 네비게이션 상태 추적
  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    currentUrl.current = navState.url;
    if (!navState.loading) resolveNavigation();
  }, [resolveNavigation]);

  // WebView 로드 완료
  const handleLoadEnd = useCallback(() => {
    resolveNavigation();
  }, [resolveNavigation]);

  // Bridge 구현
  const bridge = useMemo<WebViewBridge>(() => {
    function callBridge(method: string, args: unknown[]): Promise<unknown> {
      const callId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pendingCalls.current.delete(callId);
          reject(new Error(`WebView bridge timeout: ${method}(${JSON.stringify(args)})`));
        }, CALL_TIMEOUT);

        pendingCalls.current.set(callId, {
          resolve: v => {
            clearTimeout(timer);
            resolve(v);
          },
          reject: e => {
            clearTimeout(timer);
            reject(e);
          },
          timer
        });

        const message = JSON.stringify({ __lotto_call_id__: callId, method, args });
        webviewRef.current?.injectJavaScript(`window.postMessage(${JSON.stringify(message)}, '*'); true;`);
      });
    }

    // P7: 읽기 전용 메서드 중복 호출 제거
    function call(method: string, args: unknown[]): Promise<unknown> {
      if (DEDUP_METHODS.has(method)) {
        const key = method + ':' + JSON.stringify(args);
        const inflight = inflightCalls.current.get(key);
        if (inflight) return inflight;

        const promise = callBridge(method, args).finally(() => inflightCalls.current.delete(key));
        inflightCalls.current.set(key, promise);
        return promise;
      }

      return callBridge(method, args);
    }

    function navigateTo(url: string, _waitUntil?: 'load' | 'idle'): Promise<void> {
      // H1: 위험한 프로토콜 차단
      const lower = url.toLowerCase().trim();
      if (BLOCKED_PROTOCOLS.some(p => lower.startsWith(p))) {
        return Promise.reject(new Error(`Blocked navigation to unsafe URL: ${url}`));
      }

      return new Promise(resolve => {
        resolveNavigation();
        navigationPromise.current = { resolve };
        webviewRef.current?.injectJavaScript(`window.location.href = ${JSON.stringify(url)}; true;`);
      });
    }

    function getCurrentUrl() {
      return currentUrl.current;
    }

    function destroy() {
      for (const [, pending] of pendingCalls.current) {
        clearTimeout(pending.timer);
        pending.reject(new Error('WebView bridge destroyed'));
      }
      pendingCalls.current.clear();
      inflightCalls.current.clear();
      resolveNavigation();
    }

    return { __type: 'webview' as const, call, navigateTo, getCurrentUrl, destroy };
  }, [resolveNavigation]);

  // P1: logLevel을 ref로 안정화하여 불필요한 service 재생성 방지
  const service = useMemo(() => {
    const logger = new Logger(logLevelRef.current, '[LottoService]');
    const configs = { controller: bridge, logLevel: logLevelRef.current };
    const controller = new WebViewController(configs, logger);
    return new LottoServiceCore(controller, logger);
  }, [bridge]);

  // Cleanup
  useEffect(() => {
    return () => {
      bridge.destroy();
    };
  }, [bridge]);

  // WebView 컴포넌트
  const LottoWebView = useCallback(
    () =>
      React.createElement(
        View,
        { style: headless ? styles.hidden : styles.visible },
        React.createElement(WebView, {
          ref: webviewRef,
          source: { uri: 'about:blank' },
          javaScriptEnabled: true,
          domStorageEnabled: true,
          injectedJavaScriptBeforeContentLoaded: BRIDGE_SCRIPT,
          onMessage: handleMessage,
          onNavigationStateChange: handleNavigationStateChange,
          onLoadEnd: handleLoadEnd
        })
      ),
    [headless, handleMessage, handleNavigationStateChange, handleLoadEnd]
  );

  return { LottoWebView, service };
}

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
    position: 'absolute',
    opacity: 0,
    overflow: 'hidden'
  },
  visible: {
    flex: 1
  }
});

// Re-export useful types and utils
export { LottoServiceCore } from './services/lottoService.core';
export { LogLevel } from './logger';
export type { LottoServiceInterface, BrowserConfigs } from './types';
export { getLastLottoRound } from './utils/getLastLottoRound';
export { getNextLottoRound } from './utils/getNextLottoRound';
export { getCheckWinningLink } from './utils/getCheckWinningLink';
export { checkWinning } from './utils/checkWinning';
