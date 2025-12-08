import { t } from '@extension/i18n';
import { ToggleButton, ThemeProvider } from '@extension/ui';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    console.log('[CEB] Content ui all loaded');
  }, []);

  return (
    <ThemeProvider>
      <div className="bg-secondary flex items-center justify-between gap-2 rounded-lg px-2 py-1">
        <div className="text-secondary-foreground flex gap-1 text-sm">
          Edit <strong className="text-primary">pages/content-ui/src/matches/all/App.tsx</strong> and save to reload.
        </div>
        <ToggleButton className={'mt-0'}>{t('toggleTheme')}</ToggleButton>
      </div>
    </ThemeProvider>
  );
}
