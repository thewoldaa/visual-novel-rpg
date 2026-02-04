const STORAGE_PREFIX = 'vnrpg_profile_';

const defaultState = () => ({
  currentSceneId: 'intro',
  hp: 100,
  mental: 100,
  affection: 0,
  trust: 0,
  loneliness: 0,
  sanity: 100,
  flags: {},
  emotions: {
    heroine: {
      trust: 0,
      affection: 0,
      anxiety: 0
    }
  },
  memory: [],
  meta: {
    loops: 0,
    aware: false
  },
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

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const clampStat = (key, value) => {
  const boundedKeys = new Set(['hp', 'mental', 'sanity', 'affection', 'trust', 'loneliness']);
  if (!boundedKeys.has(key)) return value;
  return clamp(value, 0, 100);
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

export const setCurrentSceneId = (nodeId) => {
  profileData.state.currentSceneId = nodeId;
  saveProfileData();
};

export const applyEffects = (effects = {}) => {
  const next = { ...profileData.state };
  Object.entries(effects).forEach(([key, value]) => {
    if (typeof next[key] === 'number') {
      next[key] = clampStat(key, next[key] + value);
    } else if (key === 'flags' && typeof value === 'object') {
      next.flags = { ...next.flags, ...value };
    } else if (key === 'memoryLog' && Array.isArray(value)) {
      next.memoryLog = [...next.memoryLog, ...value];
    }
  });
  profileData.state = next;
  saveProfileData();
};

export const applyEmotionImpact = (impact = {}) => {
  const heroine = profileData.state.emotions?.heroine;
  if (!heroine) return;
  Object.entries(impact).forEach(([key, value]) => {
    if (typeof heroine[key] === 'number') {
      heroine[key] = clamp(heroine[key] + value, 0, 100);
    }
  });
  saveProfileData();
};

export const addMemory = (entry) => {
  if (!entry) return;
  profileData.state.memory = [...profileData.state.memory, entry];
  saveProfileData();
};

export const hasMemory = (predicate) => profileData.state.memory.some(predicate);

export const incrementLoops = () => {
  const loops = profileData.state.meta?.loops ?? 0;
  profileData.state.meta = {
    ...profileData.state.meta,
    loops: loops + 1,
    aware: loops + 1 >= 3
  };
  saveProfileData();
};

export const unlockEnding = (endingId) => {
  if (!endingId) return;
  if (!profileData.endings.includes(endingId)) {
    profileData.endings = [...profileData.endings, endingId];
    saveProfileData();
  }
};
