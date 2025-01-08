import { defineStore } from 'pinia';
import axios from 'axios';
import { useEventStore } from '@/stores/eventStore';
import { useBookingStore } from '@/stores/bookingStore';
import { generateTicketPdf } from '@/components/utils/generateTicketPdf';

export const useTicketStore = defineStore('ticketStore', {
  state: () => ({
    tickets: [],
  }),

  actions: {
    async createIndividualTicket(ticketData) {
      try {
        const eventStore = useEventStore();
        const selectedEvent = eventStore.selectedEvent;

        if (!selectedEvent || !selectedEvent.id) {
          throw new Error("Aucun événement sélectionné ou ID manquant.");
        }

        // Construire le payload pour le ticket
        const ticketPayload = {
          ...ticketData,
          qr_code: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          statu: "valid",
          name_event: selectedEvent.name,
          event: selectedEvent.id,
          price: ticketData.price,
        };

        console.log("ticketStore Payload envoyé :", ticketPayload);

        const response = await axios.post(
          `http://localhost:1337/api/tickets`,
          { data: ticketPayload }
        );
        console.log("Ticket créé :", response.data);

        // Générer et télécharger le PDF
        await generateTicketPdf({
            ...ticketPayload,
        });

        return response.data;
      } catch (error) {
        console.error("ticketStore Erreur lors de la création du ticket :", error);
        throw error;
      }
    },
    async createMultipleTickets() {
        try {
          const bookingStore = useBookingStore();
          console.log("Données de bookingStore :", bookingStore.tickets);
      
          if (bookingStore.tickets.length === 0) {
            throw new Error("Aucun ticket à créer.");
          }
      
          // Création des tickets un par un en fonction de la quantité
          for (const ticket of bookingStore.tickets) {
            console.log(`Création des tickets pour le type : ${ticket.ticket_type}, quantité : ${ticket.quantity}`);
      
            for (let i = 0; i < ticket.quantity; i++) {
              console.log(`Création du ticket ${i + 1} pour le type : ${ticket.ticket_type}`);
      
              // Utilisez `this.createIndividualTicket`
              const createdTicket = await this.createIndividualTicket({
                customer_firstname: ticket.customer_firstname,
                customer_lastname: ticket.customer_lastname,
                customer_email: ticket.customer_email,
                customer_phone: ticket.customer_phone,
                ticket_type: ticket.ticket_type,
                price: ticket.price,
              });
      
              console.log("Ticket créé :", createdTicket);
      
              // Ajouter le ticket créé à l'état local
              this.tickets.push(createdTicket.data);
            }
          }
      
          console.log("Tous les tickets ont été créés :", this.tickets);
          return this.tickets;
        } catch (error) {
          console.error("Erreur lors de la création des tickets :", error);
          throw error;
        }
      }
    },
  });
