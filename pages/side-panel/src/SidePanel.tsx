import '@src/SidePanel.css';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner, ToggleButton, ThemeProvider } from '@extension/ui';

const SidePanel = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'side-panel/logo_vertical.svg' : 'side-panel/logo_vertical_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  return (
    <ThemeProvider>
      <div className="App bg-background">
        <header className="App-header text-foreground">
          <button onClick={goGithubSite}>
            <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
          </button>
          <p>
            Edit <code className="bg-muted text-muted-foreground rounded px-1">pages/side-panel/src/SidePanel.tsx</code>
          </p>
          <ToggleButton>{t('toggleTheme')}</ToggleButton>
        </header>
      </div>
    </ThemeProvider>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
