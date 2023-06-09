import { defineStore } from 'pinia'

export const useElementStore = defineStore({
  id: 'elements',
  state: () => ({
    elements: [],
    grid: [],
  }),
  actions: {
    async fetchElements() {
      const response = await fetch('/elements.json')
      this.elements = await response.json()
      console.log(this.elements)
      this.createGrid()
    },
    createGrid() {
      const elementsBySymbol = Object.fromEntries(this.elements.map(element => [element.symbol, element]))
      // Créez votre grille ici en fonction de la structure de vos données
      this.grid = [
        ['H', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'He'].map(symbol => elementsBySymbol[symbol]),
        ['Li', 'Be', null, null, null, null, null, null, null, null, null, null, 'B', 'C', 'N', 'O', 'F', 'Ne'].map(symbol => elementsBySymbol[symbol]),
        // ['Na', 'Mg', null, null, null, null, null, null, null, null, null, null, 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'].map(symbol => elementsBySymbol[symbol]),
        // ['K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'].map(symbol => elementsBySymbol[symbol]),
        // ['Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe'].map(symbol => elementsBySymbol[symbol]),
        // ['Cs', 'Ba', 'La-Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Ti', 'Pb', 'Bi', 'Po', 'At', 'Rn'].map(symbol => elementsBySymbol[symbol]),
        // ['Fr', 'Ra', 'Ac-Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Uut', 'Fl', 'Uup', 'Lv', 'Uus', 'Uuo'].map(symbol => elementsBySymbol[symbol]),
        // [null, null, null, 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu'].map(symbol => elementsBySymbol[symbol]),
        // [null, null, null, 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr'].map(symbol => elementsBySymbol[symbol]),
      ]
      console.log('Grid:', this.grid);
      console.log(this.grid.length)
    }
  }
})
