import { defineStore } from 'pinia';

export const useElementStore = defineStore({
  id: 'elementStore',
  state: () => ({
    elements: [],
    loading: true,
    selectedElement: null,
  }),
  actions: {
    async fetchElements() {
      const response = await fetch('/periodic-table.json');
      const data = await response.json();
      this.elements = data.elements;
      this.loading = false;
    },
    initFromLocalStorage() {
      const selectedElementData = localStorage.getItem('selectedElement');
      if (selectedElementData) {
        // Parsez les données JSON du localStorage si nécessaire
        this.selectedElement = JSON.parse(selectedElementData);
      }
    },
    // Ajoutez une action pour sauvegarder les données du store dans le localStorage
    saveToLocalStorage() {
      localStorage.setItem('selectedElement', JSON.stringify(this.selectedElement));
    },
  }
});
