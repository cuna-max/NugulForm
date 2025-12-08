import globalConfig from '@extension/tailwindcss-config';
import { deepmerge } from 'deepmerge-ts';
import type { Config } from 'tailwindcss';

export const withUI = (tailwindConfig: Config): Config =>
  deepmerge(tailwindConfig, {
    content: ['../../packages/ui/lib/**/*.tsx'],
    presets: [globalConfig],
  });
