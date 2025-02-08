<template>
  <div class="overlay" @click="goBackToEvents">
    <div class="event-card" @click.stop>
      <!-- Colonne gauche -->
      <div class="event-details">
        <h2 class="event-title">{{ selectedEvent?.name || 'Non spécifié' }}</h2>
        <p><strong>Date :</strong> {{ selectedEvent.event_date || 'Non spécifié' }}</p>
        <p><strong>Lieu :</strong> {{ selectedEvent.location || 'Non spécifié' }}</p>
        <p><strong>Adresse :</strong> {{ selectedEvent.address || 'Non spécifié' }}</p>
        <p><strong>Ville :</strong> {{ selectedEvent.city || 'Non spécifié' }}</p>
        <p><strong>Places disponibles :</strong> {{ selectedEvent.total_seats || 'Non spécifié' }}</p>
        <p v-if="selectedEvent.price_standard"><strong>Prix Standard :</strong> {{ selectedEvent.price_standard }} €</p>
        <p v-if="selectedEvent.price_vip"><strong>Prix VIP :</strong> {{ selectedEvent.price_vip }} €</p>
        <p v-if="selectedEvent.price_pmr"><strong>Prix PMR :</strong> {{ selectedEvent.price_pmr }} €</p>
        <p v-if="selectedEvent.price_children"><strong>Prix Enfant -12 ans :</strong> {{ selectedEvent.price_children }} €</p>
        <p v-if="selectedEvent.price_student"><strong>Prix Étudiant :</strong> {{ selectedEvent.price_student }} €</p>

      </div>

      <!-- Colonne droite -->
      <div class="booking-section">
        <h3>Vos coordonnées</h3>
        <div class="input-group">
          <label>Nom</label>
          <input id="firstname" type="text" placeholder="Votre nom" v-model="firstname" />
        </div>
        <div class="input-group">
          <label>Prénom</label>
          <input id="lastname" type="text" placeholder="Votre prénom" v-model="lastname" />
        </div>
        <div class="input-group">
          <label>E-mail</label>
          <input id="email" type="email" placeholder="Votre e-mail" v-model="email" />
        </div>
        <div class="input-group">
          <label>Téléphone</label>
          <input id="phone" type="text" placeholder="Votre N° de téléphone" v-model="phone" />
        </div>

        <h3>Réserver vos places</h3>
        <div class="input-group" v-for="(ticketType, index) in ticketTypes" :key="index">
          <label :for="ticketType.name">
            {{ ticketType.label }} : {{ ticketType.price }} €
          </label>
          <input
            :id="ticketType.name"
            type="number"
            min="0"
            v-model="ticketType.quantity"
            @input="calculateTotal"
          />
        </div>
        <p class="total">Total : {{ total }} €</p>
        <button @click="bookTickets">Réserver vos places</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'; // Importation des outils de Vue.js pour gérer les données réactives et calculées
import { useEventStore } from '@/stores/eventStore'; // Importation du store pour gérer les événements
import { useBookingStore } from '@/stores/bookingStore'; // Importation du store pour gérer les réservations
import { useTicketStore } from '@/stores/ticketStore'; // Importation du store pour gérer les tickets
import { useRouter } from 'vue-router'; // Importation du routeur pour la navigation entre les pages

export default {
  setup() {
    // Initialisation du routeur
    const router = useRouter();

    // Initialisation des stores
    const eventStore = useEventStore();
    const bookingStore = useBookingStore();
    const ticketStore = useTicketStore();

    // Références pour les champs utilisateur
    const firstname = ref(''); // Prénom de l'utilisateur
    const lastname = ref(''); // Nom de l'utilisateur
    const email = ref(''); // Email de l'utilisateur
    const phone = ref(''); // Téléphone de l'utilisateur

    // Définir dynamiquement les types de tickets en fonction de l'événement sélectionné
    const ticketTypes = computed(() => {
    const allTickets = [
      { name: 'standardTickets', label: 'Standard', price: eventStore.selectedEvent?.price_standard },
      { name: 'vipTickets', label: 'VIP', price: eventStore.selectedEvent?.price_vip },
      { name: 'pmrTickets', label: 'PMR', price: eventStore.selectedEvent?.price_pmr },
      { name: 'childrenTickets', label: 'Enfants', price: eventStore.selectedEvent?.price_children },
      { name: 'studentTickets', label: 'Étudiants', price: eventStore.selectedEvent?.price_student },
    ];
    return allTickets
      .filter(ticket => ticket.price !== null && ticket.price !== undefined) // Filtrer ceux sans prix
      .map(ticket => ({ ...ticket, quantity: 0 })); // Ajouter la quantité
  });


    //const selectedEvent = computed(() => eventStore.selectedEvent);

    // Calcul de l'événement sélectionné avec une redirection si aucun n'est sélectionné
    const selectedEvent = computed(() => {
    if (!eventStore.selectedEvent) {
      console.error("Aucun événement sélectionné");
      router.push('/Menu'); // Redirige vers la liste des événements
      return null;
    }
    return eventStore.selectedEvent; // Renvoie l'événement sélectionné
  });


    const total = computed(() => {
      return ticketTypes.value.reduce((sum, ticketType) => {
        return sum + ticketType.quantity * ticketType.price;
      }, 0); // La somme commence à 0
    });

    // Fonction pour afficher le total dans la console (debug)
    const calculateTotal = () => {
      console.log("Total calculé :", total.value);
    };

     // Fonction pour réserver des tickets
     const bookTickets = async () => {
  // Mettre à jour les données utilisateur dans le store
  bookingStore.setUser({
    customer_firstname: firstname.value.trim(),
    customer_lastname: lastname.value.trim(),
    customer_email: email.value.trim(),
    customer_phone: phone.value.trim(),
  });

  // Préparation des tickets
  const ticketsToCreate = ticketTypes.value
    .filter((ticketType) => ticketType.quantity > 0) // Filtrer les types de tickets avec quantité > 0
    .map((ticketType) => ({
      customer_firstname: bookingStore.user.customer_firstname,
      customer_lastname: bookingStore.user.customer_lastname,
      customer_email: bookingStore.user.customer_email,
      customer_phone: bookingStore.user.customer_phone,
      ticket_type: ticketType.name,
      quantity: ticketType.quantity,
      price: ticketType.price,
      id:ticketType.id,
      documentId: ticketType.documentId,
    }));

      console.log("Tickets prêts à être envoyés :", ticketsToCreate);

      try {
        // Ajouter les tickets au bookingStore
        bookingStore.addTickets(ticketsToCreate);

        // Créer les tickets via ticketStore
        const createdTickets = await ticketStore.createMultipleTickets();
        console.log("de bookTickets dans EventDetails.vue Tickets créés :", createdTickets);

        alert("Réservation réussie !");

        // ✅ Réinitialiser le formulaire
        resetForm();

        // ✅ Redirection après réservation
        goBackToEvents();

      } catch (error) {
        console.error("Erreur lors de la réservation :", error);
        alert("Une erreur est survenue lors de la réservation.");
      }
    };

    // Fonction pour revenir à la liste des événements
    const goBackToEvents = () => {
      eventStore.selectedEvent = null;// Réinitialise l'événement sélectionné
      router.push('/Menu'); // Redirige vers le menu
    };

    const resetForm = () => {
    console.log("Réinitialisation du formulaire...");
    
    // Réinitialiser les champs utilisateur
    firstname.value = "";
    lastname.value = "";
    email.value = "";
    phone.value = "";

    // Réinitialiser la quantité des tickets à 0
    ticketTypes.value.forEach(ticket => {
      ticket.quantity = 0;
    });
  };


    return {
      ticketTypes,
      selectedEvent,
      total,
      firstname,
      lastname,
      email,
      phone,
      calculateTotal,
      bookTickets,
      goBackToEvents,
      goBackToEvents,
      resetForm,
    };
  },
};
</script>

<style scoped>
@import '@/assets/styles/EventDetails.css';
</style>
