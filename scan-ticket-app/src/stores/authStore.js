import { defineStore } from 'pinia';
import axios from 'axios';
import Cookies from 'js-cookie';
//import { useRouter } from 'vue-router';
axios.defaults.withCredentials = true;

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user: null, // Informations sur l'utilisateur
    token: null, // Token JWT
    error: null, // Message d'erreur
  }),

  // Ajout des getters
  getters: {
    isAuthenticated: (state) => !!state.user, // Retourne true si l'utilisateur est connecté
  },

  actions: {
    async login(identifier, password) {
      try {
        const response = await axios.post('http://localhost:1337/api/auth/local', {
          identifier,
          password,
        },{ headers: { 'Content-Type': 'application/json' } }
      );
        console.log('Réponse Strapi :', response);
        
        this.token = response.data.jwt;
        this.user = response.data.user;
        // Stocker le token dans un cookie
        Cookies.set('authToken', this.token, { sameSite: 'strict' }); // utilisation en local http

        //Cookies.set('authToken', this.token, { secure: true, sameSite: 'strict' }); // utilisation en https

        // Configurer Axios avec le token
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        this.error = null;
      } catch (err) {
        this.error = 'Échec de la connexion. Vérifiez vos identifiants.';
        console.error('Erreur d\'authentification :', err.response?.data || err.message);
      }
    },

      logout(router) {
        this.user = null;
        this.token = null;
    
      // Supprimer le cookie
      Cookies.remove('authToken');
    
      // Retirer l'Authorization d'Axios
      delete axios.defaults.headers.common['Authorization'];
    
      // Effectuer la redirection
      if (router) {
        router.push('/login').catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            console.error(err);
          }
        });
      } else {
        console.error('Router instance is not provided to logout');
      }
    },

    async autoLogin() {
      const token = Cookies.get('authToken');
      if (token) {
        try {
          this.token = token;
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    
          // Optionnel : Récupérer les informations utilisateur depuis Strapi
          const response = await axios.get('http://localhost:1337/api/users/me');
          this.user = response.data;
        } catch (err) {
          console.warn('Auto-login échoué. Token invalide ou expiré.', err);
          this.logout();
        }
      }
    },
  },
});
