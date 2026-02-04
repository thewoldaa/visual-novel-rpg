import {
  setActiveProfile,
  getState,
  applyEffects,
  getProgress,
  updateProgress,
  setCurrentSceneId,
  applyEmotionImpact,
  addMemory,
  hasMemory,
  incrementLoops
} from './state.js';
import { renderScene, updateStatus } from '../ui/renderer.js';
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

const applyTone = (text) => {
  const state = getState();
  const heroine = state.emotions?.heroine ?? {};
  if (!text) return '';
  if (heroine.anxiety > 7) {
    return text.replace(/\.\.\./g, '—');
  }
  if (heroine.affection > 8) {
    return `❤ ${text}`;
  }
  return text;
};

const resolveDialogueText = (node) => {
  const state = getState();
  if (!state.meta?.aware && node?.dialogue?.fallbackText) {
    return node.dialogue.fallbackText;
  }
  return node?.dialogue?.text ?? '';
};

const applyDialogueImpact = (node) => {
  if (!node?.dialogue?.emotionImpact) return;
  const alreadyApplied = hasMemory((entry) => entry?.type === 'node' && entry?.id === node.id);
  if (alreadyApplied) return;
  applyEmotionImpact(node.dialogue.emotionImpact);
  addMemory({ type: 'node', id: node.id, time: Date.now() });
};

const shouldTriggerSideScene = () => {
  const state = getState();
  if (state.meta?.aware) return false;
  if (state.emotions?.heroine?.anxiety < 6) return false;
  return !hasMemory((entry) => entry?.type === 'side' && entry?.origin === activeNodeId);
};

const generateSideScene = () => {
  const state = getState();
  return {
    id: `side-${activeNodeId}`,
    background: scenes.nodes[activeNodeId]?.background,
    characters: scenes.nodes[activeNodeId]?.characters ?? [],
    dialogue: {
      speaker: scenes.nodes[activeNodeId]?.dialogue?.speaker ?? 'Mahiru',
      text: `Dia terdiam cukup lama. (${state.emotions.heroine.anxiety})`
    },
    choices: [
      {
        text: 'Lanjutkan',
        next: activeNodeId,
        effects: {
          memoryLog: [`side:${activeNodeId}`]
        }
      }
    ]
  };
};

const advanceTo = (nextId, effects = null) => {
  if (effects) {
    applyEffects(effects);
  }
  if (!isValidNode(nextId)) return;
  activeNodeId = nextId;
  updateProgress(activeNodeId);
  setCurrentSceneId(activeNodeId);
  renderCurrent();
};

const renderCurrent = () => {
  if (shouldTriggerSideScene()) {
    const sideScene = generateSideScene();
    addMemory({ type: 'side', origin: activeNodeId, time: Date.now() });
    renderScene(sideScene, advanceTo);
    updateStatus(getState());
    return;
  }

  const node = getNode();
  if (!node) return;
  applyDialogueImpact(node);
  const resolvedText = resolveDialogueText(node);
  const tonedNode = {
    ...node,
    dialogue: {
      ...node.dialogue,
      text: applyTone(resolvedText)
    }
  };
  renderScene(tonedNode, advanceTo);
  updateStatus(getState());
};

const start = async () => {
  await loadScenes();
  const previous = getProgress();
  activeNodeId = resolveStartNode();
  updateProgress(activeNodeId);
  setCurrentSceneId(activeNodeId);
  if (previous && previous === scenes.start) {
    incrementLoops();
  }
  renderCurrent();
};

export const initEngine = () => {
  initLogin((profileId) => {
    setActiveProfile(profileId);
    start();
  });
};
