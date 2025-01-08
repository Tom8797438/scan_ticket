<template>
  <div class="login-container">
    <h1>Connexion</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="identifier">Email ou Nom d'utilisateur</label>
        <input
          v-model="identifier"
          type="text"
          id="identifier"
          placeholder="Email ou Nom d'utilisateur"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input
          v-model="password"
          type="password"
          id="password"
          required
        />
      </div>
      <button type="submit">Se connecter</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

  
<script>
import { useAuthStore } from '@/stores/authStore';

export default {
  name: 'Login',
  data() {
    return {
      identifier: '', // Peut être un email ou un nom d'utilisateur
      password: '',
    };
  },
  computed: {
    error() {
      const authStore = useAuthStore();
      return authStore.error;
    },
  },
  methods: {
    async login() {
      const authStore = useAuthStore();
      await authStore.login(this.identifier, this.password);
      if (!authStore.error) {
        this.$router.push('/menu'); // Redirige après la connexion réussie
      }
    },
  },
};
</script>

  
  <style scoped>
@import'@/assets/styles/Authentification.css'
  </style>
