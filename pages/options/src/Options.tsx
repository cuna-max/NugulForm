import { withErrorBoundary, withSuspense, useUserFields, useAutoOptions } from '@extension/shared';
import {
  ErrorDisplay,
  LoadingSpinner,
  ThemeProvider,
  Card,
  CardContent,
  Separator,
  OptionsHeader,
  UserFieldsSection,
  AutoOptionsSection,
} from '@extension/ui';

const OptionsContent = () => {
  const { userFields, updateField, copyToClipboard, clearField } = useUserFields();
  const { autoOptions, toggleOption } = useAutoOptions();

  const logoSrc = chrome.runtime.getURL('nugul-logo.png');

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card>
        <OptionsHeader logoSrc={logoSrc} title="NugulForm 설정" description="자동 입력 설정 및 필드 관리" />

        <CardContent className="p-6">
          <div className="space-y-8">
            <UserFieldsSection
              title="사용자 필드"
              description="자주 사용하는 정보를 저장하세요"
              userFields={userFields}
              onSave={updateField}
              onCopy={copyToClipboard}
              onClear={clearField}
            />

            <Separator />

            <AutoOptionsSection
              title="자동 옵션"
              description="자동 입력 동작을 설정하세요"
              autoOptions={autoOptions}
              onToggle={toggleOption}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Options = () => (
  <ThemeProvider>
    <div className="bg-background text-foreground min-h-screen">
      <OptionsContent />
    </div>
  </ThemeProvider>
);

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
