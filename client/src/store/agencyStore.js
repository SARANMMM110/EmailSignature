import { create } from 'zustand';
import { agencyAPI } from '../lib/api.js';

const useAgencyStore = create((set, get) => ({
  agency: null,
  links: [],
  members: [],
  isLoading: false,
  error: null,

  fetchAgency: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await agencyAPI.getMyAgency();
      set({ agency: data, isLoading: false });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Could not load agency.';
      set({ error: message, isLoading: false });
    }
  },

  fetchLinks: async () => {
    const { data } = await agencyAPI.getLinks();
    set({ links: data });
  },

  fetchMembers: async () => {
    const { data } = await agencyAPI.getMembers();
    set({ members: data });
  },

  createLink: async (linkData) => {
    const { data } = await agencyAPI.createLink(linkData);
    set((state) => ({ links: [...state.links, data] }));
    return data;
  },

  deactivateLink: async (id) => {
    await agencyAPI.deactivateLink(id);
    set((state) => ({
      links: state.links.map((l) => (l.id === id ? { ...l, is_active: false } : l)),
    }));
  },

  removeMember: async (memberId) => {
    await agencyAPI.removeMember(memberId);
    set((state) => ({
      members: state.members.filter((m) => m.member_id !== memberId),
      agency: state.agency
        ? { ...state.agency, seats_used: Math.max(0, (state.agency.seats_used || 0) - 1) }
        : null,
    }));
  },
}));

export default useAgencyStore;
