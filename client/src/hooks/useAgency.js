import { useShallow } from 'zustand/react/shallow';
import useAgencyStore from '../store/agencyStore.js';

/**
 * Subscribes to agency owner store (links/members/agency snapshot).
 * Prefer `useAgencyStore` directly when you only need actions without subscribing.
 */
export function useAgency() {
  return useAgencyStore(
    useShallow((s) => ({
      agency: s.agency,
      links: s.links,
      members: s.members,
      isLoading: s.isLoading,
      error: s.error,
      fetchAgency: s.fetchAgency,
      fetchLinks: s.fetchLinks,
      fetchMembers: s.fetchMembers,
      createLink: s.createLink,
      deactivateLink: s.deactivateLink,
      removeMember: s.removeMember,
    }))
  );
}
