const PROFILE_KEY = 'vnrpg_profiles';
const ACTIVE_KEY = 'vnrpg_active_profile';

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
  const raw = storage.getItem(PROFILE_KEY);
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
  storage.setItem(PROFILE_KEY, JSON.stringify(profiles));
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
        setActiveProfile(profile);
        overlay.classList.add('hidden');
        onReady(profile);
      });
      list.appendChild(button);
    });
  };

  renderList();

  if (current) {
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
    setActiveProfile(name);
    overlay.classList.add('hidden');
    onReady(name);
  });
};
