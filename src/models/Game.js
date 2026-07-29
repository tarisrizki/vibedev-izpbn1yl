import { generateId } from '../utils/storage.js';
export const CATEGORIES = [
  'Strategy', 'Family', 'Party', 'Cooperative', 
  'Deck Building', 'Card Game', 'Dice', 'Abstract', 
  'Engine Builder', 'Worker Placement', 'Social Deduction', 
  'Quick Play', 'Heavy Strategy'
];
export const createGame = (partialData = {}) => {
  const now = new Date().toISOString();
  return {
    id: partialData.id || generateId(),
    name: partialData.name || '',
    minPlayers: partialData.minPlayers || 1,
    maxPlayers: partialData.maxPlayers || 1,
    playTime: partialData.playTime || 30, 
    rating: partialData.rating || 0, 
    categories: partialData.categories || [],
    status: partialData.status || 'want-to-play', 
    notes: partialData.notes || '',
    isFavorite: partialData.isFavorite || false,
    createdAt: partialData.createdAt || now,
    updatedAt: now,
    lastPickedAt: partialData.lastPickedAt || null,
    timesPlayed: partialData.timesPlayed || 0,
    ...partialData
  };
};
export const getSeedGames = () => {
  return [
    createGame({ name: 'Catan', minPlayers: 3, maxPlayers: 4, playTime: 120, rating: 4, categories: ['Strategy', 'Family'], status: 'played' }),
    createGame({ name: 'Wingspan', minPlayers: 1, maxPlayers: 5, playTime: 70, rating: 5, categories: ['Engine Builder', 'Strategy'], status: 'played', isFavorite: true }),
    createGame({ name: 'Azul', minPlayers: 2, maxPlayers: 4, playTime: 45, rating: 4, categories: ['Abstract', 'Family'], status: 'played' }),
    createGame({ name: 'Pandemic', minPlayers: 2, maxPlayers: 4, playTime: 45, rating: 4, categories: ['Cooperative', 'Strategy'], status: 'played' }),
    createGame({ name: 'Terraforming Mars', minPlayers: 1, maxPlayers: 5, playTime: 120, rating: 5, categories: ['Heavy Strategy', 'Engine Builder'], status: 'want-to-play' }),
    createGame({ name: 'Splendor', minPlayers: 2, maxPlayers: 4, playTime: 30, rating: 4, categories: ['Engine Builder', 'Family'], status: 'played' }),
    createGame({ name: 'Carcassonne', minPlayers: 2, maxPlayers: 5, playTime: 45, rating: 4, categories: ['Family', 'Strategy'], status: 'played' }),
    createGame({ name: 'Ticket to Ride', minPlayers: 2, maxPlayers: 5, playTime: 60, rating: 4, categories: ['Family', 'Strategy'], status: 'played' }),
    createGame({ name: 'Cascadia', minPlayers: 1, maxPlayers: 4, playTime: 45, rating: 5, categories: ['Abstract', 'Family'], status: 'want-to-play' }),
    createGame({ name: '7 Wonders', minPlayers: 3, maxPlayers: 7, playTime: 30, rating: 4, categories: ['Card Game', 'Strategy'], status: 'played' })
  ];
};
