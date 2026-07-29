import { createIcons, Dice5, Moon, Sun, Search, Plus, Box, CheckCircle, Clock, Star, PackageOpen, Shuffle, Heart, Trash, Edit, Copy } from 'lucide';
import { store } from './state/store.js';
import { CATEGORIES, createGame } from './models/Game.js';
import { pickTonightGame } from './features/recommendation/picker.js';
const initIcons = () => {
  createIcons({
    icons: {
      Dice5, Moon, Sun, Search, Plus, Box, CheckCircle, Clock, Star, PackageOpen, Shuffle, Heart, Trash, Edit, Copy
    }
  });
};
const DOM = {
  themeBtn: document.getElementById('theme-toggle'),
  themeIcon: document.getElementById('theme-icon'),
  searchInput: document.getElementById('search-input'),
  addGameBtn: document.getElementById('add-game-btn'),
  statTotal: document.getElementById('stat-total'),
  statPlayed: document.getElementById('stat-played'),
  statWant: document.getElementById('stat-want'),
  statRating: document.getElementById('stat-rating'),
  sortSelect: document.getElementById('sort-select'),
  gameGrid: document.getElementById('game-grid'),
  emptyState: document.getElementById('empty-state'),
  modal: document.getElementById('game-modal'),
  modalTitle: document.getElementById('modal-title'),
  gameForm: document.getElementById('game-form'),
  cancelBtn: document.getElementById('cancel-game-btn'),
  formId: document.getElementById('form-id'),
  formName: document.getElementById('form-name'),
  formMinPlayers: document.getElementById('form-min-players'),
  formMaxPlayers: document.getElementById('form-max-players'),
  formPlayTime: document.getElementById('form-play-time'),
  formRating: document.getElementById('form-rating'),
  formRatingInput: document.getElementById('form-rating-input'),
  formCategories: document.getElementById('form-categories'),
  formStatusWant: document.getElementById('status-want'),
  formStatusPlayed: document.getElementById('status-played'),
  formNotes: document.getElementById('form-notes'),
  errorName: document.getElementById('error-name'),
  errorMinPlayers: document.getElementById('error-min-players'),
  errorMaxPlayers: document.getElementById('error-max-players'),
  errorPlayTime: document.getElementById('error-play-time'),
  pickerSection: document.getElementById('picker-section'),
  pickPlayers: document.getElementById('pick-players'),
  pickMaxTime: document.getElementById('pick-max-time'),
  pickMinRating: document.getElementById('pick-min-rating'),
  pickFavorites: document.getElementById('pick-favorites'),
  rollBtn: document.getElementById('roll-btn'),
  pickerResult: document.getElementById('picker-result')
};
const setupUI = () => {
  initIcons();
  DOM.themeBtn.addEventListener('click', () => {
    store.toggleTheme();
    updateThemeIcon();
  });
  DOM.formCategories.innerHTML = CATEGORIES.map(cat => `
    <label class="chip-checkbox">
      <input type="checkbox" value="${cat}" class="cat-checkbox" />
      <span class="chip">${cat}</span>
    </label>
  `).join('');
  const stars = DOM.formRatingInput.querySelectorAll('i');
  stars.forEach(star => {
    star.addEventListener('click', (e) => {
      const val = parseInt(e.currentTarget.getAttribute('data-val'), 10);
      DOM.formRating.value = val;
      updateStars(val);
    });
  });
  DOM.addGameBtn.addEventListener('click', () => openModal());
  DOM.cancelBtn.addEventListener('click', () => closeModal());
  DOM.modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  });
  DOM.gameForm.addEventListener('submit', handleFormSubmit);
  DOM.searchInput.addEventListener('input', (e) => {
    store.updateFilters({ search: e.target.value });
  });
  DOM.sortSelect.addEventListener('change', (e) => {
    store.updateSort(e.target.value);
  });
  DOM.rollBtn.addEventListener('click', handleRoll);
};
const updateThemeIcon = () => {
  const isDark = store.state.theme === 'dark';
  DOM.themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
  initIcons(); 
};
const updateStars = (val) => {
  const stars = DOM.formRatingInput.querySelectorAll('i');
  stars.forEach(star => {
    const starVal = parseInt(star.getAttribute('data-val'), 10);
    if (starVal <= val) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
};
const openModal = (game = null) => {
  clearErrors();
  DOM.modal.classList.remove('hidden');
  if (game) {
    DOM.modalTitle.textContent = 'Edit Game';
    DOM.formId.value = game.id;
    DOM.formName.value = game.name;
    DOM.formMinPlayers.value = game.minPlayers;
    DOM.formMaxPlayers.value = game.maxPlayers;
    DOM.formPlayTime.value = game.playTime;
    DOM.formRating.value = game.rating;
    updateStars(game.rating);
    DOM.formNotes.value = game.notes;
    if (game.status === 'played') DOM.formStatusPlayed.checked = true;
    else DOM.formStatusWant.checked = true;
    const checkboxes = DOM.formCategories.querySelectorAll('.cat-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = game.categories.includes(cb.value);
    });
  } else {
    DOM.modalTitle.textContent = 'Add Game';
    DOM.gameForm.reset();
    DOM.formId.value = '';
    DOM.formRating.value = 0;
    updateStars(0);
  }
};
const closeModal = () => {
  DOM.modal.classList.add('hidden');
};
const clearErrors = () => {
  DOM.errorName.textContent = '';
  DOM.errorMinPlayers.textContent = '';
  DOM.errorMaxPlayers.textContent = '';
  DOM.errorPlayTime.textContent = '';
};
const handleFormSubmit = (e) => {
  e.preventDefault();
  clearErrors();
  const name = DOM.formName.value.trim();
  const minPlayers = parseInt(DOM.formMinPlayers.value, 10);
  const maxPlayers = parseInt(DOM.formMaxPlayers.value, 10);
  const playTime = parseInt(DOM.formPlayTime.value, 10);
  const rating = parseInt(DOM.formRating.value, 10);
  const notes = DOM.formNotes.value.trim();
  const status = DOM.formStatusPlayed.checked ? 'played' : 'want-to-play';
  const selectedCategories = Array.from(DOM.formCategories.querySelectorAll('.cat-checkbox:checked')).map(cb => cb.value);
  let isValid = true;
  if (!name) { DOM.errorName.textContent = 'Name is required'; isValid = false; }
  if (minPlayers > maxPlayers) { DOM.errorMinPlayers.textContent = 'Min players cannot be greater than max'; isValid = false; }
  if (playTime <= 0) { DOM.errorPlayTime.textContent = 'Play time must be > 0'; isValid = false; }
  if (!isValid) return;
  const gameData = {
    name, minPlayers, maxPlayers, playTime, rating, notes, status,
    categories: selectedCategories.slice(0, 3) 
  };
  const id = DOM.formId.value;
  if (id) {
    store.updateGame(id, gameData);
  } else {
    store.addGame(createGame(gameData));
  }
  closeModal();
};
const handleRoll = () => {
  const criteria = {
    players: parseInt(DOM.pickPlayers.value, 10) || null,
    maxPlayTime: parseInt(DOM.pickMaxTime.value, 10) || null,
    minRating: parseFloat(DOM.pickMinRating.value) || null,
    favoritesOnly: DOM.pickFavorites.checked
  };
  DOM.pickerResult.classList.remove('hidden');
  DOM.pickerResult.innerHTML = `
    <div class="shuffle-animation">
      <i data-lucide="shuffle" class="spin-icon"></i>
      <p>Finding the perfect game...</p>
    </div>
  `;
  initIcons();
  setTimeout(() => {
    const result = pickTonightGame(store.state.games, criteria, store.state.recentPicks);
    renderPickerResult(result);
    if (result) {
      store.addRecentPick(result.game.id);
      store.updateGame(result.game.id, { lastPickedAt: new Date().toISOString() });
    }
  }, 1800); 
};
const renderPickerResult = (result) => {
  if (!result) {
    DOM.pickerResult.innerHTML = `
      <div class="picker-empty">
        <i data-lucide="package-open"></i>
        <h3>No games fit tonight's requirements</h3>
        <p>Try loosening your filters or adding a new game!</p>
      </div>
    `;
    initIcons();
    return;
  }
  const g = result.game;
  DOM.pickerResult.innerHTML = `
    <div class="featured-card">
      <div class="featured-header">
        <h3>${g.name}</h3>
        ${g.isFavorite ? '<i data-lucide="heart" class="favorite-icon active" style="fill: var(--color-primary); color: var(--color-primary);"></i>' : ''}
      </div>
      <div class="featured-meta">
        <span class="meta-item"><i data-lucide="users"></i> ${g.minPlayers}-${g.maxPlayers}</span>
        <span class="meta-item"><i data-lucide="clock"></i> ${g.playTime}m</span>
        <span class="meta-item"><i data-lucide="star"></i> ${g.rating}/5</span>
      </div>
      <div class="game-categories featured-categories">
        ${g.categories.map(c => `<span class="chip">${c}</span>`).join('')}
      </div>
      <div class="featured-reason">
        <p><strong>Why this game?</strong> ${result.reason}</p>
      </div>
      <div class="featured-actions">
        <button class="btn btn-primary" id="mark-played-btn">Mark as Played</button>
        <button class="btn btn-secondary" id="pick-again-btn">Roll Again</button>
      </div>
    </div>
  `;
  initIcons();
  document.getElementById('mark-played-btn').addEventListener('click', () => {
    store.updateGame(g.id, { status: 'played', timesPlayed: (g.timesPlayed || 0) + 1 });
    alert('Marked as played! Confetti goes here 🎉');
  });
  document.getElementById('pick-again-btn').addEventListener('click', handleRoll);
};
const render = (state) => {
  updateThemeIcon();
  const total = state.games.length;
  const played = state.games.filter(g => g.status === 'played').length;
  const want = total - played;
  const totalRating = state.games.reduce((sum, g) => sum + g.rating, 0);
  const avgRating = total > 0 ? (totalRating / total).toFixed(1) : '0.0';
  DOM.statTotal.textContent = total;
  DOM.statPlayed.textContent = played;
  DOM.statWant.textContent = want;
  DOM.statRating.textContent = avgRating;
  let filtered = state.games.filter(g => {
    const searchMatch = g.name.toLowerCase().includes(state.filters.search.toLowerCase()) || 
                        g.notes.toLowerCase().includes(state.filters.search.toLowerCase());
    return searchMatch;
  });
  filtered.sort((a, b) => {
    switch (state.sort) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'rating-desc': return b.rating - a.rating;
      case 'rating-asc': return a.rating - b.rating;
      case 'time-desc': return b.playTime - a.playTime;
      case 'time-asc': return a.playTime - b.playTime;
      default: return 0;
    }
  });
  if (filtered.length === 0) {
    DOM.gameGrid.innerHTML = '';
    DOM.emptyState.classList.remove('hidden');
  } else {
    DOM.emptyState.classList.add('hidden');
    DOM.gameGrid.innerHTML = filtered.map(g => `
      <div class="game-card" data-id="${g.id}">
        <div class="game-card-header">
          <h3 class="game-card-title">${g.name}</h3>
          <button class="icon-btn action-fav" aria-label="Toggle Favorite">
            <i data-lucide="heart" style="${g.isFavorite ? 'fill: var(--color-secondary); color: var(--color-secondary);' : ''}"></i>
          </button>
        </div>
        <div class="game-card-rating">
          ${Array(5).fill(0).map((_, i) => `<i data-lucide="star" style="${i < g.rating ? 'fill: var(--color-warning); color: var(--color-warning);' : 'color: var(--text-muted);'}"></i>`).join('')}
        </div>
        <div class="game-categories">
          ${g.categories.map(c => `<span class="chip">${c}</span>`).join('')}
        </div>
        <div class="game-card-meta">
          <span class="meta-item"><i data-lucide="users"></i> ${g.minPlayers}-${g.maxPlayers}</span>
          <span class="meta-item"><i data-lucide="clock"></i> ${g.playTime}m</span>
        </div>
        <div class="status-badge ${g.status === 'played' ? 'status-played' : 'status-want'}">
          ${g.status === 'played' ? 'Played' : 'Want to Play'}
        </div>
        <div class="card-actions">
          <button class="icon-btn action-status" title="Toggle Status"><i data-lucide="check-circle"></i></button>
          <button class="icon-btn action-edit" title="Edit"><i data-lucide="edit"></i></button>
          <button class="icon-btn action-dup" title="Duplicate"><i data-lucide="copy"></i></button>
          <button class="icon-btn action-del" title="Delete" style="color: var(--color-danger);"><i data-lucide="trash"></i></button>
        </div>
      </div>
    `).join('');
    initIcons();
    document.querySelectorAll('.game-card').forEach(card => {
      const id = card.getAttribute('data-id');
      card.querySelector('.action-fav').addEventListener('click', () => store.toggleFavorite(id));
      card.querySelector('.action-status').addEventListener('click', () => store.toggleStatus(id));
      card.querySelector('.action-edit').addEventListener('click', () => {
        const game = store.state.games.find(g => g.id === id);
        if (game) openModal(game);
      });
      card.querySelector('.action-dup').addEventListener('click', () => {
        const game = store.state.games.find(g => g.id === id);
        if (game) {
          const dup = createGame({ ...game, id: null, name: `${game.name} (Copy)`, createdAt: null });
          store.addGame(dup);
        }
      });
      card.querySelector('.action-del').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this game?')) {
          store.deleteGame(id);
        }
      });
    });
  }
};
document.addEventListener('DOMContentLoaded', () => {
  setupUI();
  store.subscribe(render);
  store.init(); 
});
