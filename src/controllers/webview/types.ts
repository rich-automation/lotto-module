export interface WebViewBridge {
  readonly __type: 'webview';

  /** 브릿지 메서드 호출 (postMessage → onMessage 왕복) */
  call(method: string, args: unknown[]): Promise<unknown>;

  /** WebView 페이지 네비게이션 (완료 시 resolve) */
  navigateTo(url: string, waitUntil?: 'load' | 'idle'): Promise<void>;

  /** 현재 URL 반환 */
  getCurrentUrl(): string;

  /** WebView 리소스 정리 */
  destroy(): void;
}
