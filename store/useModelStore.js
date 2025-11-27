import { create } from "zustand";

export const useModelStore = create((set) => ({
  modelData: {},

  saveStep: (newData) =>
    set((state) => ({
      modelData: { ...state.modelData, ...newData }, // Fusionne les nouvelles données avec l'état actuel
    })),

  reset: () => set({ modelData: {} }),
}));
