import '@src/NewTab.css';
import '@src/NewTab.scss';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner, ToggleButton, ThemeProvider } from '@extension/ui';

const NewTab = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'new-tab/logo_horizontal.svg' : 'new-tab/logo_horizontal_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  return (
    <ThemeProvider>
      <div className="App bg-background">
        <header className="App-header text-foreground">
          <button onClick={goGithubSite}>
            <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
          </button>
          <p>
            Edit <code className="bg-muted text-muted-foreground rounded px-1">pages/new-tab/src/NewTab.tsx</code>
          </p>
          <h6 className="text-accent-foreground">The color of this paragraph is defined using SASS.</h6>
          <ToggleButton>{t('toggleTheme')}</ToggleButton>
        </header>
      </div>
    </ThemeProvider>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <LoadingSpinner />), ErrorDisplay);
