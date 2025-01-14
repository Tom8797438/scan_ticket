import { defineStore } from 'pinia';
import axios from 'axios';
import { useEventStore } from '@/stores/eventStore';
import { useBookingStore } from '@/stores/bookingStore';
import { generateTicketPdf } from '@/components/utils/generateTicketPdf';

export const useTicketStore = defineStore('ticketStore', {
  state: () => ({
    tickets: [], // Stockage local des tickets créés
  }),

  actions: {
    /**
     * Crée un ticket unique et retourne les données du ticket créé.
     */
    async createIndividualTicket(ticketData) {
      try {
        const eventStore = useEventStore();
        const selectedEvent = eventStore.selectedEvent;

        if (!selectedEvent || !selectedEvent.id) {
          throw new Error("Aucun événement sélectionné ou ID manquant.");
        }

        // Construire le payload pour un ticket
        const ticketPayload = {
          ...ticketData,
          qr_code: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          statu: "valid",
          name_event: selectedEvent.name,
          event: selectedEvent.id,
          price: ticketData.price,
        };

        console.log("Payload pour un ticket :", ticketPayload);

        // Envoi de la requête pour créer un ticket
        const response = await axios.post(
          `http://localhost:1337/api/tickets`,
          { data: ticketPayload }
        );

        console.log("Ticket créé :", response.data);

        // Retourner les données du ticket créé
        return {
          ...ticketPayload,
          id: response.data.data.id,
        };
      } catch (error) {
        console.error("Erreur lors de la création d'un ticket :", error);
        throw error;
      }
    },

    /**
     * Génère un nombre précis de tickets et leurs PDFs.
     */
    async createMultipleTickets() {
      try {
        const bookingStore = useBookingStore();

        // Vérifiez que des tickets sont disponibles
        if (bookingStore.tickets.length === 0) {
          throw new Error("Aucun ticket à créer.");
        }

        console.log("Données de bookingStore :", bookingStore.tickets);

        const createdTickets = []; // Liste des tickets créés

        // Parcourir chaque type de ticket dans bookingStore
        for (const ticket of bookingStore.tickets) {
          console.log(`Création de ${ticket.quantity} tickets pour le type : ${ticket.ticket_type}`);

          // Créez les tickets en fonction de la quantité demandée
          for (let i = 0; i < ticket.quantity; i++) {
            const createdTicket = await this.createIndividualTicket({
              customer_firstname: ticket.customer_firstname,
              customer_lastname: ticket.customer_lastname,
              customer_email: ticket.customer_email,
              customer_phone: ticket.customer_phone,
              ticket_type: ticket.ticket_type,
              price: ticket.price,
            });

            console.log(`Ticket ${i + 1} créé :`, createdTicket);

            // Générer un PDF pour chaque ticket créé
            await generateTicketPdf(createdTicket);

            // Ajouter le ticket créé à la liste
            createdTickets.push(createdTicket);
          }
        }

        console.log("Tous les tickets créés :", createdTickets);

        // Mettre à jour l'état local
        this.tickets = createdTickets;

        return createdTickets;
      } catch (error) {
        console.error("Erreur lors de la création des tickets multiples :", error);
        throw error;
      }
    },
  },
});
