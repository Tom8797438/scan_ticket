// stores/eventStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useEventStore = defineStore('eventStore', {
  state: () => ({
    events: [], // Liste des événements
    eventDetails: {}, // Détails des événements spécifiques (par ID)
    loading: false, // État de chargement global
    error: null, // Message d'erreur global
    selectedEvent: null,  // Événement sélectionné
  }),
  actions: {

    setSelectedEvent(event) {
      console.log('store setSelectedEvent ',event)
      this.selectedEvent = event; // Met à jour l'événement sélectionné
    },

    async fetchEvents() {
        try {
          this.loading = true;
          const response = await axios.get(
            'http://localhost:1337/api/events');
          this.events = response.data.data;
        } catch (err) {
          this.error = 'Failed to fetch events. Please try again later.';
        } finally {
          this.loading = false;
        }
      },
      async createEvent(eventData) {
        try {
          
          this.loading = true;
          const response = await axios.post(
            'http://localhost:1337/api/events',
            { data: eventData }
          );
          console.log('createEvent : ',eventData)
          // Rafraîchir la liste des événements après la création
          await this.fetchEvents();
          // Ajoute l'événement créé à la liste existante
          this.events.push(response.data.data);
        } catch (err) {
          this.error = 'Erreur lors de la création de l\'évènement.';
          throw err; // Propager l'erreur
        } finally {
          this.loading = false;
        }
  },

  async fetchEventDetails(documentId) {
    try {
      console.log('Recherche de l\'événement avec documentId :', documentId);
      this.loading = true;
      const response = await axios.get(
        `http://localhost:1337/api/authors/:${documentId}`
      );
      console.log('Données reçues :', response);
      if (response.data.data.length > 0) {
        this.eventDetails = response.data.data[0]; // Récupérer le premier événement correspondant
      } else {
        this.eventDetails = {};
        this.error = 'Aucun événement trouvé avec ce documentId.';
      }
    } catch (err) {
      console.error('Erreur lors de la recherche :', err);
      this.eventDetails = {};
      this.error = 'Impossible de récupérer les détails de l\'événement.';
    } finally {
      this.loading = false;
    }
  }
  
  
  
},
});
