import { defineStore } from "pinia";
import axios from "axios";

export const useScanStore = defineStore("scanStore", {
  actions: {
    async scanTicket(qrCodeContent) {
      try {
        this.loading = true;

        console.log("Début de scanTicket");
        console.log("QR Code détecté :", qrCodeContent);

        const qrCodeData = typeof qrCodeContent === "string" ? JSON.parse(qrCodeContent) : qrCodeContent;
        console.log("QR Code Data après parsing :", qrCodeData);

        const { documentId, qr_code } = qrCodeData;

        if (!documentId || !qr_code) {
          console.error("DocumentId ou qr_code est manquant.");
          return { message: "QR Code invalide : données manquantes.", status: "error" };
        }

        // Récupérer le ticket via le documentId
        console.log(`Requête vers l'API pour récupérer le ticket avec documentId : ${documentId}`);
        const response = await axios.get(
          `http://localhost:1337/api/tickets?filters[documentId][$eq]=${documentId}`
        );
        console.log("Réponse API :", response);

        const ticket = response.data.data[0]; // Supposons que le ticket est le premier dans le tableau.
        console.log("Ticket trouvé :", ticket);

        if (!ticket) {
          console.error(`Aucun ticket trouvé pour documentId : ${documentId}`);
          throw new Error(`Ticket introuvable avec le DocumentId : ${documentId}`);
        }

        // Vérifiez que le qr_code correspond
        console.log("QR Code attendu :", qr_code);
        console.log("QR Code trouvé dans le ticket :", ticket.qr_code);

        if (ticket.qr_code !== qr_code) {
          console.error("Le QR Code ne correspond pas au ticket trouvé.");
          throw new Error("Le QR Code ne correspond pas au ticket trouvé.");
        }

        // Vérifiez le statut du ticket
        console.log("Statut actuel du ticket :", ticket.statu);
        if (ticket.statu === "scanned") {
          console.warn("Le ticket a déjà été scanné.");
          return {
            message: `Ce ticket (matricule : ${ticket.qr_code}) a déjà été scanné.`,
            status: "canceled",
          };
        }

        // Mettre à jour le statut en "scanné"
        console.log(`Mise à jour du statut du ticket avec documentId : ${documentId} en "scanned"`);
        await axios.put(`http://localhost:1337/api/tickets/${ticket.documentId}`, {
          data: { statu: "scanned" },
        });

        console.log("Mise à jour réussie. Ticket scanné avec succès.");
        return {
          message: `Ticket scanné avec succès (matricule : ${ticket.qr_code}).`,
          status: "success",
        };
      } catch (error) {
        console.error("Erreur lors du scan du QR Code :", error);
        return { message: error.message, status: "error" };
      } finally {
        this.loading = false;
        console.log("Fin de scanTicket");
      }
    },
  },
});
