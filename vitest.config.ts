import { defineConfig } from 'vitest/config';

/**
 * Vitest 워크스페이스 설정
 * 각 패키지는 자체 vitest.config.ts를 가질 수 있음
 */
export default defineConfig({
  test: {
    // 글로벌 설정
    globals: true,
    environment: 'node',
  },
});
