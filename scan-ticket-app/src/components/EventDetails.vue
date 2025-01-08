<template>
  <div class="overlay" @click="goBackToEvents">
    <div class="event-card" @click.stop>
      <!-- Colonne gauche -->
      <div class="event-details">
        <h2 class="event-title">{{ selectedEvent.name || 'Non spécifié' }}</h2>
        <p><strong>Date :</strong> {{ selectedEvent.event_date || 'Non spécifié' }}</p>
        <p><strong>Lieu :</strong> {{ selectedEvent.location || 'Non spécifié' }}</p>
        <p><strong>Adresse :</strong> {{ selectedEvent.address || 'Non spécifié' }}</p>
        <p><strong>Ville :</strong> {{ selectedEvent.city || 'Non spécifié' }}</p>
        <p><strong>Places disponibles :</strong> {{ selectedEvent.total_seats || 'Non spécifié' }}</p>
        <p><strong>Prix Standard :</strong> {{ selectedEvent.price_standard || 'Non spécifié' }} €</p>
        <p><strong>Prix VIP :</strong> {{ selectedEvent.price_vip || 'Non spécifié' }} €</p>
        <p><strong>Prix PMR :</strong> {{ selectedEvent.price_pmr || 'Non spécifié' }} €</p>
        <p><strong>Prix Enfant -12 ans :</strong> {{ selectedEvent.price_children || 'Non spécifié' }} €</p>
        <p><strong>Prix Étudiant :</strong> {{ selectedEvent.price_student || 'Non spécifié' }} €</p>
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
import { ref, computed } from 'vue';
import { useEventStore } from '@/stores/eventStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useTicketStore } from '@/stores/ticketStore';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const eventStore = useEventStore();
    const bookingStore = useBookingStore();
    const ticketStore = useTicketStore();

    const firstname = ref('');
    const lastname = ref('');
    const email = ref('');
    const phone = ref('');

    // Définir les types de tickets dynamiquement
    const ticketTypes = ref([
      { name: 'standardTickets', label: 'Standard', price: eventStore.selectedEvent?.price_standard || 0, quantity: 0 },
      { name: 'vipTickets', label: 'VIP', price: eventStore.selectedEvent?.price_vip || 0, quantity: 0 },
      { name: 'pmrTickets', label: 'PMR', price: eventStore.selectedEvent?.price_pmr || 0, quantity: 0 },
      { name: 'childrenTickets', label: 'Enfants', price: eventStore.selectedEvent?.price_children || 0, quantity: 0 },
      { name: 'studentTickets', label: 'Étudiants', price: eventStore.selectedEvent?.price_student || 0, quantity: 0 },
    ]);

    const selectedEvent = computed(() => eventStore.selectedEvent);

    const total = computed(() => {
      return ticketTypes.value.reduce((sum, ticketType) => {
        return sum + ticketType.quantity * ticketType.price;
      }, 0);
    });

    const calculateTotal = () => {
      console.log("Total calculé :", total.value);
    };

    const bookTickets = async () => {
      // Mettre à jour les données utilisateur dans le store
      bookingStore.setUser({
        customer_firstname: firstname.value.trim(),
        customer_lastname: lastname.value.trim(),
        customer_email: email.value.trim(),
        customer_phone: phone.value.trim(),
      });

      // Préparer les tickets
      const ticketsToCreate = ticketTypes.value.flatMap((ticketType) => {
        return Array.from({ length: ticketType.quantity }, () => ({
          customer_firstname: bookingStore.user.customer_firstname,
          customer_lastname: bookingStore.user.customer_lastname,
          customer_email: bookingStore.user.customer_email,
          customer_phone: bookingStore.user.customer_phone,
          ticket_type: ticketType.name,
          quantity: ticketType.quantity,
          price: ticketType.price,
        }));
      });

      console.log("Tickets prêts à être envoyés :", ticketsToCreate);

      try {
        // Ajouter les tickets au bookingStore
        bookingStore.addTickets(ticketsToCreate);

        // Créer les tickets via ticketStore
        const createdTickets = await ticketStore.createMultipleTickets();
        console.log("Tickets créés :", createdTickets);

        alert("Réservation réussie !");
      } catch (error) {
        console.error("Erreur lors de la réservation :", error);
        alert("Une erreur est survenue lors de la réservation.");
      }
    };

    const goBackToEvents = () => {
      eventStore.selectedEvent = null;
      router.push('/Menu');
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
    };
  },
};
</script>

<style scoped>
@import '@/assets/styles/EventDetails.css';
</style>
