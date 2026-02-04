const PROFILE_LIST_KEY = 'vnrpg_profiles';
const PROFILE_PREFIX = 'vnrpg_profile_';
const ACTIVE_KEY = 'vnrpg_active_profile';

const defaultProfile = (name) => ({
  id: name,
  progress: null,
  state: null,
  endings: []
});

const safeStorage = () => {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

const loadProfiles = () => {
  const storage = safeStorage();
  if (!storage) return [];
  const raw = storage.getItem(PROFILE_LIST_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

const saveProfiles = (profiles) => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(PROFILE_LIST_KEY, JSON.stringify(profiles));
};

const setActiveProfile = (profile) => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(ACTIVE_KEY, profile);
};

const getActiveProfile = () => {
  const storage = safeStorage();
  if (!storage) return null;
  return storage.getItem(ACTIVE_KEY);
};

const ensureProfileRecord = (name) => {
  const storage = safeStorage();
  if (!storage) return;
  const key = `${PROFILE_PREFIX}${name}`;
  if (storage.getItem(key)) return;
  storage.setItem(key, JSON.stringify(defaultProfile(name)));
};

export const initLogin = (onReady) => {
  const overlay = document.getElementById('login-overlay');
  const form = document.getElementById('login-form');
  const input = document.getElementById('profile-name');
  const list = document.getElementById('profile-list');
  const current = getActiveProfile();

  const renderList = () => {
    list.innerHTML = '';
    const profiles = loadProfiles();
    profiles.forEach((profile) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'profile-button';
      button.textContent = profile;
      button.addEventListener('click', () => {
        ensureProfileRecord(profile);
        setActiveProfile(profile);
        overlay.classList.add('hidden');
        onReady(profile);
      });
      list.appendChild(button);
    });
  };

  renderList();

  if (current) {
    ensureProfileRecord(current);
    overlay.classList.add('hidden');
    onReady(current);
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    const profiles = loadProfiles();
    if (!profiles.includes(name)) {
      profiles.push(name);
      saveProfiles(profiles);
    }
    ensureProfileRecord(name);
    setActiveProfile(name);
    overlay.classList.add('hidden');
    onReady(name);
  });
};
