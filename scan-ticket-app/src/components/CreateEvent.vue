<template>
    <h1 class="title">Créer un Évènement</h1>
    <div class="create-event-container">
      
      <!-- Formulaire de création d'évènement -->
      <form @submit.prevent="createEvent">
        <div class="form-group">
          <label for="name">Evènement</label>
          <input v-model="form.name" type="text" id="name" required />
        </div>
  
        <div class="form-group">
          <label for="description">Description</label>
          <input v-model="form.description" type="text" id="description" required />
        </div>

        <div class="form-group">
          <label for="date">Date</label>
          <input v-model="form.event_date" type="date" id="date" required />
        </div>
  
        <div class="form-group">
          <label for="location">Lieu</label>
          <input v-model="form.location" type="text" id="location" required />
        </div>
  
        <div class="form-group">
          <label for="address">Adresse</label>
          <input v-model="form.address" type="text" id="address" required />
        </div>

        <div class="form-group">
          <label for="postal_code">Code Postal</label>
          <input v-model="form.postal_code" type="text" id="postal_code" required />
        </div>
  
        <div class="form-group">
          <label for="city">Ville</label>
          <input v-model="form.city" type="text" id="city" required />
        </div>
  
        <div class="form-group">
          <label for="total_seats">Nombre de places</label>
          <input v-model="form.total_seats" type="number" id="total_seats" required />
        </div>
  
        <div class="form-group">
          <label for="price_standard">Prix Standard</label>
          <input v-model="form.price_standard" type="number" id="price_standard" required />
        </div>
  
        <div class="form-group">
          <label for="price_vip">Prix VIP</label>
          <input v-model="form.price_vip" type="number" id="price_vip" />
        </div>
  
        <div class="form-group">
          <label for="price_children">Prix PMR</label>
          <input v-model="form.price_children" type="number" id="price_children" />
        </div>
  
        <div class="form-group">
          <label for="price_pmr">Prix Enfants</label>
          <input v-model="form.price_pmr" type="number" id="price_pmr" />
        </div>

        <div class="form-group">
          <label for="price_student">Prix Etudiant</label>
          <input v-model="form.price_student" type="number" id="price_student" />
        </div>

        <div class="form-group">
          <button type="submit">Valider</button>
        </div>
      </form>
  
      <!-- Message de statut -->
      <p v-if="success" class="success">well done !</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import { useEventStore } from '@/stores/eventStore';
  
  export default {
    name: 'CreateEvent',
    data() {
      return {
        form: {
          name: '',
          description: '',
          event_date: '',
          location: '',
          address: '',
          postal_code:'',
          city: '',
          total_seats: null,
          price_standard: null,
          price_vip: null,
          price_pmr: null,
          price_children: null,
          price_student: null,
        },
        success: false,
        error: null,
      };
    },
    methods: {
      async createEvent() {
  const eventStore = useEventStore();

  try {
    console.log('Payload envoyé:', { data: this.form });
    await eventStore.createEvent(this.form);
    this.success = true;
    this.error = null;
    this.resetForm();
  } catch (err) {
    console.error('Erreur lors de la création:', err.response?.data || err.message);
    this.success = false;
    this.error = 'Erreur lors de la création de l\'évènement.';
  }
},

      resetForm() {
        this.form = {
          name: '',
          event_date: '',
          description: '',
          location: '',
          address: '',
          city: '',
          total_seats: null,
          price_standard: null,
          price_vip: null,
          price_pmr: null,
        };
      },
    },
  };
  </script>
  
  <style scoped>
@import '@/assets/styles/CreateEvent.css'
</style>
