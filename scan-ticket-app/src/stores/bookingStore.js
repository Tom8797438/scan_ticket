import { defineStore } from 'pinia';
import axios from 'axios';
import { useEventStore } from '@/stores/eventStore';

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
    setUser(userData) {
      if (
        !userData.customer_firstname ||
        !userData.customer_lastname ||
        !userData.customer_email ||
        !userData.customer_phone
      ) {
        throw new Error("Les informations utilisateur sont incomplètes.");
      }
      this.user = { ...userData };
    },
    
   // Ajoute des tickets à la liste des tickets
   addTickets(ticketDataArray) {
    this.tickets = [...this.tickets, ...ticketDataArray];
    console.log("Tickets ajoutés au store :", this.tickets);
  },

    async createTicket(ticketData) {
      try {
        const eventStore = useEventStore();
        const selectedEvent = eventStore.selectedEvent;
  
        // Vérifiez si l'événement sélectionné a un documentId
    if (!selectedEvent || !selectedEvent.documentId) {
      throw new Error("Aucun événement sélectionné ou documentId manquant.");
    }
    console.log("Selected Event :", selectedEvent);
    console.log("Selected Event DocumentId :", selectedEvent.documentId);
    
    // Construire le payload pour le ticket
    const ticketPayload = {
      ...ticketData,
      qr_code: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      statu: "valid",
      name_event: selectedEvent.name,
      event: selectedEvent.id,
      //documentId: selectedEvent.documentId,// { documentId: selectedEvent.documentId }, // Utilisez documentId
    };
        
        console.log("bookingStore Payload envoyé :", ticketPayload);

  
        const response =  await axios.post(
          `http://localhost:1337/api/tickets`,
          {data: ticketPayload}
        );
        console.log("Ticket créé :", response.data);
        return response.data;
      } catch (error) {
        console.error("bookingStore Erreur lors de la création du ticket :", error);
        return null;
      }
    },
    // Crée plusieurs tickets en fonction des quantités et types
    async bookTickets() {
      try {
        if (this.tickets.length === 0) {
          throw new Error("Aucun ticket à créer.");
        }

        const ticketPromises = this.tickets.map((ticket) =>
          this.createTicket(ticket)
        );

        const ticketResponses = await Promise.all(ticketPromises);

        const validTickets = ticketResponses.filter(
          (ticket) => ticket && ticket.data && ticket.data.id
        );

        console.log("Tickets valides créés :", validTickets);

        if (validTickets.length === 0) {
          throw new Error("Aucun ticket valide n’a été créé.");
        }

        return validTickets;
      } catch (error) {
        console.error("Erreur lors de la réservation des tickets :", error);
        throw error;
      }
    },
  },
});
