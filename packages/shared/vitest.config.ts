import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest 설정 - @extension/shared 패키지
 * autofill 모듈 테스트에 집중
 */
export default defineConfig({
  test: {
    // jsdom 환경 사용 (Google Forms DOM 시뮬레이션)
    environment: 'jsdom',

    // 글로벌 테스트 API 활성화
    globals: true,

    // 테스트 파일 패턴
    include: ['lib/**/__tests__/**/*.test.ts', 'lib/**/*.test.ts'],

    // 제외할 파일
    exclude: ['node_modules', 'dist', '.turbo'],

    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // autofill 폴더에 집중
      include: ['lib/autofill/**/*.ts'],
      exclude: [
        'lib/autofill/**/*.test.ts',
        'lib/autofill/__tests__/**',
        'lib/autofill/types.ts',
        'lib/autofill/index.ts',
      ],
      // 커버리지 임계값
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },

  resolve: {
    alias: {
      '@extension/storage': path.resolve(__dirname, '../storage'),
      '@extension/shared': path.resolve(__dirname, './lib'),
    },
  },
});
