import { useUpgradeModalStore } from '../store/upgradeModalStore.js';

export function useUpgradeModal() {
  const showUpgradeModal = useUpgradeModalStore((s) => s.showUpgradeModal);
  const hideUpgradeModal = useUpgradeModalStore((s) => s.hideUpgradeModal);
  const upgradeModalState = useUpgradeModalStore((s) => ({
    isOpen: s.open,
    feature: s.featureKey,
    requiredPlan: s.requiredPlanId,
    message: s.message,
    title: s.title,
  }));
  return { showUpgradeModal, hideUpgradeModal, upgradeModalState };
}
