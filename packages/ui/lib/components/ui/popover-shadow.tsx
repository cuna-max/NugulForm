import { cn } from '@/lib/utils';
import { useShadowRoot } from '@extension/shared';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

/**
 * ShadowRoot 내부에서 사용하기 위한 PopoverContent 컴포넌트
 * ShadowRoot를 container로 사용하여 Portal이 ShadowDOM 내부에 렌더링되도록 함
 */
export const PopoverContentShadow = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => {
  const shadowRoot = useShadowRoot();

  return (
    <PopoverPrimitive.Portal container={shadowRoot || undefined}>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-border z-50 w-72 origin-[--radix-popover-content-transform-origin] rounded-md border p-4 shadow-md outline-none',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContentShadow.displayName = PopoverPrimitive.Content.displayName;
