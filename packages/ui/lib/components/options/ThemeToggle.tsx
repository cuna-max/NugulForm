import { Switch } from '../ui/switch';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme } = useStorage(exampleThemeStorage);
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-2">
      <Sun className="text-muted-foreground h-4 w-4" />
      <Switch checked={isDark} onCheckedChange={exampleThemeStorage.toggle} aria-label="다크 모드 토글" />
      <Moon className="text-muted-foreground h-4 w-4" />
    </div>
  );
};
