// Appels API pour les événements

import api from './api';

// Récupérer tous les événements
export const getEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data.data; // Retourne les données des événements
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};
