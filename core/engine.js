import {
  setActiveProfile,
  getState,
  getEndings,
  applyEffects,
  getProgress,
  updateProgress,
  unlockEnding
} from './state.js';
import { renderScene, updateStatus } from '../ui/renderer.js';
import { initControls } from '../ui/controls.js';
import { initLogin } from '../auth/login.js';
import embeddedScenes from '../data/scenes.js';

const fallbackScenes = embeddedScenes;

let scenes = fallbackScenes;
let activeNodeId = fallbackScenes.start;

const isValidNode = (nodeId) => Boolean(nodeId && scenes.nodes[nodeId]);
const hasValidNode = (node) => {
  if (!node || typeof node !== 'object') return false;
  if (!node.id) return false;
  if (!node.dialogue || typeof node.dialogue.text !== 'string') return false;
  if (!Array.isArray(node.choices)) return false;
  return true;
};

const validateScenes = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (!data.start || !data.nodes || typeof data.nodes !== 'object') return false;
  const nodeEntries = Object.values(data.nodes);
  if (!nodeEntries.length) return false;
  return nodeEntries.every(hasValidNode);
};

const loadScenes = async () => {
  const scenesUrl = new URL('../data/scenes.json', import.meta.url);
  try {
    const response = await fetch(scenesUrl);
    if (!response.ok) throw new Error('Gagal memuat data');
    const data = await response.json();
    if (validateScenes(data)) {
      scenes = data;
      return;
    }
    console.warn('Scenes JSON tidak valid, menggunakan fallback.');
  } catch (error) {
    scenes = fallbackScenes;
  }
};

const resolveStartNode = () => {
  const progress = getProgress();
  if (isValidNode(progress)) {
    return progress;
  }
  if (isValidNode(scenes.start)) {
    return scenes.start;
  }
  return fallbackScenes.start;
};

const getNode = () => scenes.nodes[activeNodeId];

const advanceTo = (nextId, effects = null) => {
  if (effects) {
    applyEffects(effects);
  }
  if (!isValidNode(nextId)) return;
  activeNodeId = nextId;
  updateProgress(activeNodeId);
  renderCurrent();
};

const renderCurrent = () => {
  const node = getNode();
  if (!node) return;
  if (node.ending) {
    unlockEnding(node.ending);
  }
  renderScene(node, advanceTo);
  updateStatus(getState(), getEndings());
};

const start = async () => {
  await loadScenes();
  activeNodeId = resolveStartNode();
  updateProgress(activeNodeId);
  renderCurrent();
};

export const initEngine = () => {
  initControls();
  initLogin((profileId) => {
    setActiveProfile(profileId);
    start();
  });
};
