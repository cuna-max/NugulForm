import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import type { BadgeProps } from '../ui/badge';
import type { ExtensionStateType, AutofillStatus } from '@extension/storage';

// =====================
// Types
// =====================

export interface PopupHeaderProps {
  /** 익스텐션 상태 */
  extensionState: ExtensionStateType;
  /** 자동 채우기 상태 */
  autofillStatus: AutofillStatus;
  /** 로고 이미지 URL */
  logoUrl: string;
}

interface BadgeConfig {
  variant: BadgeProps['variant'];
  label: string;
}

// =====================
// Constants
// =====================

const BADGE_CONFIG: Record<'active' | 'disabled' | 'filled', BadgeConfig> = {
  active: { variant: 'success', label: 'Active' },
  disabled: { variant: 'secondary', label: 'Disabled' },
  filled: { variant: 'success', label: '기입 완료' },
};

// =====================
// Component
// =====================

/**
 * Popup 헤더 컴포넌트
 * - 로고, 타이틀, 상태 배지 표시
 */
export const PopupHeader = ({ extensionState, autofillStatus, logoUrl }: PopupHeaderProps) => {
  const getBadgeConfig = () => {
    if (autofillStatus === 'filled') return BADGE_CONFIG.filled;
    return extensionState === 'active' ? BADGE_CONFIG.active : BADGE_CONFIG.disabled;
  };

  const { variant, label } = getBadgeConfig();

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <img src={logoUrl} alt="NugulForm" className="h-7 w-7" />
          <span className="text-foreground text-lg font-bold">너굴폼</span>
        </div>
        <Badge variant={variant}>{label}</Badge>
      </div>
      <Separator />
    </>
  );
};
