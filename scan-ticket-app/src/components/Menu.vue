<template>
    <div class="main-container bg-pan-left">
      <!-- Bouton central -->
      <div class="central-circle" @click="toggleMenu">
        <i class="icon-main" :class="{ rotate: menuOpen }">☰</i>
      </div>
  
      <!-- Menu circulaire -->
      <div class="circle-menu" :class="{ show: menuOpen }" @click="toggleMenu">
        <div
          v-for="(item, index) in menuItems"
          :key="index"
          class="menu-item"
          :class="`pos-${index + 1}`"
          @click.stop="item.action"
        >
          <div class="icon-text-container">
            <font-awesome-icon :icon="item.icon" class="menu-icon" />
            <p class="menu-label">{{ item.label }}</p>
          </div>
        </div>
      </div>

  
      <!-- Overlay pour fermer EventCard -->
      <div v-if="showEventCard" class="overlay" @click="closeEventCard">
        <div class="event-card-container" @click.stop>
          <EventCard />
        </div>
      </div>

      <!-- Overlay pour fermer CreateEvent -->
      <div v-if="showCreateEvent" class="overlay" @click="closeCreateEvent">
        <div class="event-card-container" @click.stop>
          <CreateEvent />
        </div>
      </div>
 

    <!-- Overlay pour fermer QrCodeScanner -->
    <div v-if="showQrCodeScanner" class="overlay" @click="closeQrCodeScanner">
        <div class="event-card-container" @click.stop>
          <QrCodeScanner />
        </div>
      </div>
    </div>
  </template>
    

  <script setup>
  import { ref } from 'vue';
  import EventCard from '@/components/EventCard.vue';
  import CreateEvent from '@/components/CreateEvent.vue';
  import { useAuthStore } from '@/stores/authStore';
  import { useRouter } from 'vue-router';
  import QrCodeScanner from '@/components/QrCodeScanner.vue'

  const authStore = useAuthStore();
  const router = useRouter();

  // État pour ouvrir/fermer le menu
  const menuOpen = ref(false);
  
  // Etat pour afficher le lecteur de QrCode
  const showQrCodeScanner = ref(false);


  // Fonction pour fermer EventCard
  const closeQrCodeScanner = () => {
    showQrCodeScanner.value = false;
  };


  // État pour afficher EventCard
  const showEventCard = ref(false);

  // État pour afficher CreateEvent
  const showCreateEvent = ref(false);
  
  // Fonction pour basculer le menu
  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value; // Inverse l'état (ouvert/fermé)
  };
  
  // Fonction pour fermer EventCard
  const closeEventCard = () => {
    showEventCard.value = false;
  };
  
  // Fonction pour fermer EventCard
  const closeCreateEvent = () => {
    showCreateEvent.value = false;
  };

  // Items du menu
  const menuItems = [
    {
      label: 'Créer Évènement',
      icon: 'fas fa-calendar-plus',
      action: () => {
        showCreateEvent.value = true;
      }
    },
    // {
    //   label: 'Acheter Billet',
    //   icon: 'fas fa-ticket-alt',
    //   action: () => alert('Acheter un billet'),
    // },
    {
      label: 'Scanner Billet',
      icon: 'fas fa-qrcode',
      action: () => {
        showQrCodeScanner.value = true;
      }
    },
    {
      label: 'Voir Évènements',
      icon: 'fas fa-calendar',
      action: () => {
        showEventCard.value = true; // Affiche EventCard
    },
  },
  {
    label: 'Déconnexion',
    icon: 'fas fa-sign-out-alt', // Icône pour la déconnexion
    action: () => handleLogout(),
  },
];

// Fonction pour gérer la déconnexion
const handleLogout = () => {
  authStore.logout(router); // Passe l'instance du routeur au store
};
  </script>
  

<style scoped>

@import '@/assets/styles/Menu.css'
</style>
