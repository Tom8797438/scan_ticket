import QRCode from "qrcode";
import jsPDF from "jspdf";

export async function generateTicketPdf(ticketData) {
  try {
    console.log('de generateTicketPdf : ',ticketData)
    // Contenu étendu pour le QR code
    const qrCodeContent = JSON.stringify({
      //event: ticketData.name_event,
      qr_code: ticketData.qr_code, // Identifiant unique
      id:ticketData.id,
      // name: `${ticketData.customer_firstname} ${ticketData.customer_lastname}`,
      // email: ticketData.customer_email,
      // phone: ticketData.customer_phone,
      // ticketType: ticketData.ticket_type,
      // price: ticketData.price,
      
    });

    // Générer le QR code avec le contenu étendu
    const qrCodeImage = await QRCode.toDataURL(qrCodeContent);

    // Générer le PDF
    const pdfDoc = new jsPDF();
    pdfDoc.setFontSize(16);
    pdfDoc.text("Ticket de Réservation", 10, 10);
    pdfDoc.text(`Événement : ${ticketData.name_event}`, 10, 20); // Ajouter le nom de l'événement
    // Ajout des informations du ticket
    pdfDoc.setFontSize(12);
    pdfDoc.text(`Nom : ${ticketData.customer_firstname}, ${ticketData.customer_lastname}`, 10, 30);
    pdfDoc.text(`Email : ${ticketData.customer_email}`, 10, 40);
    pdfDoc.text(`Téléphone : ${ticketData.customer_phone}`, 10, 50);
    pdfDoc.text(`Type de ticket : ${ticketData.ticket_type}`, 10, 60);
    pdfDoc.text(`Prix : ${ticketData.price} €`, 10, 70);
    pdfDoc.text(`Id : ${ticketData.id}`, 10, 80);
    


    // Ajout du QR code
    pdfDoc.addImage(qrCodeImage, "PNG", 150, 10, 50, 50);

    // Téléchargement automatique
    const fileName = `Ticket_${ticketData.qr_code}.pdf`;
    pdfDoc.save(fileName);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF :", error);
    throw error;
  }
}

