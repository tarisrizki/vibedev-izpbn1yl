import { storage, debounce } from '../utils/storage.js';
import { getSeedGames } from '../models/Game.js';

class Store {
  constructor() {
    this.state = {
      games: [],
      filters: {
        search: '',
        status: 'all', // all | want-to-play | played
        categories: [],
        minRating: 0,
        maxPlayTime: Infinity,
        playerCount: null,
        favoritesOnly: false
      },
      sort: 'name-asc', // name-asc, name-desc, rating-asc, rating-desc, time-asc, time-desc
      theme: 'light',
      recentPicks: []
    };
    
    this.listeners = new Set();
    this.debouncedSave = debounce(this.saveState.bind(this), 300);
  }

  init() {
    // Load from storage
    const storedGames = storage.get('games');
    
    if (!storedGames || storedGames.length === 0) {
      // First launch or empty storage, inject seed data
      this.state.games = getSeedGames();
      storage.set('games', this.state.games);
    } else {
      this.state.games = storedGames;
    }
    
    this.state.filters = storage.get('filters', this.state.filters);
    this.state.sort = storage.get('sort', this.state.sort);
    this.state.theme = storage.get('theme', window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.state.recentPicks = storage.get('recentPicks', []);
    
    this.applyTheme(this.state.theme);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
    this.debouncedSave();
  }

  saveState() {
    storage.set('games', this.state.games);
    storage.set('filters', this.state.filters);
    storage.set('sort', this.state.sort);
    storage.set('theme', this.state.theme);
    storage.set('recentPicks', this.state.recentPicks);
  }

  // --- Actions ---

  addGame(game) {
    this.state.games.push(game);
    this.notify();
  }

  updateGame(id, updates) {
    const index = this.state.games.findIndex(g => g.id === id);
    if (index !== -1) {
      this.state.games[index] = { ...this.state.games[index], ...updates, updatedAt: new Date().toISOString() };
      this.notify();
    }
  }

  deleteGame(id) {
    this.state.games = this.state.games.filter(g => g.id !== id);
    this.notify();
  }

  toggleFavorite(id) {
    const game = this.state.games.find(g => g.id === id);
    if (game) {
      game.isFavorite = !game.isFavorite;
      game.updatedAt = new Date().toISOString();
      this.notify();
    }
  }

  toggleStatus(id) {
    const game = this.state.games.find(g => g.id === id);
    if (game) {
      game.status = game.status === 'played' ? 'want-to-play' : 'played';
      if (game.status === 'played') {
        game.timesPlayed = (game.timesPlayed || 0) + 1;
      }
      game.updatedAt = new Date().toISOString();
      this.notify();
    }
  }

  updateFilters(newFilters) {
    this.state.filters = { ...this.state.filters, ...newFilters };
    this.notify();
  }

  updateSort(newSort) {
    this.state.sort = newSort;
    this.notify();
  }

  toggleTheme() {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.state.theme);
    this.notify();
  }

  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
  }

  addRecentPick(gameId) {
    this.state.recentPicks = [gameId, ...this.state.recentPicks.filter(id => id !== gameId)].slice(0, 10);
    this.notify();
  }
}

export const store = new Store();
