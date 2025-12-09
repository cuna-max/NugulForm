import { resolve } from 'node:path';
import { makeEntryPointPlugin } from '@extension/hmr';
import { getContentScriptEntries, withPageConfig } from '@extension/vite-config';
import { IS_DEV } from '@extension/env';
import { build } from 'vite';
import { build as buildTW } from 'tailwindcss/lib/cli/build';

const rootDir = resolve(import.meta.dirname);
const srcDir = resolve(rootDir, 'src');
const matchesDir = resolve(srcDir, 'matches');

const configs = Object.entries(getContentScriptEntries(matchesDir)).map(([name, entry]) => {
  // 폴더 이름을 유효한 JS 식별자로 변환 (하이픈을 언더스코어로)
  const jsIdentifier = name.replace(/-/g, '_');

  return {
    name: jsIdentifier,
    folderName: name, // 원본 폴더 이름 유지
    config: withPageConfig({
      mode: IS_DEV ? 'development' : undefined,
      resolve: {
        alias: {
          '@src': srcDir,
        },
      },
      publicDir: resolve(rootDir, 'public'),
      plugins: [IS_DEV && makeEntryPointPlugin()],
      build: {
        lib: {
          name: jsIdentifier,
          formats: ['iife'],
          entry,
          fileName: name, // 파일 이름은 원본 유지 (manifest.ts와 일치)
        },
        outDir: resolve(rootDir, '..', '..', 'dist', 'content-ui'),
      },
    }),
  };
});

const builds = configs.map(async ({ folderName, config }) => {
  const folder = resolve(matchesDir, folderName);
  const args = {
    ['--input']: resolve(folder, 'index.css'),
    ['--output']: resolve(rootDir, 'dist', folderName, 'index.css'),
    ['--config']: resolve(rootDir, 'tailwind.config.ts'),
    ['--watch']: IS_DEV,
  };
  await buildTW(args);
  //@ts-expect-error This is hidden property into vite's resolveConfig()
  config.configFile = false;
  await build(config);
});

await Promise.all(builds);
