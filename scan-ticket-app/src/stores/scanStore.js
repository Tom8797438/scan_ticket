import { defineStore } from "pinia";
import axios from "axios";

export const useScanStore = defineStore("scanStore", {
  actions: {
    async scanTicket(qr_code) {
      try {
        console.log("Scan en cours pour le QR Code :", qr_code);

        // Rechercher un ticket correspondant
        const ticketResponse = await axios.get("http://localhost:1337/api/tickets", {
          params: { filters: { qr_code: qr_code } },
        });

        const ticket = ticketResponse.data.data[0]; // Premier ticket trouvé

        if (!ticket) {
          // Aucun ticket trouvé
          return { status: "error", message: "Faux ticket." };
        }

        // Vérification du statut du ticket
        const ticketStatus = ticket.attributes.statu;

        if (ticketStatus === "valid") {
          // Passer le statut du ticket à "scanned"
          await axios.put(`http://localhost:1337/api/tickets/${ticket.id}`, {
            data: { statu: "scanned" },
          });

          return { status: "success", message: "Billet scanné OK." };
        }

        if (ticketStatus === "scanned") {
          // Ticket déjà scanné
          return { status: "error", message: "Ticket déjà scanné." };
        }

        // Par défaut, statut inconnu
        return { status: "error", message: "Statut inconnu du ticket." };
      } catch (error) {
        console.error("Erreur lors du scan du ticket :", error);
        return { status: "error", message: "Erreur interne lors du scan." };
      }
    },
  },
});
