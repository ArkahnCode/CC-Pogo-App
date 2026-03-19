// ─────────────────────────────────────────────
// Firebase
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCo_xqkXFOL3196v2Zthdebd7R-I_v2ff4",
  authDomain: "pogo-trading-ai2026.firebaseapp.com",
  projectId: "pogo-trading-ai2026",
  storageBucket: "pogo-trading-ai2026.firebasestorage.app",
  messagingSenderId: "217008824201",
  appId: "1:217008824201:web:8495a303c319d5f0024b58",
  measurementId: "G-FSQHDGT936"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();
let currentUser = null;

// ─────────────────────────────────────────────
// Settings sidebar
// ─────────────────────────────────────────────
const settingsBtn     = document.getElementById('settings-btn');
const settingsPanel   = document.getElementById('settings-panel');
const settingsOverlay = document.getElementById('settings-overlay');
const settingsClose   = document.getElementById('settings-close');

function openSettings()  { settingsPanel.classList.add('open'); settingsOverlay.classList.add('open'); }
function closeSettings() { settingsPanel.classList.remove('open'); settingsOverlay.classList.remove('open'); }

settingsBtn.addEventListener('click', openSettings);
settingsClose.addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', closeSettings);

// ─────────────────────────────────────────────
// Dark mode toggle
// ─────────────────────────────────────────────
const darkToggle = document.getElementById('dark-toggle');
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  darkToggle.checked = true;
}
darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', darkToggle.checked);
  localStorage.setItem('darkMode', darkToggle.checked);
});

// ─────────────────────────────────────────────
// Pokédex header buttons
// ─────────────────────────────────────────────
const dexLens = document.querySelector('.dex-lens');
const dexYellow = document.querySelector('.dex-dot.yellow');
const dexGreen = document.querySelector('.dex-dot.green');
const dexAudio = new Audio('Resources/Pokemon.mp3');
let dexYellowPressed = false, dexGreenPressed = false;

function updateLens() {
  if (dexYellowPressed && dexGreenPressed) dexLens.classList.add('enabled');
  else dexLens.classList.remove('enabled');
}
dexYellow.addEventListener('click', () => {
  dexYellowPressed = !dexYellowPressed;
  dexYellow.classList.toggle('pressed', dexYellowPressed);
  updateLens();
});
dexGreen.addEventListener('click', () => {
  dexGreenPressed = !dexGreenPressed;
  dexGreen.classList.toggle('pressed', dexGreenPressed);
  updateLens();
});
dexLens.addEventListener('click', () => {
  if (!dexLens.classList.contains('enabled')) return;
  if (dexAudio.paused) {
    dexAudio.play().catch(() => {});
  } else {
    dexAudio.pause();
  }
});

// ─────────────────────────────────────────────
// Auth UI
// ─────────────────────────────────────────────
const accountBtn   = document.getElementById('account-btn');
const authOverlay  = document.getElementById('auth-overlay');
const authModal    = document.getElementById('auth-modal');
const authClose    = document.getElementById('auth-close');
const authTitle    = document.getElementById('auth-title');
const authForm     = document.getElementById('auth-form');
const authProfile  = document.getElementById('auth-profile');
const authEmail    = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authSubmit   = document.getElementById('auth-submit');
const authError    = document.getElementById('auth-error');
const authToggleText = document.getElementById('auth-toggle-text');
const authToggleBtn  = document.getElementById('auth-toggle-btn');
const authUserEmail  = document.getElementById('auth-user-email');
const authSignout    = document.getElementById('auth-signout');
const saveIndicator  = document.getElementById('save-indicator');
const cloudSettings  = document.getElementById('cloud-settings');

let authMode = 'signin'; // 'signin' or 'signup'

function openAuthModal() {
  if (currentUser) {
    authForm.style.display = 'none';
    authProfile.style.display = 'block';
    authUserEmail.textContent = currentUser.email;
    authTitle.textContent = 'Account';
  } else {
    authForm.style.display = 'block';
    authProfile.style.display = 'none';
    authTitle.textContent = authMode === 'signin' ? 'Sign In' : 'Sign Up';
  }
  authError.classList.remove('show');
  authOverlay.classList.add('open');
  authModal.classList.add('open');
}

function closeAuthModal() {
  authOverlay.classList.remove('open');
  authModal.classList.remove('open');
  authEmail.value = '';
  authPassword.value = '';
  authError.classList.remove('show');
}

function showAuthError(msg) {
  authError.textContent = msg;
  authError.classList.add('show');
}

function setAuthMode(mode) {
  authMode = mode;
  authTitle.textContent = mode === 'signin' ? 'Sign In' : 'Sign Up';
  authSubmit.textContent = mode === 'signin' ? 'Sign In' : 'Sign Up';
  authToggleText.textContent = mode === 'signin' ? "Don't have an account?" : 'Already have an account?';
  authToggleBtn.textContent = mode === 'signin' ? 'Sign Up' : 'Sign In';
  authError.classList.remove('show');
}

accountBtn.addEventListener('click', openAuthModal);
authClose.addEventListener('click', closeAuthModal);
authOverlay.addEventListener('click', closeAuthModal);
authToggleBtn.addEventListener('click', () => setAuthMode(authMode === 'signin' ? 'signup' : 'signin'));

authSubmit.addEventListener('click', async () => {
  const email = authEmail.value.trim();
  const pass  = authPassword.value;
  if (!email || !pass) { showAuthError('Please enter email and password.'); return; }
  const mode = authMode;
  authSubmit.disabled = true;
  authSubmit.textContent = 'Please wait...';
  try {
    if (mode === 'signin') {
      await auth.signInWithEmailAndPassword(email, pass);
    } else {
      await auth.createUserWithEmailAndPassword(email, pass);
    }
    closeAuthModal();
    showToast(mode === 'signin' ? 'Signed in!' : 'Account created!');
  } catch (e) {
    showAuthError(e.message.replace('Firebase: ', ''));
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent = mode === 'signin' ? 'Sign In' : 'Sign Up';
  }
});

authPassword.addEventListener('keydown', e => { if (e.key === 'Enter') authSubmit.click(); });

document.getElementById('auth-google').addEventListener('click', async () => {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    closeAuthModal();
    showToast('Signed in with Google!');
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      showAuthError(e.message.replace('Firebase: ', ''));
    }
  }
});

authSignout.addEventListener('click', async () => {
  try {
    await auth.signOut();
    cloudLoaded = false;
    localStorage.removeItem('cachedWanted');
    localStorage.removeItem('cachedTrade');
    localStorage.removeItem('cachedListName');
    localStorage.removeItem('cachedListId');
    closeAuthModal();
    showToast('Signed out');
  } catch (e) {
    console.warn('Sign out failed:', e);
    showToast('Sign out failed');
  }
});

// ── Trainer ID & IGN ──
const trainerIdDisplay = document.getElementById('trainer-id-display');
const pogoIgnDisplay   = document.getElementById('pogo-ign-display');
const pogoIgnInput     = document.getElementById('pogo-ign-input');
const pogoIgnEditDisplay = document.getElementById('pogo-ign-edit-display');
const trainerIdEdit    = document.getElementById('trainer-id-edit');
const profileEdit      = document.getElementById('profile-edit');
const profileChevron   = document.getElementById('profile-chevron');

async function ensureTrainerProfile() {
  if (!currentUser) return;
  try {
    const userRef = db.collection('tradeLists').doc(currentUser.uid);
    const counterRef = db.collection('counters').doc('trainers');

    const result = await db.runTransaction(async tx => {
      const userDoc = await tx.get(userRef);
      const data = userDoc.exists ? userDoc.data() : {};

      if (data.trainerId) {
        return { trainerId: data.trainerId, pogoIgn: data.pogoIgn || data.trainerId };
      }

      const counterDoc = await tx.get(counterRef);
      const nextId = counterDoc.exists ? (counterDoc.data().nextId || 1) : 1;
      const id = 'Trainer' + nextId;
      tx.set(counterRef, { nextId: nextId + 1 });
      tx.set(userRef, { trainerId: id, pogoIgn: id }, { merge: true });
      return { trainerId: id, pogoIgn: id };
    });

    trainerIdDisplay.textContent = result.trainerId;
    pogoIgnDisplay.textContent = result.pogoIgn;
    trainerIdEdit.textContent = result.trainerId;
    pogoIgnEditDisplay.textContent = result.pogoIgn;
  } catch (e) {
    console.warn('Trainer profile load failed:', e.message);
  }
}

// Toggle profile edit section
document.getElementById('profile-card').addEventListener('click', (e) => {
  if (e.target.closest('#pogo-ign-input')) return;
  const isOpen = profileEdit.classList.toggle('open');
  profileChevron.style.transform = isOpen ? 'rotate(90deg)' : '';
});

// Click IGN value in edit section to start editing
pogoIgnEditDisplay.addEventListener('click', (e) => {
  e.stopPropagation();
  pogoIgnInput.value = pogoIgnEditDisplay.textContent;
  pogoIgnEditDisplay.style.display = 'none';
  pogoIgnInput.style.display = '';
  pogoIgnInput.focus();
  pogoIgnInput.select();
});

let ignCommitting = false;
async function commitIgn() {
  if (ignCommitting) return;
  ignCommitting = true;
  const val = pogoIgnInput.value.trim().replace(/[\x00-\x1f\x7f]/g, '').slice(0, 30) || trainerIdDisplay.textContent;
  pogoIgnDisplay.textContent = val;
  pogoIgnEditDisplay.textContent = val;
  pogoIgnInput.style.display = 'none';
  pogoIgnEditDisplay.style.display = '';
  if (currentUser) {
    try {
      await db.collection('tradeLists').doc(currentUser.uid).set({ pogoIgn: val }, { merge: true });
    } catch (e) { console.warn('IGN save failed:', e.message); }
  }
  ignCommitting = false;
}

pogoIgnInput.addEventListener('blur', commitIgn);
pogoIgnInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') pogoIgnInput.blur();
  if (e.key === 'Escape') { pogoIgnInput.value = pogoIgnEditDisplay.textContent; pogoIgnInput.blur(); }
});

function updateAccountUI() {
  if (currentUser) {
    document.getElementById('signin-section').style.display = 'none';
    cloudSettings.style.display = 'block';
    document.getElementById('cloud-lists-settings').style.display = 'block';
    document.getElementById('profile-email').textContent = currentUser.email;
    renderSavedLists();
    ensureTrainerProfile();
  } else {
    document.getElementById('signin-section').style.display = 'block';
    cloudSettings.style.display = 'none';
    document.getElementById('cloud-lists-settings').style.display = 'none';
    saveIndicator.className = '';
    document.getElementById('saved-lists-container').innerHTML = '';
    trainerIdDisplay.textContent = '—';
    pogoIgnDisplay.textContent = '—';
    trainerIdEdit.textContent = '—';
    pogoIgnEditDisplay.textContent = '—';
    profileEdit.classList.remove('open');
    profileChevron.style.transform = '';
    document.getElementById('profile-email').textContent = '—';
  }
}

// ─────────────────────────────────────────────
// Cloud save / load
// ─────────────────────────────────────────────
let autoSaveTimer;
let lastSavedState = { w: '', t: '', ln: '', lid: '' };
let viewMode = false;
let currentListName = '';
let currentListId = '';
// Early detection: hide picker immediately if loading a shared link
if (new URLSearchParams(window.location.search).has('list') || new URLSearchParams(window.location.search).has('view')) {
  document.body.classList.add('view-mode');
}
let cloudLoaded = false;
let resolvePokemonLoaded;
const pokemonLoadedPromise = new Promise(r => { resolvePokemonLoaded = r; });

function setSaveIndicator(status) {
  saveIndicator.className = status; // 'saved', 'saving', 'error', or ''
}

function saveLocalCache() {
  try {
    localStorage.setItem('cachedWanted', encodeList(state.wanted));
    localStorage.setItem('cachedTrade', encodeList(state.trade));
    localStorage.setItem('cachedListName', currentListName || '');
    localStorage.setItem('cachedListId', currentListId || '');
  } catch (e) { /* quota exceeded — ignore */ }
}

function loadLocalCache() {
  const w = localStorage.getItem('cachedWanted') || '';
  const t = localStorage.getItem('cachedTrade') || '';
  if (!w && !t) return false;
  const allMap = new Map(state.all.map(p => [p.id, p.name]));
  state.wanted = decodeList(w, allMap);
  state.trade  = decodeList(t, allMap);
  currentListName = localStorage.getItem('cachedListName') || '';
  currentListId = localStorage.getItem('cachedListId') || '';
  lastSavedState = { w, t, ln: currentListName, lid: currentListId };
  renderList('wanted');
  renderList('trade');
  updatePickerHighlights();
  return true;
}

async function saveToCloud() {
  if (!currentUser || viewMode) return;
  setSaveIndicator('saving');
  try {
    const w = encodeList(state.wanted);
    const t = encodeList(state.trade);
    await db.collection('tradeLists').doc(currentUser.uid).set({
      email: currentUser.email,
      wanted: w,
      trade: t,
      listName: currentListName || '',
      activeListId: currentListId || '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    lastSavedState = { w, t, ln: currentListName || '', lid: currentListId || '' };
    setSaveIndicator('saved');
    saveLocalCache();
  } catch (e) {
    console.warn('Save failed:', e.message);
    setSaveIndicator('error');
  }
}

async function loadFromCloud(silent) {
  if (!currentUser) return;
  try {
    const doc = await db.collection('tradeLists').doc(currentUser.uid).get();
    if (!doc.exists) { if (!silent) showToast('No saved list found'); return; }
    const data = doc.data();
    const w = data.wanted || '';
    const t = data.trade || '';
    const ln = data.listName || '';
    const lid = data.activeListId || '';
    // Skip re-render if local cache already matches
    if (silent && w === lastSavedState.w && t === lastSavedState.t && ln === lastSavedState.ln && lid === lastSavedState.lid) {
      setSaveIndicator('saved');
      return;
    }
    const allMap = new Map(state.all.map(p => [p.id, p.name]));
    state.wanted = decodeList(w, allMap);
    state.trade  = decodeList(t, allMap);
    renderList('wanted');
    renderList('trade');
    updatePickerHighlights();
    currentListName = ln;
    currentListId = lid;
    lastSavedState = { w, t, ln, lid };
    setSaveIndicator('saved');
    saveLocalCache();
    if (!silent) showToast('Loaded from cloud!');
  } catch (e) {
    if (!silent) showToast('Load failed: ' + e.message);
  }
}

function scheduleAutoSave() {
  if (!currentUser || viewMode) return;
  const autosaveToggle = document.getElementById('autosave-toggle');
  if (!autosaveToggle.checked) return;
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    const w = encodeList(state.wanted);
    const t = encodeList(state.trade);
    const ln = currentListName || '';
    const lid = currentListId || '';
    if (w === lastSavedState.w && t === lastSavedState.t && ln === lastSavedState.ln && lid === lastSavedState.lid) return;
    saveToCloud();
  }, 2000);
}

// ─────────────────────────────────────────────
// Cloud sharing (legacy ?view= support)
// ─────────────────────────────────────────────
async function loadSharedList(userId) {
  try {
    const doc = await db.collection('sharedLists').doc(userId).get();
    if (!doc.exists) { showToast('Shared list not found'); return; }
    const data = doc.data();
    const allMap = new Map(state.all.map(p => [p.id, p.name]));
    state.wanted = decodeList(data.wanted, allMap);
    state.trade  = decodeList(data.trade, allMap);
    viewMode = true;
    renderList('wanted');
    renderList('trade');
    updatePickerHighlights();
    enterViewMode(data.email);
  } catch (e) {
    showToast('Could not load shared list');
  }
}

function enterViewMode(ownerName, listName) {
  viewMode = true;
  document.getElementById('view-owner').textContent = ownerName;
  const listNameEl = document.getElementById('view-list-name');
  listNameEl.textContent = listName ? `trade list: ${listName}` : 'trade list';
  document.getElementById('view-banner').classList.add('show');
  document.body.classList.add('view-mode');
  setupViewAccordion();
}

let viewAccordionInitialized = false;
function setupViewAccordion() {
  const wantedSection = document.getElementById('wanted-section');
  const tradeSection = document.getElementById('trade-section');
  if (!viewAccordionInitialized) {
    viewAccordionInitialized = true;
    // Add toggle arrow to Available (trade) header only
    const tradeHeader = tradeSection.querySelector('.list-header');
    const arrow = document.createElement('button');
    arrow.className = 'view-toggle-arrow';
    arrow.innerHTML = '&#9650;';
    arrow.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleViewSection();
    });
    tradeHeader.appendChild(arrow);
    tradeHeader.addEventListener('click', (e) => {
      if (e.target.closest('button') && !e.target.closest('.view-toggle-arrow')) return;
      toggleViewSection();
    });
    wantedSection.querySelector('.list-header').addEventListener('click', () => {
      toggleViewSection();
    });
  }
  // Default: trade (Available) expanded
  tradeSection.classList.add('view-expanded');
  wantedSection.classList.remove('view-expanded');
}

function toggleViewSection() {
  const wantedSection = document.getElementById('wanted-section');
  const tradeSection = document.getElementById('trade-section');
  if (tradeSection.classList.contains('view-expanded')) {
    wantedSection.classList.add('view-expanded');
    tradeSection.classList.remove('view-expanded');
  } else {
    tradeSection.classList.add('view-expanded');
    wantedSection.classList.remove('view-expanded');
  }
}

function exitViewMode() {
  viewMode = false;
  document.getElementById('view-banner').classList.remove('show');
  document.body.classList.remove('view-mode');
  // Clean up accordion classes
  document.getElementById('wanted-section').classList.remove('view-expanded');
  document.getElementById('trade-section').classList.remove('view-expanded');
  const url = new URL(window.location.href);
  url.searchParams.delete('view');
  url.searchParams.delete('list');
  history.replaceState(null, '', url.toString());
}

document.getElementById('copy-to-mine').addEventListener('click', () => {
  exitViewMode();
  scheduleAutoSave();
  showToast('Copied to your list!');
});

document.getElementById('exit-view').addEventListener('click', () => {
  state.wanted = [];
  state.trade = [];
  renderList('wanted');
  renderList('trade');
  updatePickerHighlights();
  exitViewMode();
});

// Cloud settings buttons
document.getElementById('save-cloud-btn').addEventListener('click', async () => {
  if (!currentUser) { showToast('Sign in to save'); return; }
  if (state.wanted.length === 0 && state.trade.length === 0) { showToast('Please add at least one Pokemon.'); return; }
  try {
    const snapshot = await db.collection('tradeLists').doc(currentUser.uid)
      .collection('savedLists').orderBy('createdAt', 'desc').get();
    let maxNum = 0;
    snapshot.forEach(doc => {
      const match = doc.data().name && doc.data().name.match(/^Saved List (\d+)$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
    });
    const nextNum = maxNum + 1;
    const newDoc = await db.collection('tradeLists').doc(currentUser.uid)
      .collection('savedLists').add({
        name: `Saved List ${nextNum}`,
        wanted: encodeList(state.wanted),
        trade: encodeList(state.trade),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    currentListName = `Saved List ${nextNum}`;
    currentListId = newDoc.id;
    showToast(`Saved List ${nextNum} created!`);
    renderSavedLists();
  } catch (e) {
    showToast('Save failed: ' + e.message);
  }
});
document.getElementById('save-list-btn').addEventListener('click', async () => {
  if (!currentUser) { showToast('Sign in to save'); return; }
  if (!currentListId) { showToast('No list loaded — use "Save new list"'); return; }
  try {
    await db.collection('tradeLists').doc(currentUser.uid)
      .collection('savedLists').doc(currentListId).update({
        wanted: encodeList(state.wanted),
        trade: encodeList(state.trade)
      });
    showToast(`Saved "${currentListName}"`);
    renderSavedLists();
  } catch (e) {
    showToast('Save failed: ' + e.message);
  }
});
document.getElementById('load-cloud-btn').addEventListener('click', () => { loadFromCloud(); closeSettings(); });

async function renderSavedLists() {
  const container = document.getElementById('saved-lists-container');
  container.innerHTML = '';
  if (!currentUser) return;
  try {
    const snapshot = await db.collection('tradeLists').doc(currentUser.uid)
      .collection('savedLists').orderBy('createdAt', 'asc').get();
    if (snapshot.empty) {
      container.innerHTML = '<div class="saved-lists-empty">No saved lists yet</div>';
      return;
    }
    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'saved-list-item';
      item.dataset.listId = doc.id;
      const name = document.createElement('span');
      name.className = 'saved-list-name';
      name.textContent = data.name;
      name.title = 'Click to load';
      name.addEventListener('click', () => loadSavedList(doc.id, data));
      const rename = document.createElement('button');
      rename.className = 'saved-list-rename';
      rename.innerHTML = '&#9998;';
      rename.title = 'Rename';
      rename.addEventListener('click', () => renameSavedList(doc.id, data.name));
      const del = document.createElement('button');
      del.className = 'saved-list-delete';
      del.innerHTML = '&#10005;';
      del.title = 'Delete';
      del.addEventListener('click', (e) => { e.stopPropagation(); deleteSavedList(doc.id, data.name); });
      item.appendChild(name);
      item.appendChild(rename);
      item.appendChild(del);
      container.appendChild(item);
    });
  } catch (e) {
    // silently fail
  }
}

function loadSavedList(docId, data) {
  const allMap = new Map(state.all.map(p => [p.id, p.name]));
  state.wanted = decodeList(data.wanted, allMap);
  state.trade  = decodeList(data.trade, allMap);
  renderList('wanted');
  renderList('trade');
  updatePickerHighlights();
  currentListName = data.name || '';
  currentListId = docId;
  scheduleAutoSave();
  closeSettings();
  showToast(`Loaded "${data.name}"`);
}

function deleteSavedList(docId, name) {
  if (!currentUser) return;
  const overlay = document.getElementById('delete-confirm-overlay');
  const modal = document.getElementById('delete-confirm-modal');
  document.getElementById('delete-confirm-title').textContent = `Delete "${name}"?`;
  overlay.style.display = '';
  modal.style.display = '';
  overlay.classList.add('open');
  modal.classList.add('open');

  function close() {
    overlay.classList.remove('open');
    modal.classList.remove('open');
    overlay.style.display = 'none';
    modal.style.display = 'none';
    document.getElementById('delete-confirm-ok').removeEventListener('click', onOk);
    document.getElementById('delete-confirm-cancel').removeEventListener('click', close);
    document.getElementById('delete-confirm-close').removeEventListener('click', close);
    overlay.removeEventListener('click', close);
  }

  async function onOk() {
    close();
    try {
      await db.collection('tradeLists').doc(currentUser.uid)
        .collection('savedLists').doc(docId).delete();
      showToast(`"${name}" deleted`);
      renderSavedLists();
    } catch (e) {
      showToast('Delete failed: ' + e.message);
    }
  }

  document.getElementById('delete-confirm-ok').addEventListener('click', onOk);
  document.getElementById('delete-confirm-cancel').addEventListener('click', close);
  document.getElementById('delete-confirm-close').addEventListener('click', close);
  overlay.addEventListener('click', close);
}

function renameSavedList(docId, currentName) {
  if (!currentUser) return;
  const item = document.querySelector(`[data-list-id="${CSS.escape(docId)}"]`);
  if (!item) return;
  const nameSpan = item.querySelector('.saved-list-name');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'saved-list-rename-input';
  input.value = currentName;
  nameSpan.replaceWith(input);
  input.focus();
  input.select();

  let renameCommitting = false;
  async function commitRename() {
    if (renameCommitting) return;
    renameCommitting = true;
    const newName = input.value.trim();
    if (!newName || newName === currentName) {
      renderSavedLists();
      return;
    }
    try {
      await db.collection('tradeLists').doc(currentUser.uid)
        .collection('savedLists').doc(docId).update({ name: newName });
      showToast(`Renamed to "${newName}"`);
      renderSavedLists();
    } catch (e) {
      showToast('Rename failed: ' + e.message);
      renderSavedLists();
    }
  }

  input.addEventListener('blur', commitRename);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { input.value = currentName; input.blur(); }
  });
}

// Auth state listener
auth.onAuthStateChanged(async user => {
  currentUser = user;
  updateAccountUI();
  if (user) {
    await pokemonLoadedPromise;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('list') && !params.has('view') && !cloudLoaded) {
      cloudLoaded = true;
      await loadFromCloud(true);
    }
  }
});

// ─────────────────────────────────────────────
// Gen ranges
// ─────────────────────────────────────────────
const MAX_POKEMON_ID = 1010;
const GEN_RANGES = [
  [1, 151],   // 1
  [152, 251], // 2
  [252, 386], // 3
  [387, 493], // 4
  [494, 649], // 5
  [650, 721], // 6
  [722, 809], // 7
  [810, 905], // 8
  [906, MAX_POKEMON_ID],// 9
];

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
const state = {
  all: [],       // [{id, name}]
  wanted: [],    // [{id, name, shiny, form}]
  trade: [],     // [{id, name, shiny, form}]
  filtered: [],
  pendingId: null,
  pendingName: null,
  pendingForm: '',
};

// ─────────────────────────────────────────────
// Type colors  (source: pokemonaaah.net/art/colordex)
// ─────────────────────────────────────────────
const TYPE_COLORS = {
  bug:      '#94bc4a',
  dark:     '#736c75',
  dragon:   '#6a7baf',
  electric: '#e5c531',
  fairy:    '#e397d1',
  fighting: '#cb5f48',
  fire:     '#ea7a3c',
  flying:   '#7da6de',
  ghost:    '#846ab6',
  grass:    '#71c558',
  ground:   '#cc9f4f',
  ice:      '#70cbd4',
  normal:   '#aab09f',
  poison:   '#b468b7',
  psychic:  '#e5709b',
  rock:     '#b2a061',
  steel:    '#89a1b0',
  water:    '#539ae2',
};

// exclusiveMovesData: loaded from JSON, keyed by Pokemon ID string
let exclusiveMovesData = {};

async function fetchExclusiveMoves() {
  try {
    const res = await fetch('Resources/exclusive_moves.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    exclusiveMovesData = await res.json();
    renderList('wanted');
    renderList('trade');
  } catch (e) { console.warn('Failed to load exclusive moves:', e); }
}

// Get exclusive moves for a Pokemon ID + form key
// Returns { fast: [...], charged: [...] } or null if none
function getExclusiveMoves(id, form) {
  const entry = exclusiveMovesData[String(id)];
  if (!entry) return null;
  let fast = [...(entry.fast || [])];
  let charged = [...(entry.charged || [])];
  if (form && entry.forms) {
    const formLabel = formatFormLabel(form, id);
    const formData = entry.forms[formLabel];
    if (formData) {
      fast = [...fast, ...(formData.fast || [])];
      charged = [...charged, ...(formData.charged || [])];
    }
  }
  if (fast.length === 0 && charged.length === 0) return null;
  return { fast, charged };
}

// typeMap: Map<pokemonId, [type1, type2?]>  populated by fetchTypeMap()
const typeMap = new Map();

// Blend hex color with white (factor = how much color to keep, 0–1)
function lightenHex(hex, factor = 0.28) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r * factor + 255 * (1 - factor));
  const lg = Math.round(g * factor + 255 * (1 - factor));
  const lb = Math.round(b * factor + 255 * (1 - factor));
  return `#${lr.toString(16).padStart(2,'0')}${lg.toString(16).padStart(2,'0')}${lb.toString(16).padStart(2,'0')}`;
}

function cardBg(id) {
  const types = typeMap.get(id);
  if (!types) return '#EEEEF3';
  const c1 = lightenHex(TYPE_COLORS[types[0]] || '#aab09f');
  if (!types[1] || types[1] === types[0]) return c1;
  const c2 = lightenHex(TYPE_COLORS[types[1]] || '#aab09f');
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
}

async function fetchTypeMap() {
  const cacheKey = 'pogo_typeMap_v1';
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      for (const [id, types] of Object.entries(data)) typeMap.set(parseInt(id), types);
      if (state.all.length > 0) { renderPicker(); renderList('wanted'); renderList('trade'); }
      return;
    } catch (e) { console.warn('Type cache parse failed:', e); }
  }

  const TYPE_NAMES = [
    'normal','fire','water','electric','grass','ice','fighting','poison',
    'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy',
  ];
  try {
    const results = await Promise.all(
      TYPE_NAMES.map(t => fetch(`https://pokeapi.co/api/v2/type/${t}`).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }))
    );
    for (const typeData of results) {
      const name = typeData.name;
      for (const { pokemon, slot } of typeData.pokemon) {
        const parts = pokemon.url.split('/').filter(Boolean);
        const id = parseInt(parts[parts.length - 1]);
        if (isNaN(id) || id > MAX_POKEMON_ID) continue;
        if (!typeMap.has(id)) typeMap.set(id, []);
        typeMap.get(id)[slot - 1] = name;
      }
    }

    const obj = {};
    for (const [id, types] of typeMap.entries()) obj[id] = types;
    try { sessionStorage.setItem(cacheKey, JSON.stringify(obj)); } catch (e) { console.warn('Type cache save failed:', e); }

    if (state.all.length > 0) {
      renderPicker();
      renderList('wanted');
      renderList('trade');
    }
  } catch (e) {
    console.warn('Could not load type data:', e.message);
  }
}

// ─────────────────────────────────────────────
// Mythical Pokémon: available in GO but cannot be traded
const MYTHICAL_POKEMON = new Set([
  151,    // Mew
  251,    // Celebi
  385,    // Jirachi
  386,    // Deoxys
  489,    // Phione
  490,    // Manaphy
  491,    // Darkrai
  492,    // Shaymin
  493,    // Arceus
  494,    // Victini
  647,    // Keldeo
  648,    // Meloetta
  649,    // Genesect
  719,    // Diancie
  720,    // Hoopa
  721,    // Volcanion
  802,    // Marshadow
  893,    // Zarude
]);

// Pokémon available in Pokémon GO (source: serebii.net/pokemongo/gen*pokemon.shtml)
const GO_AVAILABLE = new Set([
  1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
  31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,
  58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,
  85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,
  109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,
  129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,
  149,150,
  152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,
  172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,
  192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,
  212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,
  232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,
  252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,
  272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,
  292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,
  312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,
  332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,
  352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,
  372,373,374,375,376,377,378,379,380,381,382,383,384,
  387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,
  407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,
  427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,
  447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,
  467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,
  487,488,
  495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,
  514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,
  534,535,536,537,538,539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,
  554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,
  574,575,576,577,578,579,580,581,582,583,584,585,586,587,588,589,590,591,592,593,
  594,595,596,597,598,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,
  614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,
  634,635,636,637,638,639,640,641,642,643,644,645,646,
  650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,
  670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,
  690,691,692,693,694,695,696,697,698,699,700,701,702,703,704,705,706,707,708,709,
  710,711,712,713,714,715,716,717,
  722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,
  742,743,744,745,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,
  763,764,765,766,767,768,769,770,775,776,777,779,780,781,782,783,784,785,786,787,
  788,789,790,791,792,793,794,795,796,797,798,799,800,803,804,805,806,
  810,811,812,813,814,815,816,817,818,819,820,821,822,823,827,828,829,830,831,832,
  835,836,837,838,839,840,841,842,848,849,850,851,852,853,854,855,856,857,858,859,860,861,
  862,863,864,865,866,867,870,872,873,874,877,884,885,886,887,888,889,891,892,
  894,895,
  899,900,901,903,904,905,
  906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,
  926,927,928,929,930,932,933,934,935,936,937,938,939,940,941,944,945,948,949,950,
  957,958,959,960,961,962,965,966,969,970,971,972,973,974,975,977,978,979,980,982,
  983,996,997,998,999,1000,1011,1012,1013,1019
]);

// Pokémon that can have special/location backgrounds in GO
// Source: https://www.serebii.net/pokemongo/backgrounds.shtml
// ─────────────────────────────────────────────
const BACKGROUNDS=[
{name:'GO Tour Las Vegas',slug:'gotourlasvegas',pokemon:[382,383]},
{name:'Air Adventures Jeju Island',slug:'airadventuresjejuisland',pokemon:[380,381]},
{name:'GO Fest Osaka',slug:'gofestosaka',pokemon:[384,488,716,717]},
{name:'GO Fest London',slug:'gofestlondon',pokemon:[384,488,716,717]},
{name:'GO Fest New York City',slug:'gofestnewyorkcity',pokemon:[384,488,716,717]},
{name:'City Safari Seoul',slug:'citysafariseoul',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Barcelona',slug:'citysafaribarcelona',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Mexico City',slug:'citysafarimexicocity',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'GO Tour Los Angeles',slug:'gotourlosangeles',pokemon:[483,484]},
{name:'Air Adventures Bali',slug:'airadventuresbali',pokemon:[380,381]},
{name:'City Safari Tainan',slug:'citysafaritainan',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'Air Adventures Surabaya',slug:'airadventuressurabaya',pokemon:[380,381]},
{name:'GO Fest Sendai',slug:'gofestsendai',pokemon:[791,792,793,796,798,799,800,805]},
{name:'GO Fest Madrid',slug:'gofestmadrid',pokemon:[791,792,793,794,798,799,800,805]},
{name:'GO Fest New York City 2024',slug:'gofestnewyorkcity2024',pokemon:[791,792,793,794,798,799,800,806]},
{name:'2024 Pokemon World Championships',slug:'2024pokemonworldchampionships',pokemon:[25]},
{name:'Air Adventures Yogyakarta',slug:'airadventuresyogyakarta',pokemon:[380,381]},
{name:'MLB Marlins',slug:'mlbmarlins',pokemon:[25]},
{name:'MLB Mariners',slug:'mlbmariners',pokemon:[25]},
{name:'Air Adventures Jakarta',slug:'airadventuresjakarta',pokemon:[380,381]},
{name:'Safari Zone Incheon',slug:'safarizoneincheon',pokemon:[25,672]},
{name:'GO Wild Area Fukuoka',slug:'gowildareafukuoka',pokemon:[483,484,849]},
{name:'City Safari Hong Kong',slug:'citysafarihongkong',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Sao Paulo',slug:'citysafarisaopaulo',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'GO Tour New Taipei City',slug:'gotournewtaipeicity',pokemon:[643,644,646]},
{name:'GO Tour Unova Los Angeles',slug:'gotourunovalosangeles',pokemon:[643,644,646]},
{name:'City Safari Singapore',slug:'citysafarisingapore',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Mumbai',slug:'citysafarimumbai',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Milan',slug:'citysafarimilan',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Santiago',slug:'citysafarisantiago',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'Spring Blossom Festival',slug:'springblossomfestival',pokemon:[25,585]},
{name:'Expo 2025 - Osaka',slug:'expo2025-osaka',pokemon:[25]},
{name:'Expo 2025 - Osaka 2',slug:'expo2025-osaka2',pokemon:[1,4,7]},
{name:'Suita City',slug:'suitacity',pokemon:[25]},
{name:'GO Fest 2025 Osaka',slug:'gofest2025osaka',pokemon:[812,888,889]},
{name:'GO Fest 2025 Jersey City',slug:'gofest2025jerseycity',pokemon:[815,888,889]},
{name:'GO Fest 2025 Paris',slug:'gofest2025paris',pokemon:[4,818,888,889]},
{name:'Lotte Giants',slug:'lottegiants',pokemon:[25]},
{name:'Seattle Mariners',slug:'seattlemariners',pokemon:[25]},
{name:'Road Trip 2025 Manchester',slug:'roadtrip2025manchester',pokemon:[25]},
{name:'Miami Marlins',slug:'miamimarlins',pokemon:[25]},
{name:'Road Trip 2025 London',slug:'roadtrip2025london',pokemon:[25]},
{name:'Tampa Bay Rays',slug:'tampabayrays',pokemon:[25]},
{name:'Milwaukee Brewers',slug:'milwaukeebrewers',pokemon:[25]},
{name:'Road Trip 2025 Paris',slug:'roadtrip2025paris',pokemon:[25]},
{name:'Jangheung Water Festival',slug:'jangheungwaterfestival',pokemon:[25,131,585]},
{name:'Road Trip 2025 Valencia',slug:'roadtrip2025valencia',pokemon:[25]},
{name:'Washington Nationals',slug:'washingtonnationals',pokemon:[25]},
{name:'Road Trip 2025 Berlin',slug:'roadtrip2025berlin',pokemon:[25]},
{name:'Arizona Diamondbacks',slug:'arizonadiamondbacks',pokemon:[25]},
{name:'Chicago White Sox',slug:'chicagowhitesox',pokemon:[25]},
{name:'Baltimore Orioles',slug:'baltimoreorioles',pokemon:[25]},
{name:'Cleveland Guardians',slug:'clevelandguardians',pokemon:[25]},
{name:'2025 Pokemon World Championships',slug:'2025pokemonworldchampionships',pokemon:[25]},
{name:'Road Trip 2025 The Hague',slug:'roadtrip2025thehague',pokemon:[25]},
{name:'Road Trip 2025 Cologne',slug:'roadtrip2025cologne',pokemon:[25]},
{name:'New York Mets',slug:'newyorkmets',pokemon:[25]},
{name:'Boston Red Sox',slug:'bostonredsox',pokemon:[25]},
{name:'San Francisco Giants',slug:'sanfranciscogiants',pokemon:[25]},
{name:'Minnesota Twins',slug:'minnesotatwins',pokemon:[25]},
{name:'Texas Rangers',slug:'texasrangers',pokemon:[25]},
{name:'Mega Evolution Paris',slug:'megaevolutionparis',pokemon:[4]},
{name:'Mega Evolution Paris 2',slug:'megaevolutionparis2',pokemon:[4]},
{name:'City Safari Bangkok',slug:'citysafaribangkok',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Amsterdam',slug:'citysafariamsterdam',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Valencia',slug:'citysafarivalencia',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Cancun',slug:'citysafaricancun',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Vancouver',slug:'citysafarivancouver',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'Pokemon GO at Jeju Island',slug:'pokemongoatjejuisland',pokemon:[25]},
{name:'GO Wild Area Nagasaki',slug:'gowildareanagasaki',pokemon:[488,491,760,861]},
{name:"Taipei Children's Amusement Park",slug:"taipeichildren'samusementpark",pokemon:[131]},
{name:'Busan Fireworks Festival',slug:'busanfireworksfestival',pokemon:[25]},
{name:'PokePark Kanto',slug:'pokeparkkanto',pokemon:[25,144,145,146]},
{name:'Carnival Flamigo Cologne',slug:'carnivalflamigocologne',pokemon:[973]},
{name:'Carnival Flamigo Rio',slug:'carnivalflamigorio',pokemon:[973]},
{name:'GO Tour 2026 Tainan',slug:'gotour2026tainan',pokemon:[6,71,130,181,254,282,334,359,373,445,448,679,686,716,717]},
{name:'GO Tour 2026 Los Angeles',slug:'gotour2026losangeles',pokemon:[6,71,130,181,254,282,334,359,373,445,448,679,686,716,717]},
{name:'Pyeongchang Winter Festival',slug:'pyeongchangwinterfestival',pokemon:[25,585]},
{name:'City Safari Sydney',slug:'citysafarisydney',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Miami',slug:'citysafarimiami',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'City Safari Buenos Aires',slug:'citysafaribuenosaires',pokemon:[133,134,135,136,196,197,470,471,700]},
{name:'NFL Cardinals',slug:'nflcardinals',pokemon:[25]},
{name:'Pokelid Okinawa',slug:'pokelidokinawa',pokemon:[25]},
{name:'Pokelid Fukuoka',slug:'pokelidfukuoka',pokemon:[25]},
{name:'Pokelid Kagoshima',slug:'pokelidkagoshima',pokemon:[25]},
{name:'Pokelid Miyazaki',slug:'pokelidmiyazaki',pokemon:[25]},
{name:'Pokelid Nagasaki',slug:'pokelidnagasaki',pokemon:[25,181]},
{name:'Pokelid Saga',slug:'pokelidsaga',pokemon:[25]},
{name:'Pokelid Aichi',slug:'pokelidaichi',pokemon:[25]},
{name:'Pokelid Akita',slug:'pokelidakita',pokemon:[25]},
{name:'Pokelid Aomori',slug:'pokelidaomori',pokemon:[25]},
{name:'Pokelid Chiba',slug:'pokelidchiba',pokemon:[25]},
{name:'Pokelid Fukui',slug:'pokelidfukui',pokemon:[25]},
{name:'Pokelid Fukushima',slug:'pokelidfukushima',pokemon:[25]},
{name:'Pokelid Gifu',slug:'pokelidgifu',pokemon:[25]},
{name:'Pokelid Hokkaido',slug:'pokelidhokkaido',pokemon:[25]},
{name:'Pokelid Hyogo',slug:'pokelidhyogo',pokemon:[25]},
{name:'Pokelid Ibaraki',slug:'pokelidibaraki',pokemon:[25]},
{name:'Pokelid Ishikawa',slug:'pokelidishikawa',pokemon:[25]},
{name:'Pokelid Iwate',slug:'pokelidiwate',pokemon:[25]},
{name:'Pokelid Kanagawa',slug:'pokelidkanagawa',pokemon:[25]},
{name:'Pokelid Kyoto',slug:'pokelidkyoto',pokemon:[25]},
{name:'Pokelid Mie',slug:'pokelidmie',pokemon:[25]},
{name:'Pokelid Miyagi',slug:'pokelidmiyagi',pokemon:[25]},
{name:'Pokelid Nara',slug:'pokelidnara',pokemon:[25]},
{name:'Pokelid Niigata',slug:'pokelidniigata',pokemon:[25]},
{name:'Pokelid Osaka',slug:'pokelidosaka',pokemon:[25]},
{name:'Pokelid Saitama',slug:'pokelidsaitama',pokemon:[25]},
{name:'Pokelid Shiga',slug:'pokelidshiga',pokemon:[25]},
{name:'Pokelid Shizuoka',slug:'pokelidshizuoka',pokemon:[25]},
{name:'Pokelid Tochigi',slug:'pokelidtochigi',pokemon:[25]},
{name:'Pokelid Tokyo',slug:'pokelidtokyo',pokemon:[25]},
{name:'Pokelid Toyama',slug:'pokelidtoyama',pokemon:[25]},
{name:'Pokelid Wakayama',slug:'pokelidwakayama',pokemon:[25]},
{name:'Pokelid Ehime',slug:'pokelidehime',pokemon:[25]},
{name:'Pokelid Kagawa',slug:'pokelidkagawa',pokemon:[25]},
{name:'Pokelid Kochi',slug:'pokelidkochi',pokemon:[25]},
{name:'Pokelid Okayama',slug:'pokelidokayama',pokemon:[25]},
{name:'Pokelid Shimane',slug:'pokelidshimane',pokemon:[25]},
{name:'Pokelid Tokushima',slug:'pokelidtokushima',pokemon:[25]},
{name:'Pokelid Tottori',slug:'pokelidtottori',pokemon:[25]},
{name:'Pokelid Yamaguchi',slug:'pokelidyamaguchi',pokemon:[25]},
{name:'GO Fest 2024 Wormhole',slug:'gofest2024wormhole',pokemon:[793,794,795,796,797,798,799,800,805,806]},
{name:'GO Fest 2024 Radiance',slug:'gofest2024radiance',pokemon:[791]},
{name:'GO Fest 2024 Umbra',slug:'gofest2024umbra',pokemon:[792]},
{name:'GO Fest 2024 Wormhole Radiance',slug:'gofest2024wormholeradiance',pokemon:[800]},
{name:'GO Fest 2024 Wormhole Umbra',slug:'gofest2024wormholeumbra',pokemon:[800]},
{name:'Team Valor',slug:'teamvalor',pokemon:[77]},
{name:'Team Instinct',slug:'teaminstinct',pokemon:[239]},
{name:'Team Mystic',slug:'teammystic',pokemon:[131]},
{name:'GO Wild Area 2024',slug:'gowildarea2024',pokemon:[382,383,483,484,849]},
{name:'Community Day 2024',slug:'communityday2024',pokemon:[56,69,77,113,137,155,371,374,540,602,704,722,725,728,761]},
{name:'Dual Destiny',slug:'dualdestiny',pokemon:[280,588,616,906]},
{name:'GO Tour Enigma',slug:'gotourenigma',pokemon:[509,519,525,527,532,535,551,554,555,559,561,595,597,599]},
{name:'GO Tour Unova Black',slug:'gotourunovablack',pokemon:[495,498,501,638,639,640,641,643,644,645,646,649]},
{name:'GO Tour Unova White',slug:'gotourunovawhite',pokemon:[495,498,501,638,639,640,642,643,644,645,646,649]},
{name:'GO Tour Unova Black White',slug:'gotourunovablackwhite',pokemon:[646]},
{name:'Might and Mastery',slug:'mightandmastery',pokemon:[66,158,307,434,582,747,909,921,935]},
{name:'Delightful Days',slug:'delightfuldays',pokemon:[131,133,144,145,782,812,815,818,821,823,912]},
{name:'Ancients Recovered Regirock',slug:'ancientsrecoveredregirock',pokemon:[377]},
{name:'Ancients Recovered Regice',slug:'ancientsrecoveredregice',pokemon:[378]},
{name:'Ancients Recovered Registeel',slug:'ancientsrecoveredregisteel',pokemon:[379]},
{name:'Ancients Recovered Regigigas',slug:'ancientsrecoveredregigigas',pokemon:[486]},
{name:'Ancients Recovered Regieleki',slug:'ancientsrecoveredregieleki',pokemon:[894]},
{name:'Ancients Recovered Regidrago',slug:'ancientsrecoveredregidrago',pokemon:[895]},
{name:'GO Fest 2025 Zamazenta',slug:'gofest2025zamazenta',pokemon:[889]},
{name:'GO Fest 2025 Zacian',slug:'gofest2025zacian',pokemon:[888]},
{name:'9th Anniversary',slug:'9thanniversary',pokemon:[999]},
{name:'Dark Skies',slug:'darkskies',pokemon:[1,3,4,6,7,9,10,12,66,68,92,94,98,99,113,131,138,140,143,144,145,146,213,243,244,245,302,320,374,380,381,519,529,554,568,615,810,812,813,815,816,818,819,821,831,848,849,856,870]},
{name:'Tales of Transformation',slug:'talesoftransformation',pokemon:[152,158,498,577,638,669]},
{name:'Pokemon Concierge',slug:'pokemonconcierge',pokemon:[54]},
{name:'GO Wild Area 2025',slug:'gowildarea2025',pokemon:[249,250,488,491,760,861]},
{name:'Pokemon Astronomical Observatory',slug:'pokemonastronomicalobservatory',pokemon:[35]},
{name:'Community Day 2026',slug:'communityday2026',pokemon:[393,810]},
{name:'GO Tour 2026 Mega',slug:'gotour2026mega',pokemon:[3,6,9,18,71,115,212,214,248,254,257,260,282,359,373,376,380,381,445,448,475,687]},
{name:'GO Tour 2026 X',slug:'gotour2026x',pokemon:[25,679,716]},
{name:'GO Tour 2026 Y',slug:'gotour2026y',pokemon:[25,679,717]},
{name:'GO Tour 2026 Gold',slug:'gotour2026gold',pokemon:[25,250]},
{name:'GO Tour 2026 Silver',slug:'gotour2026silver',pokemon:[25,249]},
{name:'GO Tour 2026 Ruby',slug:'gotour2026ruby',pokemon:[25,383]},
{name:'GO Tour 2026 Sapphire',slug:'gotour2026sapphire',pokemon:[25,382]},
{name:'GO Tour 2026 Diamond',slug:'gotour2026diamond',pokemon:[25,483]},
{name:'GO Tour 2026 Pearl',slug:'gotour2026pearl',pokemon:[25,484]},
{name:'Festival of Colors',slug:'festivalofcolors',pokemon:[25]},
{name:'Pokemon Pokopia',slug:'pokemonpokopia',pokemon:[131,132,143,149]},
];

// Build lookup: pokemonId → [{name, slug}]
const BG_MAP = new Map();
for (const bg of BACKGROUNDS) {
  for (const pid of bg.pokemon) {
    if (!BG_MAP.has(pid)) BG_MAP.set(pid, []);
    BG_MAP.get(pid).push({ name: bg.name, slug: bg.slug });
  }
}
const BG_POKEMON = new Set(BG_MAP.keys());
const BG_SLUG_URL = slug => `Resources/Backgrounds/${slug}.jpg`;

// Pokémon that can Dynamax / Gigantamax in GO
// Source: https://pokemongo.fandom.com/wiki/List_of_Dynamax_Pok%C3%A9mon
// ─────────────────────────────────────────────
const SHADOW_POKEMON = new Set([
  1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,23,24,27,28,29,30,31,32,33,34,
  37,38,41,42,43,44,45,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,
  69,70,71,72,73,74,75,76,79,80,81,82,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,
  103,104,105,106,107,109,110,111,112,114,116,117,120,121,123,125,126,127,129,130,131,
  137,138,139,142,143,144,145,146,147,148,149,150,152,153,154,155,156,157,158,159,160,
  165,166,169,177,178,179,180,181,182,185,186,187,188,189,190,194,195,198,199,200,202,
  203,204,205,207,208,209,210,211,212,213,215,216,217,220,221,225,227,228,229,230,231,
  232,233,234,237,243,244,245,246,247,248,249,250,252,253,254,255,256,257,258,259,260,
  261,262,263,264,273,274,275,276,277,280,281,282,287,288,289,293,294,295,296,297,299,
  302,303,304,305,306,309,310,318,319,320,321,322,323,325,326,328,329,330,331,332,333,
  334,339,340,341,342,343,344,345,346,347,348,349,350,353,354,355,356,359,361,362,363,
  364,365,371,372,373,374,375,376,377,378,379,380,381,382,383,387,388,389,390,391,392,
  393,394,395,396,397,398,399,400,403,404,405,408,409,410,411,424,425,426,429,430,431,
  432,434,435,443,444,445,449,450,451,452,453,454,459,460,461,462,464,465,466,467,472,
  473,474,475,476,477,478,483,484,485,486,487,488,491,495,496,497,498,499,500,501,502,
  503,504,505,509,510,519,520,521,522,523,524,525,526,529,530,532,533,534,538,539,543,
  544,545,554,555,557,558,562,563,564,565,566,567,568,569,574,575,576,577,578,579,580,
  581,588,589,590,591,595,596,597,598,607,608,609,616,617,622,623,633,634,635,641,642,
  650,651,652,653,654,655,656,657,658,659,660,661,662,663,686,687,696,697,698,699,708,
  709,731,732,733,736,737,738,862,901,903,979
]);

// Pokemon + background combos where purified and background can coexist
const PURIFY_BG_EXCEPTIONS = new Map([
  [250, new Set(['gotour2026gold', 'gowildarea2025'])],       // Ho-Oh
  [249, new Set(['gotour2026silver', 'gowildarea2025'])],     // Lugia
  [491, new Set(['gowildarea2025', 'gowildareanagasaki'])],   // Darkrai
  [488, new Set(['gowildarea2025', 'gowildareanagasaki'])],   // Cresselia
]);

function canPurifyWithBg(id, bgSlug) {
  const allowed = PURIFY_BG_EXCEPTIONS.get(id);
  return allowed && allowed.has(bgSlug);
}

// Non-costume forms that cannot be purified
const NO_PURIFY_FORMS = new Set([
  '150.fA',  // Armored Mewtwo
]);
// Forms that cannot be shiny
const NO_SHINY_FORMS = new Set([
  '150.fA',  // Armored Mewtwo
]);

// Shadow costumes that can still be purified
const SHADOW_COSTUMES = new Set([
  '20.cJAN_2020_NOEVOLVE', '20.cANNIVERSARY_2024',   // Party Hat Raticate
  '29.cJAN_2020_NOEVOLVE', '29.cANNIVERSARY_2024',   // Party Hat Nidorino
  '37.cFALL_2022',                                     // Spooky Festival Vulpix
  '38.cFALL_2022',                                     // Spooky Festival Ninetales
  '54.cHOLIDAY_2023',                                  // Holiday Attire Psyduck
  '55.cHOLIDAY_2023',                                  // Holiday Attire Golduck
  '143.cGOFEST_2022_NOEVOLVE',                         // Cowboy Hat Snorlax
  '249.fS',                                            // Apex Lugia
  '250.fS',                                            // Apex Ho-Oh
  '281.cFALL_2020_NOEVOLVE',                           // Fashionable Kirlia
  '403.cFALL_2020_NOEVOLVE',                           // Fashionable Shinx
]);

// ─────────────────────────────────────────────
const DYNAMAX_POKEMON = new Set([
  1,2,3,4,5,6,7,8,9,10,11,12,25,26,58,59,63,64,65,66,67,68,
  92,93,94,98,99,106,107,113,131,133,134,135,136,138,139,140,141,143,144,145,146,
  196,197,213,242,243,244,245,249,250,
  280,281,282,302,320,321,363,364,365,374,375,376,378,379,380,381,
  470,471,475,
  519,520,521,524,525,526,527,528,529,530,554,555,568,569,615,
  686,687,700,
  761,762,763,766,780,
  810,811,812,813,814,815,816,817,818,819,820,821,822,823,831,832,
  849,856,857,858,861,870,884,888,889,891,892
]);

// ─────────────────────────────────────────────
// Sprite helpers  (Pokémon GO 3D assets via PokeMiners pogo_assets)
// ─────────────────────────────────────────────
const POGO_BASE    = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/Addressable%20Assets';
const HOME_BASE    = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home';
const REGULAR_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Sprite filename overrides for cases where PokeMiners casing differs
const SPRITE_OVERRIDE = {
  '133.cMAY_2023': `${POGO_BASE}/pm133.cMay_2023`,
};
// form: e.g. '' | '.cFALL_2018' | '.fALOLA'
function spriteUrl(id, form = '', shiny = false) {
  const shinyPart = shiny ? '.s' : '';
  const override = SPRITE_OVERRIDE[`${id}${form}`];
  if (override) return `${override}${shinyPart}.icon.png`;
  return `${POGO_BASE}/pm${id}${form}${shinyPart}.icon.png`;
}

function spriteWithFallback(img, id, shiny = false) {
  img.onerror = () => {
    img.onerror = () => {
      img.onerror = null;
      img.src = shiny ? `${REGULAR_BASE}/shiny/${id}.png` : `${REGULAR_BASE}/${id}.png`;
    };
    img.src = shiny ? `${HOME_BASE}/shiny/${id}.png` : `${HOME_BASE}/${id}.png`;
  };
}

function padId(id) { return String(id).padStart(4, '0'); }

const _escDiv = document.createElement('div');
function escapeHtml(str) {
  _escDiv.textContent = str;
  return _escDiv.innerHTML;
}

// ─────────────────────────────────────────────
// Costume / Form Map  (PokeMiners Addressable Assets)
// Filename pattern: pm{id}[.c{COSTUME}|.f{FORM}][.s].icon.png
// ─────────────────────────────────────────────
const costumeMap = new Map(); // Map<id, [{key, label, hasShiny}]>
let costumesLoaded = false;

// Pikachu-specific form label overrides (source: serebii.net/pokemongo/pokemon/025.shtml)
const PIKACHU_LABELS = {
  '.cCOSTUME_1':                    'World Cap',
  '.cCOSTUME_2':                    "New Year's Hat",
  '.cCOSTUME_2020':                 'Flying',
  '.cCOSTUME_2020_NOEVOLVE':        'Flying',
  '.fCOSTUME_2020':                 'Flying',
  '.fCOSTUME_2020_NOEVOLVE':        'Flying',
  '.cHOLIDAY_2016':                 'Santa Hat',
  '.cONE_YEAR_ANNIVERSARY':         'Original Cap',
  '.cHALLOWEEN_2017':               'Witch Hat',
  '.cANNIVERSARY':                  'Party Hat',
  '.cSUMMER_2018':                  'Summer Style',
  '.cFALL_2018':                    'Fragment Hat',
  '.cFALL_2018_NOEVOLVE':           'Fragment Hat',
  '.cNOVEMBER_2018':                'Flower Crown',
  '.cWINTER_2018':                  'Beanie',
  '.cFEB_2019':                     'Detective Hat',
  '.cPI':                           'Detective Hat (2023)',
  '.cMAY_2019_NOEVOLVE':            'Straw Hat',
  '.cJAN_2020_NOEVOLVE':            'Red Party Hat',
  '.cAPRIL_2020_NOEVOLVE':          'Flower Hat',
  '.cKANTO_2020_NOEVOLVE':          'Charizard Hat',
  '.cJOHTO_2020_NOEVOLVE':          'Umbreon Hat',
  '.cHOENN_2020_NOEVOLVE':          'Rayquaza Hat',
  '.cSINNOH_2020_NOEVOLVE':         'Lucario Hat',
  '.cSAFARI_2020_NOEVOLVE':         'Safari',
  '.cGOFEST_2021_NOEVOLVE':         'Meloetta Hat',
  '.cHALLOWEEN_2021_NOEVOLVE':      'Halloween Hat',
  '.cGOFEST_2022_NOEVOLVE':         'Gracidea',
  '.cTCG_2022_NOEVOLVE':            'TCG Hat',
  '.cANNIVERSARY_2022_NOEVOLVE':    'Cake Hat',
  '.cGOTOUR_2023_BANDANA_NOEVOLVE': "May's Bow",
  '.cGOTOUR_2023_HAT_NOEVOLVE':     "Brendan's Hat",
  '.cSPRING_2023':                  'Cherry Blossoms',
  '.cJAN_2023_NOEVOLVE':            'Party Top Hat',
  '.cFALL_2023_NOEVOLVE':           'Tricks & Treats',
  '.cHOLIDAY_2023':                 'Holiday 2023',
  '.cINDONESIA_2025_NOEVOLVE':      'Indonesia Football',
  '.fROCK_STAR':                    'Rock Star',
  '.fPOP_STAR':                     'Pop Star',
  '.fDOCTOR':                       'Ph.D. Pikachu',
  '.fCOPY_2019':                    'Clone',
  '.fVS_2019':                      'Libre',
  '.fFALL_2019':                    'Mimikyu Costume',
  '.fADVENTURE_HAT_2020':           'Explorer',
  '.fWINTER_2020':                  'Winter Carnival',
  '.fGOFEST_2022':                  'Shaymin Scarf',
  '.fKARIYUSHI':                    'Kariyushi Shirt',
  '.fHORIZONS':                     "Cap's Hat",
  '.fWCS_2022':                     'Worlds 2022',
  '.fWCS_2023':                     'Worlds 2023',
  '.fWCS_2024':                     'Worlds 2024',
  '.fWCS_2025':                     'Worlds 2025',
  '.fGOTOUR_2024_A':                "Lucas's Hat",
  '.fGOTOUR_2024_A_02':             "Dawn's Hat",
  '.fGOTOUR_2024_B':                "Rei's Cap",
  '.fGOTOUR_2024_B_02':             "Akari's Kerchief",
  '.fGOTOUR_2025_A':                "Hilbert's Hat",
  '.fGOTOUR_2025_A_02':             "Hilda's Hat",
  '.fGOTOUR_2025_B':                "Nate's Visor",
  '.fGOTOUR_2025_B_02':             "Rosa's Visor",
  '.fGOFEST_2024_STIARA':           'Sun Crown',
  '.fGOFEST_2024_MTIARA':           'Moon Crown',
  '.fGOFEST_2025_GOGGLES_RED':      'Dapper (Red)',
  '.fGOFEST_2025_GOGGLES_BLUE':     'Dapper (Blue)',
  '.fGOFEST_2025_GOGGLES_YELLOW':   'Dapper (Yellow)',
  '.fGOFEST_2025_MONOCLE_RED':      'Monocle (Red)',
  '.fGOFEST_2025_MONOCLE_BLUE':     'Monocle (Blue)',
  '.fGOFEST_2025_MONOCLE_YELLOW':   'Monocle (Yellow)',
  '.fFLYING_01':                    'Flying (Green)',
  '.fFLYING_02':                    'Flying (Purple)',
  '.fFLYING_03':                    'Flying (Orange)',
  '.fFLYING_04':                    'Flying (Red)',
  '.fFLYING_5TH_ANNIV':             'Flying (5th Anniversary)',
  '.fFLYING_OKINAWA':               'Flying (Okinawa)',
  '.fDIWALI_2024':                  'Saree',
  '.fJEJU':                         'Berry Shirt (Blue)',
  '.fKURTA':                        'Kurta',
  '.fSUMMER_2023_A':                'Aquamarine Crown',
  '.fSUMMER_2023_B':                'Malachite Crown',
  '.fSUMMER_2023_C':                'Quartz Crown',
  '.fSUMMER_2023_D':                'Pyrite Crown',
  '.fSUMMER_2023_E':                'Amethyst Crown',
  '.fTSHIRT_01':                    'Berry Shirt (Green)',
  '.fTSHIRT_02':                    'Berry Shirt (Purple)',
  '.fTSHIRT_03':                    'Batik Shirt',
};

const EEVEE_LABELS = {
  '.cMAY_2023': 'Explorer Hat',
};
// Per-Pokemon costume label overrides: key = "id.formKey" (without leading dot)
const COSTUME_LABELS = new Map([
  // Bulbasaur family
  ['1.fFALL_2019', 'Shedinja'],
  // Charmander family
  ['4.fFALL_2019', 'Cubone'],
  // Squirtle family
  ['7.fFALL_2019', 'Yamask'],
  // Raichu
  ['26.cANNIVERSARY', 'Party Hat'],
  ['26.cCOSTUME_1', 'World Cap'],
  ['26.cCOSTUME_2', "New Year's Hat"],
  ['26.cFALL_2018', 'Fragment Hat'],
  ['26.cFEB_2019', 'Detective Hat'],
  ['26.cHALLOWEEN_2017', 'Witch Hat'],
  ['26.cHOLIDAY_2016', 'Santa Hat'],
  ['26.cNOVEMBER_2018', 'Flower Crown'],
  ['26.cONE_YEAR_ANNIVERSARY', 'Original Cap'],
  ['26.cPI', 'Detective Hat 2023'],
  ['26.cSPRING_2023', 'Cherry Blossom'],
  ['26.cSUMMER_2018', 'Summer Hat'],
  ['26.cWINTER_2018', 'Beanie'],
  // Vulpix / Ninetales
  ['37.cFALL_2022', 'Spooky Festival'],
  ['38.cFALL_2022', 'Spooky Festival'],
  // Diglett / Dugtrio
  ['50.cFALL_2022', 'Fashionable'],
  ['51.cFALL_2022', 'Fashionable'],
  // Psyduck
  ['54.fSWIM_2025', 'Swim Ring'],
  ['54.cHOLIDAY_2023', 'Holiday Attire'],
  // Golduck
  ['55.cHOLIDAY_2023', 'Holiday Attire'],
  // Galarian Ponyta
  ['77.fGALARIAN.cGOFEST_2021_NOEVOLVE', 'Meloetta Hat'],
  // Slowpoke
  ['79.f2020', "New Year's"],
  ['79.cPI_NOEVOLVE', 'Detective Hat'],
  // Slowbro
  ['80.f2021', "New Year's"],
  // Gengar
  ['94.fCOSTUME_2020', 'Halloween'],
  ['94.cFALL_2022_NOEVOLVE', 'Spooky Festival'],
  ['94.cFALL_2023_NOEVOLVE', 'Tricks & Treats'],
  // Cubone / Marowak
  ['104.cFALL_2023', 'Cempasúchil Crown'],
  ['105.cFALL_2023', 'Cempasúchil Crown'],
  // Electabuzz
  ['125.cSPRING_2023_INSTINCT', 'Spark Accessory'],
  // Lapras
  ['131.fCOSTUME_2020', 'Scarf'],
  ['131.cSPRING_2023_MYSTIC', 'Blanche Accessory'],
  // Eevee
  ['133.fGOFEST_2024_MTIARA', 'Moon Crown'],
  ['133.fGOFEST_2024_STIARA', 'Sun Crown'],
  // Eevee family shared
  ['133.cHOLIDAY_2022', 'Holiday'],
  ['134.cHOLIDAY_2022', 'Holiday'],
  ['135.cHOLIDAY_2022', 'Holiday'],
  ['136.cHOLIDAY_2022', 'Holiday'],
  ['133.cSPRING_2023', 'Cherry Blossoms'],
  ['134.cSPRING_2023', 'Cherry Blossoms'],
  ['135.cSPRING_2023', 'Cherry Blossoms'],
  ['136.cSPRING_2023', 'Cherry Blossoms'],
  // Aerodactyl
  ['142.fSUMMER_2023', 'Satchel'],
  // Snorlax
  ['143.fWILDAREA_2024', 'Studded Jacket'],
  ['143.cGOFEST_2022_NOEVOLVE', 'Cowboy Hat'],
  ['143.cNIGHTCAP', 'Night Cap'],
  // Dragonite
  ['149.cFALL_2023', 'Fashionable'],
  // Mewtwo
  ['150.fA', 'Armored'],
  // Hoothoot / Noctowl
  ['163.cJAN_2022_NOEVOLVE', "New Year's"],
  ['164.cJAN_2022_NOEVOLVE', "New Year's"],
  // Pichu
  ['172.cANNIVERSARY', 'Party Hat'],
  ['172.cCOSTUME_2', "New Year's"],
  ['172.cHALLOWEEN_2017', 'Witch Hat'],
  ['172.cHOLIDAY_2016', 'Santa Hat'],
  ['172.cONE_YEAR_ANNIVERSARY', 'Original Cap'],
  ['172.cSPRING_2023', 'Cherry Blossom'],
  ['172.cSUMMER_2018', 'Summer Hat'],
  ['172.cWINTER_2018', 'Beanie'],
  // Togepi / Togetic / Togekiss
  ['175.cAPRIL_2020_NOEVOLVE', 'Flower Crown'],
  ['176.cAPRIL_2020_NOEVOLVE', 'Flower Crown'],
  ['468.cAPRIL_2020_NOEVOLVE', 'Flower Crown'],
  // Wooper / Quagsire
  ['194.cFALL_2023', 'Fashionable'],
  ['195.cFALL_2023', 'Fashionable'],
  // Espeon
  ['196.fGOFEST_2024_SSCARF', 'Day Scarf'],
  ['196.cHOLIDAY_2022', 'Holiday Hat'],
  ['196.cSPRING_2023', 'Cherry Blossom'],
  // Umbreon
  ['197.fGOFEST_2024_MSCARF', 'Night Scarf'],
  ['197.cHOLIDAY_2022', 'Holiday Hat'],
  ['197.cSPRING_2023', 'Cherry Blossom'],
  // Slowking
  ['199.f2022', "New Year's"],
  // Teddiursa / Ursaring
  ['216.cFALL_2025', 'Witch Hat'],
  ['217.cFALL_2025', 'Witch Hat'],
  // Delibird
  ['225.fWINTER_2020', 'Holiday Ribbon'],
  // Stantler
  ['234.cWINTER_2018', 'Christmas Bells'],
  // Smoochum
  ['238.cFALL_2020_NOEVOLVE', 'Fashionable'],
  // Elekid
  ['239.cSPRING_2023_INSTINCT', 'Spark Accessory'],
  // Lugia / Ho-Oh
  ['249.fS', 'Apex'],
  ['250.fS', 'Apex'],
  // Zigzagoon
  ['263.fGALARIAN.cGOFEST_2021_NOEVOLVE', 'Meloetta Hat'],
  // Kirlia
  ['281.cFALL_2020_NOEVOLVE', 'Fashionable'],
  // Gardevoir
  ['282.cGOFEST_2021_NOEVOLVE', 'Meloetta Hat'],
  // Slakoth / Vigoroth / Slaking
  ['287.cSUMMER_2024', 'Visor'],
  ['288.cSUMMER_2024', 'Visor'],
  ['289.cSUMMER_2024', 'Visor'],
  // Sableye
  ['302.fCOSTUME_2020', 'Litwick Costume'],
  // Flygon
  ['330.cGOFEST_2021_NOEVOLVE', 'Meloetta Hat'],
  // Duskull / Dusclops / Dusknoir
  ['355.cFALL_2022_NOEVOLVE', 'Cempasúchil Crown'],
  ['356.cFALL_2022_NOEVOLVE', 'Cempasúchil Crown'],
  ['477.cFALL_2022_NOEVOLVE', 'Cempasúchil Crown'],
  // Absol
  ['359.cFALL_2022_NOEVOLVE', 'Fashionable'],
  // Spheal
  ['363.cHOLIDAY_2021_NOEVOLVE', 'Holiday'],
  // Turtwig
  ['387.cGEMS_1_2021_NOEVOLVE', "Lucas's Hat"],
  ['387.cGEMS_2_2021_NOEVOLVE', "Dawn's Hat"],
  // Chimchar
  ['390.cGEMS_1_2021_NOEVOLVE', "Lucas's Hat"],
  ['390.cGEMS_2_2021_NOEVOLVE', "Dawn's Hat"],
  // Piplup
  ['393.cGEMS_1_2021_NOEVOLVE', "Lucas's Hat"],
  ['393.cGEMS_2_2021_NOEVOLVE', "Dawn's Hat"],
  ['393.cHALLOWEEN_2021_NOEVOLVE', 'Halloween Hat'],
  // Shinx
  ['403.cFALL_2020_NOEVOLVE', 'Fashionable'],
  // Drifblim
  ['426.cHALLOWEEN_2021_NOEVOLVE', 'Halloween Hat'],
  // Buneary / Lopunny
  ['427.cAPRIL_2020_NOEVOLVE', 'Flower Crown'],
  ['428.cAPRIL_2020_NOEVOLVE', 'Flower Crown'],
  // Croagunk / Toxicroak
  ['453.cFALL_2020_NOEVOLVE', 'Fashionable'],
  ['454.cFALL_2020_NOEVOLVE', 'Fashionable'],
  // Electivire
  ['466.cSPRING_2023_INSTINCT', 'Spark Accessory'],
  // Leafeon
  ['470.cHOLIDAY_2022', 'Holiday Hat'],
  ['470.cSPRING_2023', 'Cherry Blossom'],
  // Glaceon
  ['471.cHOLIDAY_2021_NOEVOLVE', 'Undersea Holiday'],
  ['471.cHOLIDAY_2022', 'Holiday Hat'],
  ['471.cSPRING_2023', 'Cherry Blossom'],
  // Cottonee / Whimsicott
  ['546.cSPRING_2024', 'Flower Crown'],
  ['547.cSPRING_2024', 'Flower Crown'],
  // Minccino / Cinccino
  ['572.cFASHION_2025', 'Fashionable'],
  ['573.cFASHION_2025', 'Fashionable'],
  // Cubchoo / Beartic
  ['613.cWINTER_2020', 'Holiday Ribbon'], ['613.fWINTER_2020', 'Holiday Ribbon'],
  ['614.cWINTER_2020', 'Holiday Ribbon'], ['614.fWINTER_2020', 'Holiday Ribbon'],
  // Froakie / Frogadier / Greninja
  ['656.cFALL_2024', 'Witch Hat'], ['656.fFALL_2024', 'Witch Hat'],
  ['657.cFALL_2024', 'Witch Hat'], ['657.fFALL_2024', 'Witch Hat'],
  ['658.cFALL_2024', 'Witch Hat'], ['658.fFALL_2024', 'Witch Hat'],
  // Sylveon
  ['700.cHOLIDAY_2022', 'Holiday Hat'],
  ['700.cSPRING_2023', 'Cherry Blossom'],
  // Dedenne
  ['702.cWINTER_2024', 'Holiday'], ['702.fWINTER_2024', 'Holiday'],
  // Wooloo / Dubwool
  ['831.cWINTER_2024', 'Holiday'], ['831.fWINTER_2024', 'Holiday'],
  ['832.cWINTER_2024', 'Holiday'], ['832.fWINTER_2024', 'Holiday'],
  // Falinks
  ['870.cGOFEST_2025_TRAIN_CONDUCTOR', 'Train'], ['870.fGOFEST_2025_TRAIN_CONDUCTOR', 'Train'],
  // Ursaluna
  ['901.cFALL_2025', 'Witch Hat'],
]);
// Shared costume labels that apply to any Pokemon with this key
const SHARED_COSTUME_LABELS = {
  '.cJAN_2020_NOEVOLVE': 'Party Hat',
  '.cSPRING_2020_NOEVOLVE': 'Visor',
  '.fCOPY_2019': 'Clone',
  '.cSUMMER_2018': 'Sunglasses',
  '.cFASHION_2021_NOEVOLVE': 'Fashionable',
  '.cROYAL_NOEVOLVE': 'Crown',
  '.cJAN_2024': 'Ribbon',
  '.cSPRING_2023_VALOR': 'Candela Accessory',
  '.cANNIVERSARY_2024': 'Party Hat',
  '.cNOVEMBER_2018': 'Flower Crown',
};
// Forms to hide from the selector (visually identical to normal, etc.)
const HIDDEN_FORMS = new Set([
  '150.cONE_YEAR_ANNIVERSARY',
  '487.fALTERED', // base sprite is already Altered form
  '492.fLAND',    // base sprite is already Land form
  '648.fARIA',    // base sprite is already Aria form
  '646.fBLACK',   // Black/White Kyurem cannot be traded
  '646.fWHITE',
  '681.fBLADE',   // Aegislash forms not distinct in GO
  '681.fSHIELD',
  '716.fNEUTRAL',  // Xerneas Neutral form not needed
  '800.fDAWN_WINGS', // Necrozma forms not available in GO
  '800.fDUSK_MANE',
  '877.fFULL_BELLY', // Morpeko: hide Full Belly and Hangry forms
  '877.fHANGRY',
  '888.fCROWNED_SWORD', // Zacian: single form only
  '888.fHERO',
  '889.fCROWNED_SHIELD', // Zamazenta: single form only
  '889.fHERO',
  '890.fETERNAMAX', // Eternatus: single form only
]);
function formatFormLabel(key, id) {
  if (!key) return 'Normal';
  if (id === 25 && PIKACHU_LABELS[key]) return PIKACHU_LABELS[key];
  if ([133,134,135,136,196,197,470,471,700].includes(id) && EEVEE_LABELS[key]) return EEVEE_LABELS[key];
  const specificLabel = COSTUME_LABELS.get(`${id}${key}`);
  if (specificLabel) return specificLabel;
  if (SHARED_COSTUME_LABELS[key]) return SHARED_COSTUME_LABELS[key];
  // For compound keys like .fGALARIAN.cGOFEST_2021_NOEVOLVE, use the last segment
  const segments = key.match(/\.[cf][^.]*/g) || [key];
  const last = segments[segments.length - 1];
  const type = last[1]; // 'c' = costume, 'f' = form variant
  let inner = last.slice(2); // strip leading '.c' or '.f'
  // Special Unown punctuation forms
  if (inner === 'UNOWN_EXCLAMATION_POINT') return '!';
  if (inner === 'UNOWN_QUESTION_MARK') return '?';
  inner = inner.replace(/_NOEVOLVE$/, '');
  inner = inner.replace(/_/g, ' ');
  inner = inner.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  if (type === 'f') {
    const regionMap = { 'Alola': 'Alolan', 'Galar': 'Galarian', 'Hisui': 'Hisuian', 'Paldea': 'Paldean' };
    return regionMap[inner] || inner;
  }
  return inner;
}

// Sort form/costume keys chronologically.
// Costumes with years are sorted by (year, month); costumes without a year
// but with a known named event (e.g. ANNIVERSARY) are anchored to their
// first occurrence year; anything else sorts last.
// For letter-form Pokemon (e.g. Unown), EXCLAMATION and QUESTION go to the end.
function compareFormKeys(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1; // Normal always first
  if (!b) return  1;

  const MONTH_ABBR  = { JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12 };
  const EVENT_MONTH = {
    ANNIVERSARY:7, VALENTINES:2, EASTER:4, SPRING:4,
    SUMMER:7, FALL:10, HALLOWEEN:10, CHRISTMAS:12, WINTER:12,
    GOFEST:7, GOTOUR:2, FASHION:9, CARNIVAL:2, APRIL:4,
  };

  function keyInfo(key) {
    // For compound keys like .fGALARIAN.cGOFEST_2021_NOEVOLVE, use the last segment
    const segments = key.match(/\.[cf][^.]*/g) || [key];
    const last = segments[segments.length - 1];
    const type  = last[1]; // 'c' or 'f'
    const inner = last.slice(2).replace(/_NOEVOLVE$/, '');
    const parts = inner.split('_');

    // Unown punctuation forms go last (actual PokeMiners key names)
    if (type === 'f' && (inner === 'UNOWN_EXCLAMATION_POINT' || inner === 'UNOWN_QUESTION_MARK')) {
      return { year: 9999, month: inner === 'UNOWN_EXCLAMATION_POINT' ? 0 : 1, name: inner };
    }
    // Non-costume forms: alphabetical
    if (type === 'f') return { year: 0, month: 0, name: inner };

    // Costume: extract year + approximate month
    const yearMatch = inner.match(/\b(20\d\d)\b/);
    if (yearMatch) {
      const year  = parseInt(yearMatch[1]);
      const month = MONTH_ABBR[parts[0]] ?? EVENT_MONTH[parts[0]] ?? 6;
      return { year, month, name: inner };
    }

    // No year in key — check for known named events anchored to a year
    if (parts[0] === 'ANNIVERSARY') return { year: 2017, month: 7,  name: inner };
    if (parts[0] === 'COSTUME')     return { year: 9998, month: 0,  name: inner }; // numbered, sort near-last
    return                                 { year: 9999, month: 0,  name: inner };
  }

  const ka = keyInfo(a);
  const kb = keyInfo(b);
  if (ka.year  !== kb.year)  return ka.year  - kb.year;
  if (ka.month !== kb.month) return ka.month - kb.month;
  return ka.name.localeCompare(kb.name);
}

async function fetchCostumeMap() {
  const cacheKey = 'pogo_costumes_v40';
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      for (const [id, variants] of Object.entries(data)) {
        costumeMap.set(parseInt(id), variants);
      }
      costumesLoaded = true;
      return;
    } catch (e) { console.warn('Costume cache parse failed:', e); }
  }

  // Use Git Trees API to navigate: master → Images/ → Pokemon/ → Addressable Assets/
  // This avoids the 1000-file limit of the Contents API
  const TREES_API = 'https://api.github.com/repos/PokeMiners/pogo_assets/git/trees';
  try {
    async function getTree(sha) {
      const r = await fetch(`${TREES_API}/${sha}`);
      if (!r.ok) throw new Error(`Tree ${sha} failed: ${r.status}`);
      return r.json();
    }

    const master = await getTree('master');
    const imagesNode = master.tree.find(n => n.path === 'Images' && n.type === 'tree');
    if (!imagesNode) throw new Error('Images/ not found');

    const images = await getTree(imagesNode.sha);
    const pokemonNode = images.tree.find(n => n.path === 'Pokemon' && n.type === 'tree');
    if (!pokemonNode) throw new Error('Pokemon/ not found');

    const pokemon = await getTree(pokemonNode.sha);
    const assetsNode = pokemon.tree.find(n => n.path === 'Addressable Assets' && n.type === 'tree');
    if (!assetsNode) throw new Error('Addressable Assets not found');

    const assets = await getTree(assetsNode.sha);

    // Parse all filenames into a raw map: id → Map<formKey, {hasShiny}>
    const FILE_RE = /^pm(\d+)((?:\.(?:c|f)[^.]+)+)?(\.s)?\.icon\.png$/;
    const raw = new Map();

    for (const item of assets.tree) {
      if (item.type !== 'blob') continue;
      const m = item.path.match(FILE_RE);
      if (!m) continue;
      const id = parseInt(m[1]);
      let formKey = m[2] || '';
      // Normalize inconsistent casing (e.g. .cMay_2023 → .cMAY_2023)
      if (formKey) formKey = formKey.replace(/(\.[cf])([^.]+)/g, (_, prefix, rest) => prefix + rest.toUpperCase());
      const isShiny = !!m[3];

      if (!raw.has(id)) raw.set(id, new Map());
      const forms = raw.get(id);
      if (!forms.has(formKey)) forms.set(formKey, { hasShiny: false });
      if (isShiny) forms.get(formKey).hasShiny = true;
    }

    // Build costumeMap: base form first, then sorted costumes/forms
    for (const [id, forms] of raw.entries()) {
      const variants = [];
      const BASE_LABEL_OVERRIDE = { 487: 'Altered', 492: 'Land', 648: 'Aria', 668: 'Male', 678: 'Male', 905: 'Incarnate', 916: 'Male' };
      const HIDE_BASE_FORM = new Set([854, 855]);
      if (forms.has('') && !HIDE_BASE_FORM.has(id)) {
        variants.push({ key: '', label: BASE_LABEL_OVERRIDE[id] || 'Normal', hasShiny: forms.get('').hasShiny });
      }
      const others = [...forms.entries()]
        .filter(([k]) => k !== '' && !(k.toUpperCase().includes('PRIMAL') && (id === 382 || id === 383)))
        .filter(([k]) => !forms.has(k + '_NOEVOLVE'))
        .filter(([k]) => !HIDDEN_FORMS.has(`${id}${k}`))
        .sort(([a], [b]) => compareFormKeys(a, b));
      for (const [key, { hasShiny }] of others) {
        variants.push({ key, label: formatFormLabel(key, id), hasShiny });
      }
      costumeMap.set(id, variants);
    }

    // Manual costume entries (not yet in PokeMiners)
    const MANUAL_COSTUMES = [
      { id: 216, key: '.cFALL_2025', hasShiny: true },
      { id: 217, key: '.cFALL_2025', hasShiny: true },
      { id: 901, key: '.cFALL_2025', hasShiny: true },
    ];
    for (const mc of MANUAL_COSTUMES) {
      const existing = costumeMap.get(mc.id) || [];
      if (!existing.some(v => v.key === mc.key)) {
        if (existing.length === 0) {
          existing.push({ key: '', label: 'Normal', hasShiny: true });
        }
        existing.push({ key: mc.key, label: formatFormLabel(mc.key, mc.id), hasShiny: mc.hasShiny });
        costumeMap.set(mc.id, existing);
      }
    }

    // Cache for this session
    const obj = {};
    for (const [id, variants] of costumeMap.entries()) obj[id] = variants;
    try { sessionStorage.setItem(cacheKey, JSON.stringify(obj)); } catch (e) { console.warn('Costume cache save failed:', e); }

  } catch (e) {
    console.warn('Costume data unavailable:', e.message);
  }
  costumesLoaded = true;
}

// ─────────────────────────────────────────────
// Fetch Pokémon list from PokéAPI
// ─────────────────────────────────────────────
async function fetchPokemon() {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON_ID}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    const POKE_NAME_OVERRIDE = { 29: 'nidoran\u2640', 32: 'nidoran\u2642', 386: 'deoxys', 487: 'giratina', 492: 'shaymin', 550: 'basculin', 641: 'tornadus', 642: 'thundurus', 645: 'landorus', 647: 'keldeo', 648: 'meloetta', 668: 'pyroar', 678: 'meowstic', 681: 'aegislash', 710: 'pumpkaboo', 711: 'gourgeist', 718: 'zygarde', 741: 'oricorio', 745: 'lycanroc', 746: 'wishiwashi', 774: 'minior', 778: 'mimikyu', 849: 'toxtricity', 875: 'eiscue', 876: 'indeedee', 877: 'morpeko', 892: 'urshifu', 902: 'basculegion', 905: 'enamorus', 916: 'oinkologne', 925: 'maushold', 978: 'tatsugiri' };
    state.all = data.results.map((p, i) => ({ id: i + 1, name: POKE_NAME_OVERRIDE[i + 1] || p.name }));
    loadLocalCache();
    applyFilter();
    loadFromURL();
    resolvePokemonLoaded();
  } catch (e) {
    document.getElementById('loading').innerHTML = '&#9888; Failed to load. Check your connection and refresh.';
    resolvePokemonLoaded();
  }
}

// ─────────────────────────────────────────────
// Filter & render picker
// ─────────────────────────────────────────────
function applyFilter() {
  const q    = document.getElementById('search').value.trim().toLowerCase();
  const gen  = parseInt(document.getElementById('gen-filter').value);
  const [gMin, gMax] = gen > 0 ? GEN_RANGES[gen - 1] : [1, Infinity];

  const results = [];
  for (const p of state.all) {
    if (!(p.id >= gMin && p.id <= gMax)) continue;
    if (!q) { results.push(p); continue; }
    if (p.name.includes(q) || String(p.id).includes(q)) { results.push(p); continue; }
    // Search form/costume labels — add individual form entries
    const variants = costumeMap.get(p.id);
    if (variants) {
      for (const v of variants) {
        if (v.key && v.label && v.label.toLowerCase().includes(q)) {
          results.push({ id: p.id, name: p.name, form: v.key, formLabel: v.label });
        }
      }
    }
  }
  state.filtered = results;
  renderPicker();
}

function renderPicker() {
  const grid = document.getElementById('pokemon-grid');
  grid.innerHTML = '';

  if (state.filtered.length === 0) {
    grid.innerHTML = '<div class="empty-msg">No Pokémon match your search.</div>';
    return;
  }

  const wantedIds = new Set(state.wanted.map(p => p.id));
  const tradeIds  = new Set(state.trade.map(p => p.id));

  const frag = document.createDocumentFragment();
  for (const p of state.filtered) {
    const inW = wantedIds.has(p.id);
    const inT = tradeIds.has(p.id);
    const inGO = GO_AVAILABLE.has(p.id);
    const isMythical = MYTHICAL_POKEMON.has(p.id);
    let cls = 'picker-card';
    if (!inGO && !isMythical) cls += ' not-go';
    else if (isMythical)      cls += ' mythical';
    else if (inW && inT) cls += ' in-both';
    else if (inW)   cls += ' in-wanted';
    else if (inT)   cls += ' in-trade';

    const isFormResult = !!p.form;
    const card = document.createElement('div');
    card.className = cls;
    card.dataset.id   = p.id;
    card.dataset.name = p.name;
    if (isFormResult) card.dataset.form = p.form;
    card.style.background = cardBg(p.id);
    card.innerHTML = `
      ${isMythical ? '<span class="mythical-tag">Mythical</span>' : ''}
      <div class="pnum">#${padId(p.id)}</div>
      <img loading="lazy" src="${spriteUrl(p.id, isFormResult ? p.form : '', false)}" alt="${escapeHtml(p.name)}" width="60" height="60">
      <div class="pname">${escapeHtml(isFormResult ? p.formLabel : p.name)}</div>
    `;
    const img = card.querySelector('img');
    if (isFormResult) {
      img.onerror = () => { img.onerror = null; img.src = `${HOME_BASE}/${p.id}.png`; };
    } else {
      spriteWithFallback(img, p.id, false);
    }
    if (!inGO || isMythical) { frag.appendChild(card); continue; }
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    if (isFormResult) {
      card.addEventListener('click', e => {
        e.stopPropagation();
        state.pendingId   = p.id;
        state.pendingName = p.name;
        state.pendingForm = p.form;
        document.getElementById('ctx-name').textContent = `#${padId(p.id)} ${p.name}`;
        showCtxForms(p.id);
        // Pre-select the matching form
        document.querySelectorAll('#ctx-forms .ctx-form-thumb').forEach(t => {
          t.classList.toggle('selected', t.dataset.formKey === p.form);
        });
        positionCtxMenu(card);
      });
      card.addEventListener('dblclick', e => {
        e.stopPropagation();
        state.pendingId   = p.id;
        state.pendingName = p.name;
        state.pendingForm = p.form;
        addToList('wanted');
        closeCtx();
      });
    } else {
      card.addEventListener('click', onPickerClick);
      card.addEventListener('dblclick', e => {
        e.stopPropagation();
        state.pendingId   = p.id;
        state.pendingName = p.name;
        state.pendingForm = '';
        addToList('wanted');
        closeCtx();
      });
    }
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

function updatePickerHighlights() {
  const grid = document.getElementById('pokemon-grid');
  const cards = grid.querySelectorAll('.picker-card');
  if (cards.length === 0) return;
  const wantedIds = new Set(state.wanted.map(p => p.id));
  const tradeIds  = new Set(state.trade.map(p => p.id));
  for (const card of cards) {
    const id = parseInt(card.dataset.id);
    if (!GO_AVAILABLE.has(id) || MYTHICAL_POKEMON.has(id)) continue;
    const inW = wantedIds.has(id);
    const inT = tradeIds.has(id);
    card.classList.toggle('in-wanted', inW && !inT);
    card.classList.toggle('in-trade',  inT && !inW);
    card.classList.toggle('in-both',   inW && inT);
  }
}

// ─────────────────────────────────────────────
// Context menu
// ─────────────────────────────────────────────
const ctxMenu = document.getElementById('ctx-menu');

function positionCtxMenu(anchorEl) {
  ctxMenu.style.display = 'block';
  if (window.innerWidth <= 600) {
    ctxMenu.style.left = '';
    ctxMenu.style.top  = '';
  } else {
    ctxMenu.style.left = '-9999px';
    ctxMenu.style.top  = '-9999px';
    requestAnimationFrame(() => {
      const rect = anchorEl.getBoundingClientRect();
      const mW   = ctxMenu.offsetWidth;
      const mH   = ctxMenu.offsetHeight;
      let left = rect.left;
      let top  = rect.bottom + 5;
      if (left + mW > window.innerWidth)  left = window.innerWidth - mW - 8;
      if (top  + mH > window.innerHeight) top  = rect.top - mH - 5;
      ctxMenu.style.left = `${Math.max(4, left)}px`;
      ctxMenu.style.top  = `${Math.max(4, top)}px`;
    });
  }
}

function showCtxForms(id) {
  const container = document.getElementById('ctx-forms');

  if (!costumesLoaded) {
    container.style.display = 'flex';
    container.innerHTML = '<div class="ctx-forms-loading"><span class="spinner" style="width:12px;height:12px;border-width:2px;margin:0"></span>&nbsp;Loading variants…</div>';
    return;
  }

  const raw = costumeMap.get(id);
  const variants = raw ? raw.filter(v => !v.key.startsWith('.fMEGA') && !v.key.includes('PRIMAL') && !((id === 380 || id === 381) && v.key === '.fS')) : null;
  if (!variants || variants.length <= 1) {
    // On mobile, show a single normal-form thumb with swipe support
    if (window.innerWidth <= 600) {
      container.classList.remove('two-col');
      container.style.display = 'flex';
      ctxMenu.classList.remove('wide');
      container.innerHTML = '';
      const hint = document.createElement('div');
      hint.className = 'swipe-instruction';
      hint.innerHTML = '<span class="swipe-left">&larr; Wanted</span><span class="swipe-dot">&middot;</span><span class="swipe-right">Trade &rarr;</span>';
      container.appendChild(hint);
      const thumb = document.createElement('div');
      thumb.className = 'ctx-form-thumb selected';
      thumb.dataset.formKey = '';
      const img = document.createElement('img');
      img.src = spriteUrl(id, '', false);
      img.alt = 'Normal';
      img.width = 44; img.height = 44;
      spriteWithFallback(img, id, false);
      const label = document.createElement('div');
      label.className = 'form-label';
      label.textContent = 'Normal';
      thumb.appendChild(img);
      thumb.appendChild(label);
      attachFormSwipe(thumb, '');
      container.appendChild(thumb);
      return;
    }
    container.style.display = 'none';
    return;
  }

  const twoCol = id === 25;
  container.classList.toggle('two-col', twoCol);
  container.style.display = twoCol ? 'grid' : 'flex';
  ctxMenu.classList.toggle('wide', twoCol);
  container.innerHTML = '';

  // Add swipe instruction banner on mobile
  if (window.innerWidth <= 600) {
    const hint = document.createElement('div');
    hint.className = 'swipe-instruction';
    hint.innerHTML = '<span class="swipe-left">&larr; Wanted</span><span class="swipe-dot">&middot;</span><span class="swipe-right">Trade &rarr;</span>';
    container.appendChild(hint);
  }

  for (const v of variants) {
    const thumb = document.createElement('div');
    thumb.className = `ctx-form-thumb${v.key === state.pendingForm ? ' selected' : ''}`;
    thumb.dataset.formKey = v.key;

    const img = document.createElement('img');
    img.src    = spriteUrl(id, v.key, false);
    img.alt    = v.label;
    img.width  = 44;
    img.height = 44;
    img.onerror = () => { img.onerror = null; img.src = `${HOME_BASE}/${id}.png`; };

    const label = document.createElement('div');
    label.className   = 'form-label';
    label.textContent = v.label;

    thumb.appendChild(img);
    thumb.appendChild(label);
    thumb.addEventListener('click', e => {
      e.stopPropagation();
      state.pendingForm = v.key;
      container.querySelectorAll('.ctx-form-thumb').forEach(t => {
        t.classList.toggle('selected', t.dataset.formKey === v.key);
      });
    });
    thumb.addEventListener('dblclick', e => {
      e.stopPropagation();
      state.pendingForm = v.key;
      addToList('wanted');
      closeCtx();
    });
    attachFormSwipe(thumb, v.key);
    container.appendChild(thumb);
  }
}

function onPickerClick(e) {
  e.stopPropagation();
  const card = e.currentTarget;
  const clickedId = parseInt(card.dataset.id);
  if (ctxMenu.style.display === 'block' && state.pendingId === clickedId) {
    closeCtx();
    return;
  }
  state.pendingId   = clickedId;
  state.pendingName = card.dataset.name;
  state.pendingForm = '';
  document.getElementById('ctx-name').textContent = `#${padId(state.pendingId)} ${state.pendingName}`;

  showCtxForms(state.pendingId);

  positionCtxMenu(card);
}

document.getElementById('ctx-wanted').addEventListener('click', () => {
  addToList('wanted');
  closeCtx();
});
document.getElementById('ctx-trade').addEventListener('click', () => {
  addToList('trade');
  closeCtx();
});

document.addEventListener('click', e => {
  if (!ctxMenu.contains(e.target)) closeCtx();
});
document.getElementById('pokemon-grid').addEventListener('scroll', () => closeCtx(), { passive: true });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (bgPickerOverlay.classList.contains('open')) { closeBgPicker(); return; }
    if (ctxMenu.style.display === 'block') { closeCtx(); return; }
    if (settingsPanel.classList.contains('open')) { closeSettings(); return; }
    if (authModal.classList.contains('open')) { closeAuthModal(); return; }
  }
});

function closeCtx() {
  ctxMenu.style.display = 'none';
  ctxMenu.style.left = '';
  ctxMenu.style.top = '';
  ctxMenu.classList.remove('wide');
}

// ─────────────────────────────────────────────
// List management
// ─────────────────────────────────────────────
function addToList(list) {
  if (!state.pendingId) return;
  const arr  = state[list];
  const form = state.pendingForm;
  arr.push({ id: state.pendingId, name: state.pendingName, shiny: false, bg: '', dynamax: false, purified: false, size: '', form });
  renderList(list);
  updatePickerHighlights();
  scheduleAutoSave();
}

function removeFromList(list, idx) {
  state[list].splice(idx, 1);
  renderList(list);
  updatePickerHighlights();
  scheduleAutoSave();
}

function toggleShiny(list, idx) {
  const entry = state[list][idx];
  if (entry) {
    entry.shiny = !entry.shiny;
    renderList(list);
    scheduleAutoSave();
  }
}

function togglePurified(list, idx) {
  const entry = state[list][idx];
  if (entry) {
    entry.purified = !entry.purified;
    if (entry.purified) {
      entry.dynamax = false;
      if (entry.bg && !canPurifyWithBg(entry.id, entry.bg)) entry.bg = '';
    }
    renderList(list);
    scheduleAutoSave();
  }
}

function isGigantamax(form) {
  return form && (form.includes('GIGANTAMAX') || form.includes('GMAX'));
}

function toggleDynamax(list, idx) {
  const entry = state[list][idx];
  if (entry) {
    entry.dynamax = !entry.dynamax;
    if (entry.dynamax) {
      entry.purified = false;
      if (entry.bg && entry.bg !== 'darkskies') entry.bg = '';
    }
    renderList(list);
    scheduleAutoSave();
  }
}

const CITY_SAFARI_SLUGS = new Set(['citysafaribangkok','citysafariamsterdam','citysafarivalencia','citysafaricancun','citysafarivancouver','citysafarisingapore','citysafarimumbai','citysafarimilan','citysafarisantiago','citysafarisydney','citysafarimiami','citysafaribuenosaires','citysafariseoul','citysafaribarcelona','citysafarimexicocity','citysafaritainan','citysafarihongkong','citysafarisaopaulo']);
const BG_FORM_RESTRICT = {'.fJEJU': ['pokemongoatjejuisland'], '.cMAY_2023': [...CITY_SAFARI_SLUGS]};
// Backgrounds that should ONLY appear for specific costume forms
const BG_SLUG_FORM_ONLY = new Map([...CITY_SAFARI_SLUGS].map(s => [s, '.cMAY_2023']));
function toggleBg(list, idx) {
  const entry = state[list][idx];
  if (!entry) return;
  let available = BG_MAP.get(entry.id);
  if (!available || available.length === 0) return;
  const form = entry.form || '';
  if (isGigantamax(form) || entry.dynamax) {
    available = available.filter(bg => bg.slug === 'darkskies');
  } else {
    const allowed = BG_FORM_RESTRICT[form];
    if (allowed) available = available.filter(bg => allowed.includes(bg.slug));
    else available = available.filter(bg => !BG_SLUG_FORM_ONLY.has(bg.slug));
  }
  if (available.length === 0) return;
  openBgPicker(list, idx, available);
}

// ── Elite TM / Exclusive moves modal ──
const etmOverlay = document.getElementById('etm-overlay');
const etmModal   = document.getElementById('etm-modal');
const etmBody    = document.getElementById('etm-body');
// ── Size modal ──
let sizeState = null; // { list, idx }
const sizeOverlay = document.getElementById('size-modal-overlay');
const sizeModal = document.getElementById('size-modal');

function openSizeModal(list, idx) {
  const entry = state[list][idx];
  sizeState = { list, idx };
  document.getElementById('size-modal-title').textContent = `${entry.name.charAt(0).toUpperCase() + entry.name.slice(1)} — Size`;
  document.getElementById('size-modal-xxs').className = 'size-modal-btn' + (entry.size === 'XXS' ? ' active' : '');
  document.getElementById('size-modal-xxl').className = 'size-modal-btn' + (entry.size === 'XXL' ? ' active' : '');
  sizeOverlay.style.display = '';
  sizeModal.style.display = '';
  sizeOverlay.classList.add('open');
  sizeModal.classList.add('open');
}

function closeSizeModal() {
  sizeOverlay.classList.remove('open');
  sizeModal.classList.remove('open');
  sizeOverlay.style.display = 'none';
  sizeModal.style.display = 'none';
  sizeState = null;
}

function setSize(size) {
  if (!sizeState) return;
  const list = sizeState.list;
  const entry = state[list][sizeState.idx];
  entry.size = entry.size === size ? '' : size;
  closeSizeModal();
  renderList(list);
  scheduleAutoSave();
}

document.getElementById('size-modal-close').addEventListener('click', closeSizeModal);
sizeOverlay.addEventListener('click', closeSizeModal);
document.getElementById('size-modal-xxs').addEventListener('click', () => setSize('XXS'));
document.getElementById('size-modal-xxl').addEventListener('click', () => setSize('XXL'));


const etmTitle   = document.getElementById('etm-title');
let etmState = null; // { list, idx }

function openEtmModal(list, idx) {
  const entry = state[list][idx];
  if (!entry) return;
  const moves = getExclusiveMoves(entry.id, entry.form);
  if (!moves) return;
  etmState = { list, idx };
  const selected = new Set(entry.etm || []);
  const capName = entry.name.charAt(0).toUpperCase() + entry.name.slice(1);
  etmTitle.textContent = `${capName} — Exclusive Moves`;
  const MAX_FAST = 1;
  const MAX_CHARGED = 2;
  let html = '';
  if (moves.fast.length > 0) {
    html += `<div class="etm-section-label">Fast Moves <span class="etm-limit">(max ${MAX_FAST})</span></div>`;
    moves.fast.forEach(m => {
      html += `<button class="etm-move${selected.has(m) ? ' selected' : ''}" data-move="${escapeHtml(m)}" data-type="fast">${escapeHtml(m)}</button>`;
    });
  }
  if (moves.charged.length > 0) {
    html += `<div class="etm-section-label">Charged Moves <span class="etm-limit">(max ${MAX_CHARGED})</span></div>`;
    moves.charged.forEach(m => {
      html += `<button class="etm-move${selected.has(m) ? ' selected' : ''}" data-move="${escapeHtml(m)}" data-type="charged">${escapeHtml(m)}</button>`;
    });
  }
  etmBody.innerHTML = html;
  etmBody.querySelectorAll('.etm-move').forEach(btn => {
    btn.addEventListener('click', () => {
      const move = btn.dataset.move;
      const type = btn.dataset.type;
      if (!entry.etm) entry.etm = [];
      const i = entry.etm.indexOf(move);
      if (i >= 0) {
        entry.etm.splice(i, 1);
        btn.classList.remove('selected');
      } else {
        const max = type === 'fast' ? MAX_FAST : MAX_CHARGED;
        const allMoves = type === 'fast' ? moves.fast : moves.charged;
        const currentCount = entry.etm.filter(m => allMoves.includes(m)).length;
        if (currentCount >= max) return;
        entry.etm.push(move);
        btn.classList.add('selected');
      }
      renderList(list);
      scheduleAutoSave();
    });
  });
  etmOverlay.classList.add('open');
  etmModal.classList.add('open');
}

function closeEtmModal() {
  etmOverlay.classList.remove('open');
  etmModal.classList.remove('open');
  etmState = null;
}

etmOverlay.addEventListener('click', closeEtmModal);
document.getElementById('etm-close').addEventListener('click', closeEtmModal);

// ── Card detail modal (view-mode) ──
const cdOverlay = document.getElementById('card-detail-overlay');
const cdModal   = document.getElementById('card-detail-modal');
const cdBody    = document.getElementById('card-detail-body');

function openCardDetail(p) {
  const form = p.form || '';
  const formLabel = form ? formatFormLabel(form, p.id) : '';
  const showClouds = p.dynamax || isGigantamax(form);
  const capName = p.name.charAt(0).toUpperCase() + p.name.slice(1);
  let cls = 'cd-card';
  if (p.shiny) cls += ' shiny';
  if (p.purified) cls += ' purified';
  if (showClouds) cls += ' dynamax';
  if (p.bg) cls += ' has-bg';

  let html = `<div class="${cls}" style="background:${cardBg(p.id)}">`;
  if (p.bg) html += `<span class="bg-badge"><img src="${BG_SLUG_URL(p.bg)}" alt=""></span>`;
  if (showClouds) {
    html += `<div class="sprite-wrap"><div class="cloud-overlay"></div><img class="pokemon-sprite" src="${spriteUrl(p.id, form, p.shiny)}" alt="${escapeHtml(p.name)}" width="180" height="180"></div>`;
  } else {
    html += `<img class="pokemon-sprite" src="${spriteUrl(p.id, form, p.shiny)}" alt="${escapeHtml(p.name)}" width="180" height="180">`;
  }
  html += `<div class="cd-name">${escapeHtml(capName)}${p.size ? ` <span class="cd-size">${p.size}</span>` : ''}</div>`;
  if (formLabel) html += `<div class="cd-form">${escapeHtml(formLabel)}</div>`;

  // Indicators row (purified + shiny)
  const indicators = [];
  if (p.purified) indicators.push('<img src="Resources/purified.png?v=2" alt="Purified" title="Purified" style="width:24px;height:24px">');
  if (p.shiny) indicators.push('<span style="font-size:1.4rem;width:26px;height:26px;color:#FFD700;filter:drop-shadow(0 0 2px rgba(255,215,0,0.6))" title="Shiny">&#10024;</span>');
  if (p.etm && p.etm.length > 0) indicators.push(`<img src="Resources/GO_Elite_Charged_TM.png" alt="Elite TM" title="${escapeHtml(p.etm.join(', '))}" style="width:28px;height:28px">`);
  if (indicators.length > 0) html += `<div class="cd-indicators">${indicators.join('')}</div>`;

  // Moves
  if (p.etm && p.etm.length > 0) {
    const moves = getExclusiveMoves(p.id, form);
    if (moves) {
      const fastMoves = p.etm.filter(m => moves.fast.includes(m));
      const chargedMoves = p.etm.filter(m => moves.charged.includes(m));
      html += '<div class="cd-moves">';
      if (fastMoves.length > 0) {
        html += '<div class="cd-move-label">Fast Move</div>';
        fastMoves.forEach(m => { html += `<div class="cd-move-name">${escapeHtml(m)}</div>`; });
      }
      if (chargedMoves.length > 0) {
        html += `<div class="cd-move-label">Charged Move${chargedMoves.length > 1 ? 's' : ''}</div>`;
        chargedMoves.forEach(m => { html += `<div class="cd-move-name">${escapeHtml(m)}</div>`; });
      }
      html += '</div>';
    }
  }

  html += '</div>';
  cdBody.innerHTML = html;
  const cdSprite = cdBody.querySelector('.sprite-wrap img, img.pokemon-sprite');
  if (cdSprite) spriteWithFallback(cdSprite, p.id, p.shiny);
  cdOverlay.classList.add('open');
  cdModal.classList.add('open');
}

function closeCardDetail() {
  cdOverlay.classList.remove('open');
  cdModal.classList.remove('open');
}

cdOverlay.addEventListener('click', closeCardDetail);
document.getElementById('card-detail-close').addEventListener('click', closeCardDetail);

// ── Background picker ──
const bgPickerOverlay = document.getElementById('bg-picker-overlay');
const bgPickerEl      = document.getElementById('bg-picker');
const bgPickerGrid    = document.getElementById('bp-grid');
const bgPickerSearch  = document.getElementById('bp-search');
const bgPickerRemove  = document.getElementById('bp-remove');
const bgPickerTitle   = document.getElementById('bp-title');
let bgPickerState = null; // { list, idx }

function openBgPicker(list, idx, available) {
  bgPickerState = { list, idx, available };
  const entry = state[list][idx];
  const currentSlug = entry ? entry.bg : '';
  bgPickerTitle.textContent = 'Select Background';
  bgPickerSearch.value = '';
  bgPickerRemove.style.display = currentSlug ? 'block' : 'none';
  renderBgPickerGrid(available, currentSlug, '');
  bgPickerOverlay.classList.add('open');
  bgPickerEl.classList.add('open');
  if (window.innerWidth > 600) bgPickerSearch.focus();
}

function renderBgPickerGrid(available, currentSlug, filter) {
  bgPickerGrid.innerHTML = '';
  const lf = filter.toLowerCase();
  for (const bg of available) {
    if (lf && !bg.name.toLowerCase().includes(lf)) continue;
    const card = document.createElement('div');
    card.className = `bp-card${bg.slug === currentSlug ? ' selected' : ''}`;
    card.innerHTML = `<img src="${BG_SLUG_URL(bg.slug)}" alt="${escapeHtml(bg.name)}" loading="lazy"><div class="bp-name" title="${escapeHtml(bg.name)}">${escapeHtml(bg.name)}</div>`;
    card.addEventListener('click', () => selectBg(bg.slug));
    bgPickerGrid.appendChild(card);
  }
}

function selectBg(slug) {
  if (!bgPickerState) return;
  const { list, idx } = bgPickerState;
  const entry = state[list][idx];
  if (entry) {
    entry.bg = slug;
    if (slug && slug !== 'darkskies') entry.dynamax = false;
    if (slug && entry.purified && !canPurifyWithBg(entry.id, slug)) entry.purified = false;
    renderList(list);
    scheduleAutoSave();
  }
  closeBgPicker();
}

function closeBgPicker() {
  bgPickerOverlay.classList.remove('open');
  bgPickerEl.classList.remove('open');
  bgPickerState = null;
}

bgPickerOverlay.addEventListener('click', closeBgPicker);
document.getElementById('bp-close').addEventListener('click', closeBgPicker);
bgPickerSearch.addEventListener('input', () => {
  if (!bgPickerState) return;
  const available = bgPickerState.available || [];
  const entry = state[bgPickerState.list] && state[bgPickerState.list][bgPickerState.idx];
  renderBgPickerGrid(available, entry ? entry.bg : '', bgPickerSearch.value);
});
bgPickerRemove.addEventListener('click', () => {
  if (!bgPickerState) return;
  const { list, idx } = bgPickerState;
  const entry = state[list] && state[list][idx];
  if (entry) {
    entry.bg = '';
    renderList(list);
    scheduleAutoSave();
  }
  closeBgPicker();
});

function clearList(list) {
  state[list] = [];
  renderList(list);
  updatePickerHighlights();
  scheduleAutoSave();
}

const BG_COSTUME_EXCEPTIONS = new Set(['.fJEJU', '.cMAY_2023']);

function renderList(list) {
  const grid  = document.getElementById(`${list}-grid`);
  const count = document.getElementById(`${list}-count`);
  const arr   = state[list];
  count.textContent = arr.length;
  const tabCount = document.getElementById(`tab-${list === 'wanted' ? 'wanted' : 'trade'}-count`);
  if (tabCount) tabCount.textContent = arr.length;

  if (arr.length === 0) {
    grid.innerHTML = '<div class="empty-msg">Click a Pokémon above to add it here</div>';
    document.getElementById(`${list}-section`).style.maxHeight = '';
    return;
  }

  grid.innerHTML = '';
  for (let i = 0; i < arr.length; i++) {
    const p = arr[i];
    const form      = p.form || '';
    const formLabel = form ? formatFormLabel(form, p.id) : '';
    const card = document.createElement('div');
    const showClouds = p.dynamax || isGigantamax(form);
    card.className = `list-card${p.shiny ? ' shiny' : ''}${p.purified ? ' purified' : ''}${showClouds ? ' dynamax' : ''}${isGigantamax(form) ? ' gigantamax' : ''}${p.bg ? ' has-bg' : ''}`;
    card.style.background = cardBg(p.id);
    const isCostume = form.startsWith('.c') || form.includes('.c') || !!PIKACHU_LABELS[form];
    const isGmax = isGigantamax(form);
    const bgAvail = BG_MAP.get(p.id);
    const hasDarkSkies = bgAvail && bgAvail.some(bg => bg.slug === 'darkskies');
    const hasBg = isGmax ? hasDarkSkies : (BG_POKEMON.has(p.id) && (!isCostume || BG_COSTUME_EXCEPTIONS.has(form)));
    const hasDynamax = !isGigantamax(form) && DYNAMAX_POKEMON.has(p.id);
    const formId = `${p.id}${form}`;
    const canPurify = !isGigantamax(form) && SHADOW_POKEMON.has(p.id) && !NO_PURIFY_FORMS.has(formId) && (!form || !form.startsWith('.c') || SHADOW_COSTUMES.has(formId));
    const hasEtm = !!getExclusiveMoves(p.id, form);
    const etmActive = p.etm && p.etm.length > 0;
    card.innerHTML = `
      ${p.bg ? `<span class="bg-badge"><img src="${BG_SLUG_URL(p.bg)}" alt=""></span>` : ''}
      ${showClouds ? `<div class="sprite-wrap"><div class="cloud-overlay"></div><img class="pokemon-sprite" src="${spriteUrl(p.id, form, p.shiny)}" alt="${escapeHtml(p.name)}" width="96" height="96"></div>` : `<img class="pokemon-sprite" src="${spriteUrl(p.id, form, p.shiny)}" alt="${escapeHtml(p.name)}" width="96" height="96">`}
      <div class="card-label-area">
        <div class="pname">${escapeHtml(p.name)}</div>
        ${formLabel ? `<div class="form-badge">${escapeHtml(formLabel)}</div>` : ''}
      </div>
      ${canPurify ? `<button class="purified-btn${p.purified ? ' active' : ''}" title="Purified"><img src="Resources/purified.png?v=2" alt="Purified"></button>` : ''}
      ${!NO_SHINY_FORMS.has(formId) ? `<button class="shiny-btn${p.shiny ? ' active' : ''}" title="${p.shiny ? 'Remove shiny' : 'Mark shiny'}">&#10024;</button>` : ''}
      ${hasDynamax ? `<button class="dynamax-btn${p.dynamax ? ' active' : ''}" title="${p.dynamax ? 'Remove Dynamax' : 'Mark Dynamax'}">&#9729;</button>` : ''}
      <button class="size-btn${p.size ? ' active' : ''}" title="Size (XXS/XXL)">${p.size ? p.size : '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M1 23L23 1v22H1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 23l0-4M11 23l0-8M15 23l0-4M19 23l0-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'}</button>
      ${hasEtm ? `<button class="etm-btn${etmActive ? ' active' : ''}" title="Exclusive moves"><img src="Resources/GO_Elite_Charged_TM.png" alt="Elite TM"></button>` : ''}
      ${p.size ? `<span class="size-indicator" title="${p.size}">${p.size}</span>` : ''}
      ${p.purified ? `<span class="purified-indicator" title="Purified"><img src="Resources/purified.png?v=2" alt="Purified"></span>` : ''}
      ${p.shiny ? `<span class="shiny-indicator" title="Shiny">&#10024;</span>` : ''}
      ${etmActive ? `<span class="etm-indicator" title="${escapeHtml(p.etm.join(', '))}"><img src="Resources/GO_Elite_Charged_TM.png" alt="Elite TM"></span>` : ''}
      ${hasBg ? `<button class="bg-btn${p.bg ? ' active' : ''}" title="Select background"><span class="bg-icon"></span></button>` : ''}
      <button class="remove-btn" title="Remove">&#10005;</button>
    `;
    spriteWithFallback(card.querySelector('.sprite-wrap img, img.pokemon-sprite'), p.id, p.shiny);
    const idx = i;
    const purBtn = card.querySelector('.purified-btn');
    if (purBtn) purBtn.addEventListener('click', () => togglePurified(list, idx));
    const shinyBtn = card.querySelector('.shiny-btn');
    if (shinyBtn) shinyBtn.addEventListener('click', () => toggleShiny(list, idx));
    const dynBtn = card.querySelector('.dynamax-btn');
    if (dynBtn) dynBtn.addEventListener('click', () => toggleDynamax(list, idx));
    const sizeBtn = card.querySelector('.size-btn');
    if (sizeBtn) sizeBtn.addEventListener('click', () => openSizeModal(list, idx));
    const etmBtn = card.querySelector('.etm-btn');
    if (etmBtn) etmBtn.addEventListener('click', () => openEtmModal(list, idx));
    const bgBtn = card.querySelector('.bg-btn');
    if (bgBtn) bgBtn.addEventListener('click', () => toggleBg(list, idx));
    card.querySelector('.remove-btn').addEventListener('click', () => removeFromList(list, idx));
    if (!viewMode) {
      card.addEventListener('dblclick', e => {
        e.stopPropagation();
        if (e.target.closest('button')) return;
        if (viewMode) return;
        const dest = list === 'wanted' ? 'trade' : 'wanted';
        state[dest].push({ ...p });
        state[list].splice(idx, 1);
        renderList(list);
        renderList(dest);
        updatePickerHighlights();
        scheduleAutoSave();
      });
    }
    card.addEventListener('click', e => {
      if (!viewMode) return;
      if (e.target.closest('button')) return;
      openCardDetail(p);
    });
    grid.appendChild(card);
  }

  const section = document.getElementById(`${list}-section`);
  const isMobileExpanded = document.body.classList.contains('lists-expanded');
  if (document.body.classList.contains('view-mode') || isMobileExpanded) {
    section.style.maxHeight = '';
  } else if (arr.length > 5) {
    requestAnimationFrame(() => {
      const firstCard = grid.querySelector('.list-card');
      const header = section.querySelector('.list-header');
      if (firstCard) {
        const cardH   = firstCard.offsetHeight;
        const headerH = header ? header.offsetHeight : 0;
        section.style.maxHeight = `${headerH + 2 * cardH + 9 + 20}px`;
      }
    });
  } else {
    section.style.maxHeight = '';
  }
}

// ─────────────────────────────────────────────
// URL sync
// form '.cFALL_2018' → encoded as '-cFALL_2018' (strip leading dot, prefix with -)
// ─────────────────────────────────────────────
function encodeList(arr) {
  return arr.map(p => {
    const s = p.shiny ? 's' : '';
    const b = p.bg ? 'b' : '';
    const d = p.dynamax ? 'd' : '';
    const pu = p.purified ? 'p' : '';
    const sz = p.size === 'XXS' ? 'x' : p.size === 'XXL' ? 'X' : '';
    const f = p.form ? `-${p.form.slice(1)}` : '';
    const bgSlug = p.bg ? `~${p.bg}` : '';
    // Encode ETM moves as indices: !0.2 means moves at index 0 and 2
    let etmPart = '';
    if (p.etm && p.etm.length > 0) {
      const moves = getExclusiveMoves(p.id, p.form);
      if (moves) {
        const allMoves = [...moves.fast, ...moves.charged];
        const indices = p.etm.map(m => allMoves.indexOf(m)).filter(i => i >= 0);
        if (indices.length > 0) etmPart = `!${indices.join('.')}`;
      }
    }
    return `${p.id}${s}${b}${d}${pu}${sz}${etmPart}${f}${bgSlug}`;
  }).join(',');
}

function decodeList(str, allMap) {
  if (!str) return [];
  return str.split(',').flatMap(s => {
    // Extract bg slug (after ~)
    const tilde = s.indexOf('~');
    let bgSlug = '';
    if (tilde >= 0) { bgSlug = s.slice(tilde + 1); s = s.slice(0, tilde); }
    const dash = s.indexOf('-');
    let idPart       = dash >= 0 ? s.slice(0, dash) : s;
    const formSuffix = dash >= 0 ? s.slice(dash + 1) : '';
    // Extract ETM indices (after !)
    let etmIndices = '';
    const bang = idPart.indexOf('!');
    if (bang >= 0) { etmIndices = idPart.slice(bang + 1); idPart = idPart.slice(0, bang); }
    let size = '';
    if (idPart.endsWith('x')) { size = 'XXS'; idPart = idPart.slice(0, -1); }
    else if (idPart.endsWith('X')) { size = 'XXL'; idPart = idPart.slice(0, -1); }
    const purified = idPart.endsWith('p');
    if (purified) idPart = idPart.slice(0, -1);
    const dynamax = idPart.endsWith('d');
    if (dynamax) idPart = idPart.slice(0, -1);
    const hasBFlag = idPart.endsWith('b');
    if (hasBFlag) idPart = idPart.slice(0, -1);
    const shiny = idPart.endsWith('s');
    if (shiny) idPart = idPart.slice(0, -1);
    const id = parseInt(idPart);
    if (isNaN(id)) return [];
    const name = allMap.get(id) || `#${id}`;
    const form = formSuffix ? `.${formSuffix}` : '';
    // bg slug from ~, or legacy b flag → first available bg
    let bg = bgSlug || '';
    if (!bg && hasBFlag) {
      const avail = BG_MAP.get(id);
      bg = avail && avail.length > 0 ? avail[0].slug : '';
    }
    // Decode ETM move indices to move names
    let etm = [];
    if (etmIndices) {
      const moves = getExclusiveMoves(id, form);
      if (moves) {
        const allMoves = [...moves.fast, ...moves.charged];
        etm = etmIndices.split('.').map(i => allMoves[parseInt(i)]).filter(Boolean);
      }
    }
    return [{ id, name, shiny, bg, dynamax, purified, size, form, etm }];
  });
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  // Shared link via Firestore doc ID
  const listId = params.get('list');
  if (listId) { loadSharedLink(listId); return; }

  // Legacy cloud share link
  const viewId = params.get('view');
  if (viewId) { loadSharedList(viewId); return; }

  // Cloud loading is handled by onAuthStateChanged — no action needed here
}

async function loadSharedLink(docId) {
  try {
    const doc = await db.collection('sharedLinks').doc(docId).get();
    if (!doc.exists) { showToast('Shared list not found'); return; }
    const data = doc.data();
    const allMap = new Map(state.all.map(p => [p.id, p.name]));
    state.wanted = decodeList(data.wanted, allMap);
    state.trade  = decodeList(data.trade, allMap);
    viewMode = true;
    renderList('wanted');
    renderList('trade');
    updatePickerHighlights();
    enterViewMode(data.pogoIgn || data.email || 'Shared List', data.listName || '');
  } catch (e) {
    showToast('Could not load shared list');
  }
}

// ─────────────────────────────────────────────
// Share
// ─────────────────────────────────────────────
let shareInProgress = false;
async function createShareLink() {
  if (!currentUser) { showToast('Sign in to share'); return null; }
  if (shareInProgress) return null;
  shareInProgress = true;
  try {
    const shareData = {
      wanted: encodeList(state.wanted),
      trade: encodeList(state.trade),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    const ign = pogoIgnDisplay.textContent;
    if (ign && ign !== '—') shareData.pogoIgn = ign;
    if (currentListName) shareData.listName = currentListName;
    const docRef = await db.collection('sharedLinks').add(shareData);
    return `${window.location.origin}${window.location.pathname}?list=${docRef.id}`;
  } catch (e) {
    showToast('Share failed: ' + e.message);
    return null;
  } finally {
    setTimeout(() => { shareInProgress = false; }, 3000);
  }
}

document.getElementById('open-shared-btn').addEventListener('click', async () => {
  const url = await createShareLink();
  if (url) window.open(url, '_blank');
});

document.getElementById('copy-link-btn').addEventListener('click', async () => {
  const url = await createShareLink();
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Share link copied!');
  } catch {
    prompt('Copy this share link:', url);
  }
});

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// ─────────────────────────────────────────────
// Event listeners
// ─────────────────────────────────────────────
let searchTimer;
document.getElementById('search').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applyFilter, 150);
});
document.getElementById('gen-filter').addEventListener('change', applyFilter);
document.getElementById('clear-wanted').addEventListener('click', () => {
  if (state.wanted.length === 0) return;
  openClearConfirm('Clear Wanted?', () => { clearList('wanted'); showToast('Wanted list cleared'); });
});
document.getElementById('clear-trade').addEventListener('click', () => {
  if (state.trade.length === 0) return;
  openClearConfirm('Clear Available?', () => { clearList('trade'); showToast('Available list cleared'); });
});
document.getElementById('clear-all-wanted').addEventListener('click', () => {
  if (state.wanted.length === 0 && state.trade.length === 0) return;
  openClearConfirm('Clear Wanted and Available?', () => { clearList('wanted'); clearList('trade'); showToast('All lists cleared'); });
});
document.getElementById('clear-all-trade').addEventListener('click', () => {
  if (state.wanted.length === 0 && state.trade.length === 0) return;
  openClearConfirm('Clear Wanted and Available?', () => { clearList('wanted'); clearList('trade'); showToast('All lists cleared'); });
});

// ── Clear modal ──
const clearModalOverlay = document.getElementById('clear-modal-overlay');
const clearModal = document.getElementById('clear-modal');
let clearConfirmCallback = null;

function showClearModal() {
  clearModalOverlay.style.display = '';
  clearModal.style.display = '';
  clearModalOverlay.classList.add('open');
  clearModal.classList.add('open');
}
function closeClearModal() {
  clearModalOverlay.classList.remove('open');
  clearModal.classList.remove('open');
  clearModalOverlay.style.display = 'none';
  clearModal.style.display = 'none';
  clearConfirmCallback = null;
}
function openClearConfirm(title, onConfirm) {
  document.getElementById('clear-modal-title').textContent = title;
  clearConfirmCallback = onConfirm;
  document.getElementById('clear-modal-select').style.display = 'none';
  document.getElementById('clear-modal-confirm').style.display = '';
  showClearModal();
}
function openClearSelect() {
  document.getElementById('clear-modal-title').textContent = 'Clear Lists';
  clearConfirmCallback = null;
  document.getElementById('clear-modal-select').style.display = '';
  document.getElementById('clear-modal-confirm').style.display = 'none';
  showClearModal();
}

document.getElementById('lists-clear-btn').addEventListener('click', () => {
  if (state.wanted.length === 0 && state.trade.length === 0) return;
  openClearSelect();
});
document.getElementById('clear-modal-close').addEventListener('click', closeClearModal);
document.getElementById('clear-modal-cancel').addEventListener('click', closeClearModal);
document.getElementById('clear-modal-select-cancel').addEventListener('click', closeClearModal);
clearModalOverlay.addEventListener('click', closeClearModal);
document.getElementById('clear-modal-ok').addEventListener('click', () => {
  if (clearConfirmCallback) clearConfirmCallback();
  closeClearModal();
});
document.getElementById('clear-modal-wanted').addEventListener('click', () => {
  if (state.wanted.length === 0) { showToast('Wanted list is empty'); closeClearModal(); return; }
  openClearConfirm('Clear Wanted?', () => { clearList('wanted'); showToast('Wanted list cleared'); });
});
document.getElementById('clear-modal-trade').addEventListener('click', () => {
  if (state.trade.length === 0) { showToast('Available list is empty'); closeClearModal(); return; }
  openClearConfirm('Clear Available?', () => { clearList('trade'); showToast('Available list cleared'); });
});
document.getElementById('clear-modal-all').addEventListener('click', () => {
  openClearConfirm('Clear Wanted and Available?', () => { clearList('wanted'); clearList('trade'); showToast('All lists cleared'); });
});

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
renderList('wanted');
renderList('trade');
fetchPokemon();
fetchTypeMap();       // runs in background, re-renders with type colors when ready
fetchCostumeMap();    // runs in background, populates costumeMap
fetchExclusiveMoves(); // loads exclusive move data for ETM button

// ─────────────────────────────────────────────
// Mobile swipe-to-add on form thumbnails
// ─────────────────────────────────────────────
function attachFormSwipe(thumb, formKey) {
  if (window.innerWidth > 600) return;
  const THRESHOLD = 40;
  let startX, startY, swiping = false, hintEl = null;

  thumb.addEventListener('touchstart', e => {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    swiping = false;
    thumb.querySelectorAll('.swipe-hint').forEach(h => h.remove());
  }, { passive: true });

  thumb.addEventListener('touchmove', e => {
    if (startX == null) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (!swiping && Math.abs(dy) > Math.abs(dx)) { startX = null; return; }
    if (Math.abs(dx) > 10) {
      swiping = true;
      e.preventDefault();
    }
    if (!swiping) return;
    thumb.classList.add('swiping');
    thumb.style.transform = `translateX(${dx * 0.5}px)`;
    thumb.style.opacity = Math.max(0.4, 1 - Math.abs(dx) / 150);

    if (!hintEl) {
      hintEl = document.createElement('div');
      thumb.appendChild(hintEl);
    }
    if (dx < -THRESHOLD) {
      hintEl.className = 'swipe-hint wanted-hint show';
      hintEl.textContent = 'WANTED';
    } else if (dx > THRESHOLD) {
      hintEl.className = 'swipe-hint trade-hint show';
      hintEl.textContent = 'TRADE';
    } else {
      hintEl.className = 'swipe-hint';
      hintEl.textContent = '';
    }
  }, { passive: false });

  thumb.addEventListener('touchend', e => {
    if (!swiping) { startX = null; hintEl = null; return; }
    const dx = e.changedTouches[0].clientX - startX;
    thumb.classList.remove('swiping');
    thumb.style.transform = '';
    thumb.style.opacity = '';
    if (hintEl) { hintEl.remove(); hintEl = null; }

    if (Math.abs(dx) >= THRESHOLD) {
      state.pendingForm = formKey;
      const list = dx < 0 ? 'wanted' : 'trade';
      addToList(list);
      closeCtx();
    }
    startX = null;
  }, { passive: true });

  thumb.addEventListener('touchcancel', () => {
    thumb.classList.remove('swiping');
    thumb.style.transform = '';
    thumb.style.opacity = '';
    if (hintEl) { hintEl.remove(); hintEl = null; }
    startX = null;
  }, { passive: true });
}

// ─────────────────────────────────────────────
// Mobile swipeable list tabs
// ─────────────────────────────────────────────
(function() {
  const tabs = document.querySelectorAll('.list-tab');
  const panels = document.getElementById('list-panels');
  if (!tabs.length || !panels) return;

  function setActiveTab(idx) {
    tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
  }

  tabs.forEach((tab, tabIdx) => {
    tab.addEventListener('click', () => {
      const childIdx = parseInt(tab.dataset.tab);
      const section = panels.children[childIdx];
      if (section) panels.scrollTo({ left: section.offsetLeft, behavior: 'instant' });
      setActiveTab(tabIdx);
    });
  });

  // Wanted is now first panel (index 0), no scroll needed on init

  // Detect swipe direction on touchend and update tab immediately
  let touchStartX = null;
  let lastTabIdx = 0;
  panels.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  panels.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    // If swiped far enough, predict which panel snap will land on
    if (Math.abs(dx) > 30) {
      const newIdx = dx < 0 ? 1 : 0; // swipe left → tab 1, swipe right → tab 0
      if (newIdx !== lastTabIdx) {
        lastTabIdx = newIdx;
        setActiveTab(newIdx);
      }
    }
  }, { passive: true });

  // Fallback: sync on scroll settle for tab clicks and edge cases
  panels.addEventListener('scroll', () => {
    const idx = panels.scrollLeft > panels.offsetWidth * 0.5 ? 1 : 0;
    if (idx !== lastTabIdx) {
      lastTabIdx = idx;
      setActiveTab(idx);
    }
  }, { passive: true });
})();

// ── Resize handle for view-mode mobile ──
(function() {
  const handle = document.getElementById('resize-handle');
  const panels = document.getElementById('list-panels');
  if (!handle || !panels) return;

  let dragging = false;
  let startY = 0;
  let startH = 0;
  const topSection = document.getElementById('wanted-section');

  function onStart(e) {
    if (!document.body.classList.contains('view-mode')) return;
    dragging = true;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startH = topSection.offsetHeight;
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = y - startY;
    const panelH = panels.offsetHeight - handle.offsetHeight;
    const newH = Math.max(80, Math.min(panelH - 80, startH + delta));
    topSection.style.height = newH + 'px';
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }

  handle.addEventListener('touchstart', onStart, { passive: true });
  handle.addEventListener('mousedown', onStart);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchend', onEnd);
  document.addEventListener('mouseup', onEnd);
})();

// ── Fix list section heights on mobile ──
// CSS flex cross-axis stretch doesn't reliably constrain height
// in horizontal scroll containers on mobile, so we set it via JS.
(function() {
  const panels = document.getElementById('list-panels');
  const tabs = document.getElementById('list-tabs');
  const btn = document.getElementById('lists-expand-btn');
  if (!panels || !tabs) return;
  const sections = panels.querySelectorAll('.list-section');
  let expanded = false;

  function fixHeights() {
    if (window.innerWidth > 600 || document.body.classList.contains('view-mode')) {
      panels.style.height = '';
      sections.forEach(s => s.style.height = '');
      return;
    }
    // Measure the actual height the flex layout gave #list-panels
    const h = panels.offsetHeight;
    if (h > 0) {
      sections.forEach(s => s.style.height = h + 'px');
    }
  }

  function applyExpanded() {
    const picker = document.getElementById('picker');
    if (expanded) {
      if (picker) picker.style.display = 'none';
      document.body.classList.add('lists-expanded');
    } else {
      if (picker) picker.style.display = '';
      document.body.classList.remove('lists-expanded');
    }
    requestAnimationFrame(() => requestAnimationFrame(fixHeights));
  }

  if (btn) {
    btn.addEventListener('click', () => {
      expanded = !expanded;
      applyExpanded();
    });
  }

  window.addEventListener('resize', fixHeights);
  requestAnimationFrame(fixHeights);
  window.addEventListener('load', () => requestAnimationFrame(fixHeights));
})();
