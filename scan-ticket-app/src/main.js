import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
// FontAwesome imports
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { QrcodeStream } from 'vue-qrcode-reader';

// Importation des icônes gratuites de FontAwesome
import { faCalendarPlus, faTicketAlt, faQrcode, faCalendar,faSignOutAlt  } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/stores/authStore';
// Ajouter les icônes nécessaires à la bibliothèque
library.add(faCalendarPlus, faTicketAlt, faQrcode, faCalendar, faSignOutAlt);

import App from './App.vue';
import router from './router';

// Crée l'application
const app = createApp(App);

// Utilise Pinia et le router
app.use(createPinia());
app.use(router);

// Enregistre le composant FontAwesome globalement
app.component('font-awesome-icon', FontAwesomeIcon);
app.component('QrcodeStream', QrcodeStream);
const authStore = useAuthStore();
authStore.autoLogin();
// Désactiver Vue DevTools
app.config.devtools = false;
// Monte l'application
app.mount('#app');

