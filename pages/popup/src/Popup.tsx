import '@src/Popup.css';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner, ToggleButton, ThemeProvider } from '@extension/ui';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  const injectContentScript = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
      chrome.notifications.create('inject-error', notificationOptions);
    }

    await chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        files: ['/content-runtime/example.iife.js', '/content-runtime/all.iife.js'],
      })
      .catch(err => {
        // Handling errors related to other paths
        if (err.message.includes('Cannot access a chrome:// URL')) {
          chrome.notifications.create('inject-error', notificationOptions);
        }
      });
  };

  return (
    <ThemeProvider>
      <div className="App bg-background">
        <header className="App-header text-foreground">
          <button onClick={goGithubSite}>
            <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
          </button>
          <p>
            Edit <code className="bg-muted text-muted-foreground rounded px-1">pages/popup/src/Popup.tsx</code>
          </p>
          <button
            className="bg-primary text-primary-foreground mt-4 rounded-lg px-4 py-1 font-bold shadow transition-all hover:scale-105 hover:opacity-90"
            onClick={injectContentScript}>
            {t('injectButton')}
          </button>
          <ToggleButton>{t('toggleTheme')}</ToggleButton>
        </header>
      </div>
    </ThemeProvider>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
