import { defineStore } from 'pinia';

export const useElementStore = defineStore({
  id: 'elementStore',
  state: () => ({
    elements: [],
    loading: true,
  }),
  actions: {
    async fetchElements() {
      const response = await fetch('/src/periodic-table.json');
      const data = await response.json();
      this.elements = data.elements;
      this.loading = false;
    }
  }
});
