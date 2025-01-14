import { defineStore } from 'pinia'; // Importation de Pinia pour définir un store
import axios from 'axios'; // Importation de la bibliothèque Axios pour les requêtes HTTP
import { useEventStore } from '@/stores/eventStore'; // Importation du store pour gérer les événements

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

    // // Crée un ticket individuel via l'API
    // async createTicket(ticketData) {
    //   try {
    //     const eventStore = useEventStore();// Récupère le store des événements
    //     const selectedEvent = eventStore.selectedEvent; // Événement actuellement sélectionné


    //     // Vérifiez si l'événement sélectionné a un 'documentId'
    //     if (!selectedEvent || !selectedEvent.documentId) {
    //       throw new Error("Aucun événement sélectionné ou documentId manquant.");
    //     }

    //     console.log("Selected Event :", selectedEvent);

    //     // Construire le payload pour le ticket
    //     const qrCode = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    //     const ticketPayload = {
    //       ...ticketData, // Données du ticket
    //       qr_code: qrCode, // Ajout du QR Code
    //       statu: "valid", // Statut initial du ticket
    //       name_event: selectedEvent.name, // Nom de l'événement
    //       event: selectedEvent.id, // ID de l'événement
    //     };

    //     console.log("Payload envoyé à Strapi :", ticketPayload);

    //     // Envoyer la requête à Strapi pour créer le ticket
    //     const response = await axios.post(
    //       `http://localhost:1337/api/tickets`,
    //       { data: ticketPayload }
    //     );

    //     // Vérifiez que la réponse contient un ID valide
    //     if (!response || !response.data || !response.data.data ) { //|| !response.data.data.id
    //       throw new Error("Erreur : l'ID retourné par Strapi est manquant.");
    //     }

    //     const createdTicket = response.data.data; // Récupère le ticket créé

    //     console.log("Ticket créé avec succès :", createdTicket);

    //     // Retourne le ticket créé avec l'ID et le QR Code correct
    //     return {
    //       ...ticketPayload,
    //       id: createdTicket.id,
    //       qr_code: createdTicket.qr_code || qrCode, // Utilisez le QR Code retourné ou généré
    //     };
    //   } catch (error) {
    //     console.error("Erreur lors de la création du ticket :", error);
    //     return null;
    //   }
    // },

    // // Crée plusieurs tickets en fonction des quantités et types
    // async bookTickets() {
    //   try {
    //     // Vérifie qu'il y a des tickets à créer
    //     if (this.tickets.length === 0) {
    //       throw new Error("Aucun ticket à créer.");
    //     }

    //     // Création de chaque ticket en parallèle avec `createTicket`
    //     const ticketPromises = this.tickets.map((ticket) =>
    //       this.createTicket(ticket)
    //     );

    //     // Attend que tous les tickets soient créés
    //     const ticketResponses = await Promise.all(ticketPromises);

    //     // Filtre les tickets valides (ceux qui ont un ID)
    //     const validTickets = ticketResponses.filter(
    //       (ticket) => ticket && ticket.id
    //     );

    //     console.log("Tickets valides créés :", validTickets);

    //     // Vérifie qu'au moins un ticket valide a été créé
    //     if (validTickets.length === 0) {
    //       throw new Error("Aucun ticket valide n’a été créé.");
    //     }

    //     return validTickets;
    //   } catch (error) {
    //     console.error("Erreur lors de la réservation des tickets :", error);
    //     throw error;
    //   }
    // },
  },
});
