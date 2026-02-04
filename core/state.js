const STORAGE_PREFIX = 'vnrpg_state_';

const defaultState = () => ({
  hp: 100,
  mental: 100,
  affection: 0,
  trust: 0,
  loneliness: 0,
  sanity: 100,
  flags: {},
  inventory: [],
  memoryLog: []
});

let activeProfile = null;
let state = defaultState();

const safeStorage = () => {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

export const getState = () => state;

export const setActiveProfile = (profileId) => {
  activeProfile = profileId;
  state = loadState(profileId) ?? defaultState();
  saveState();
};

export const resetState = () => {
  state = defaultState();
  saveState();
};

export const updateState = (patch) => {
  state = {
    ...state,
    ...patch
  };
  saveState();
};

export const applyEffects = (effects = {}) => {
  const next = { ...state };
  Object.entries(effects).forEach(([key, value]) => {
    if (typeof next[key] === 'number') {
      next[key] += value;
    } else if (key === 'flags' && typeof value === 'object') {
      next.flags = { ...next.flags, ...value };
    } else if (key === 'memoryLog' && Array.isArray(value)) {
      next.memoryLog = [...next.memoryLog, ...value];
    }
  });
  state = next;
  saveState();
};

export const saveState = () => {
  if (!activeProfile) return;
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(`${STORAGE_PREFIX}${activeProfile}`, JSON.stringify(state));
};

export const loadState = (profileId) => {
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.getItem(`${STORAGE_PREFIX}${profileId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};
