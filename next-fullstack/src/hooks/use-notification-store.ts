import { create } from 'zustand';

interface NotificationStore {
  hasUnreadMessages: boolean;
  setHasUnreadMessages: (state: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  hasUnreadMessages: false,
  setHasUnreadMessages: (state) => set({ hasUnreadMessages: state }),
}));