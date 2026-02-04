const STORAGE_PREFIX = 'vnrpg_profile_';

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

const defaultProfile = () => ({
  progress: null,
  state: defaultState(),
  endings: []
});

let activeProfileId = null;
let profileData = defaultProfile();

const safeStorage = () => {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

const normalizeProfile = (rawProfile) => {
  if (!rawProfile) return defaultProfile();
  return {
    progress: rawProfile.progress ?? null,
    state: rawProfile.state ?? defaultState(),
    endings: Array.isArray(rawProfile.endings) ? rawProfile.endings : []
  };
};

const loadProfileData = (profileId) => {
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

const saveProfileData = () => {
  if (!activeProfileId) return;
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(`${STORAGE_PREFIX}${activeProfileId}`, JSON.stringify(profileData));
};

export const getState = () => profileData.state;

export const getProgress = () => profileData.progress;

export const setActiveProfile = (profileId) => {
  activeProfileId = profileId;
  const loaded = loadProfileData(profileId);
  profileData = normalizeProfile(loaded);
  saveProfileData();
};

export const resetState = () => {
  profileData.state = defaultState();
  saveProfileData();
};

export const updateState = (patch) => {
  profileData.state = {
    ...profileData.state,
    ...patch
  };
  saveProfileData();
};

export const updateProgress = (nodeId) => {
  profileData.progress = nodeId;
  saveProfileData();
};

export const applyEffects = (effects = {}) => {
  const next = { ...profileData.state };
  Object.entries(effects).forEach(([key, value]) => {
    if (typeof next[key] === 'number') {
      next[key] += value;
    } else if (key === 'flags' && typeof value === 'object') {
      next.flags = { ...next.flags, ...value };
    } else if (key === 'memoryLog' && Array.isArray(value)) {
      next.memoryLog = [...next.memoryLog, ...value];
    }
  });
  profileData.state = next;
  saveProfileData();
};

export const unlockEnding = (endingId) => {
  if (!endingId) return;
  if (!profileData.endings.includes(endingId)) {
    profileData.endings = [...profileData.endings, endingId];
    saveProfileData();
  }
};
