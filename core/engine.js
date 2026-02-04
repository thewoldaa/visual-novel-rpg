import { setActiveProfile, getState, applyEffects, getProgress, updateProgress } from './state.js';
import { renderScene, updateStatus } from '../ui/renderer.js';
import { initLogin } from '../auth/login.js';
import embeddedScenes from '../data/scenes.js';

const fallbackScenes = embeddedScenes;

let scenes = fallbackScenes;
let activeNodeId = fallbackScenes.start;

const isValidNode = (nodeId) => Boolean(nodeId && scenes.nodes[nodeId]);

const loadScenes = async () => {
  try {
    const response = await fetch('./data/scenes.json');
    if (!response.ok) throw new Error('Gagal memuat data');
    const data = await response.json();
    if (data && data.nodes) {
      scenes = data;
      return;
    }
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
  renderScene(node, advanceTo);
  updateStatus(getState());
};

const start = async () => {
  await loadScenes();
  activeNodeId = resolveStartNode();
  updateProgress(activeNodeId);
  renderCurrent();
};

export const initEngine = () => {
  initLogin((profileId) => {
    setActiveProfile(profileId);
    start();
  });
};
