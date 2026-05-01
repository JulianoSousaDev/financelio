import { useFamilyContext } from '../contexts/FamilyContext';

export function useFamilyMode() {
  const { isFamilyMode, familyId, toggleFamilyMode, isInFamily } = useFamilyContext();

  return {
    isFamilyMode,
    familyId,
    toggleFamilyMode,
    isInFamily,
  };
}
