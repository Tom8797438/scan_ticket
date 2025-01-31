import { defineStore } from 'pinia'; // Importation de Pinia pour définir un store

// Définition du store `booking` avec Pinia
export const useBookingStore = defineStore('booking', {
  state: () => ({
    user: {
      customer_firstname: '',
      customer_lastname: '',
      customer_email: '',
      customer_phone: '',
    },
    tickets: [],
    totalAmount: 0,
  }),

  actions: {
    // Définit les informations utilisateur
    setUser(userData) {
      // Vérifie que toutes les informations utilisateur sont présentes
      if (
        !userData.customer_firstname ||
        !userData.customer_lastname ||
        !userData.customer_email ||
        !userData.customer_phone
      ) {
        throw new Error("Les informations utilisateur sont incomplètes.");
      }
      this.user = { ...userData }; // Mise à jour de l'état utilisateur avec les données fournies
    },

    // Ajoute des tickets à la liste des tickets
    addTickets(ticketDataArray) {
      this.tickets = [...this.tickets, ...ticketDataArray];// Ajoute les nouveaux tickets à la liste existante
      console.log("Tickets ajoutés au store :", this.tickets); // Log pour vérification
    },
  },
});
