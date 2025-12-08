import { useStorage } from './use-storage.js';
import { optionsStorage } from '@extension/storage';
import { useCallback, useMemo } from 'react';
import type { UserField, AutoOption } from '@extension/storage';

// =====================
// useUserFields Hook
// =====================

interface UseUserFieldsReturn {
  userFields: UserField[];
  /** 값이 있는 필드만 반환 */
  filledFields: UserField[];
  /** 값이 없는 필드만 반환 */
  emptyFields: UserField[];
  updateField: (id: string, value: string) => Promise<void>;
  clearField: (id: string) => Promise<void>;
  getFieldValue: (id: string) => string;
  copyToClipboard: (id: string) => Promise<boolean>;
}

export const useUserFields = (): UseUserFieldsReturn => {
  const { userFields = [] } = useStorage(optionsStorage);

  const filledFields = useMemo(() => userFields.filter(field => field.value), [userFields]);
  const emptyFields = useMemo(() => userFields.filter(field => !field.value), [userFields]);

  const updateField = useCallback(async (id: string, value: string) => {
    await optionsStorage.updateUserField(id, value);
  }, []);

  const clearField = useCallback(async (id: string) => {
    await optionsStorage.clearUserField(id);
  }, []);

  const getFieldValue = useCallback(
    (id: string) => {
      const field = userFields.find(f => f.id === id);
      return field?.value ?? '';
    },
    [userFields],
  );

  const copyToClipboard = useCallback(
    async (id: string) => {
      const value = getFieldValue(id);
      if (!value) return false;

      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        return false;
      }
    },
    [getFieldValue],
  );

  return {
    userFields,
    filledFields,
    emptyFields,
    updateField,
    clearField,
    getFieldValue,
    copyToClipboard,
  };
};

// =====================
// useAutoOptions Hook
// =====================

interface UseAutoOptionsReturn {
  autoOptions: AutoOption[];
  toggleOption: (id: string) => Promise<void>;
  setOption: (id: string, enabled: boolean) => Promise<void>;
  isOptionEnabled: (id: string) => boolean;
}

export const useAutoOptions = (): UseAutoOptionsReturn => {
  const { autoOptions = [] } = useStorage(optionsStorage);

  const toggleOption = useCallback(async (id: string) => {
    await optionsStorage.toggleAutoOption(id);
  }, []);

  const setOption = useCallback(async (id: string, enabled: boolean) => {
    await optionsStorage.setAutoOption(id, enabled);
  }, []);

  const isOptionEnabled = useCallback(
    (id: string) => {
      const option = autoOptions.find(o => o.id === id);
      return option?.enabled ?? false;
    },
    [autoOptions],
  );

  return {
    autoOptions,
    toggleOption,
    setOption,
    isOptionEnabled,
  };
};

// =====================
// Combined useOptions Hook
// =====================

export const useOptions = () => {
  const userFieldsHook = useUserFields();
  const autoOptionsHook = useAutoOptions();

  return useMemo(
    () => ({
      ...userFieldsHook,
      ...autoOptionsHook,
    }),
    [userFieldsHook, autoOptionsHook],
  );
};
