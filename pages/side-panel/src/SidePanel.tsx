import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner, ThemeProvider } from '@extension/ui';
import { SidePanelActive, SidePanelDisabled, SidePanelFilled } from '@src/components';
import { usePanelView } from '@src/hooks/usePanelView';

// =====================
// Component
// =====================

const SidePanel = () => {
  const { viewType, logoUrl } = usePanelView();

  return (
    <ThemeProvider>
      <div className="App bg-background">
        {viewType === 'active' && <SidePanelActive logoUrl={logoUrl} />}
        {viewType === 'disabled' && <SidePanelDisabled logoUrl={logoUrl} />}
        {viewType === 'filled' && <SidePanelFilled logoUrl={logoUrl} />}
      </div>
    </ThemeProvider>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
