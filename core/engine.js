import { setActiveProfile, getState, applyEffects } from './state.js';
import { renderScene, updateStatus } from '../ui/renderer.js';
import { initLogin } from '../auth/login.js';

const fallbackScenes = {
  start: 'intro',
  nodes: {
    intro: {
      id: 'intro',
      background: 'linear-gradient(135deg, #f7d6ff, #dbeafe)',
      characters: [{ name: 'Mahiru', pose: 'default', emotion: 'lembut' }],
      dialogue: {
        speaker: 'Mahiru',
        text: 'Kamu akhirnya bangun. Aku menunggumu cukup lama.'
      },
      choices: [
        { text: 'Aku baik-baik saja.', next: 'tenang', effects: { affection: 1 } },
        { text: 'Di mana ini?', next: 'bingung', effects: { trust: -1 } }
      ]
    },
    tenang: {
      id: 'tenang',
      background: 'linear-gradient(135deg, #fce7f3, #ede9fe)',
      characters: [{ name: 'Mahiru', pose: 'default', emotion: 'lega' }],
      dialogue: {
        speaker: 'Mahiru',
        text: 'Syukurlah. Suaramu terdengar lebih tenang sekarang.'
      },
      choices: [
        { text: 'Lanjutkan', next: 'akhir' }
      ]
    },
    bingung: {
      id: 'bingung',
      background: 'linear-gradient(135deg, #e0f2fe, #fef9c3)',
      characters: [{ name: 'Mahiru', pose: 'default', emotion: 'waspada' }],
      dialogue: {
        speaker: 'Mahiru',
        text: 'Ini tempat yang aman, tapi tidak selalu terasa seperti itu.'
      },
      choices: [
        { text: 'Lanjutkan', next: 'akhir' }
      ]
    },
    akhir: {
      id: 'akhir',
      background: 'linear-gradient(135deg, #fdf2f8, #e2e8f0)',
      characters: [{ name: 'Mahiru', pose: 'default', emotion: 'hati-hati' }],
      dialogue: {
        speaker: 'Mahiru',
        text: 'Ini baru permulaan. Keputusanmu akan membentuk segalanya.'
      },
      choices: []
    }
  }
};

let scenes = fallbackScenes;
let activeNodeId = fallbackScenes.start;

const loadScenes = async () => {
  try {
    const response = await fetch('./data/scenes.json');
    if (!response.ok) throw new Error('Gagal memuat data');
    const data = await response.json();
    if (data && data.nodes) {
      scenes = data;
      activeNodeId = data.start;
    }
  } catch (error) {
    scenes = fallbackScenes;
    activeNodeId = fallbackScenes.start;
  }
};

const getNode = () => scenes.nodes[activeNodeId];

const advanceTo = (nextId, effects = null) => {
  if (effects) {
    applyEffects(effects);
  }
  if (!nextId || !scenes.nodes[nextId]) return;
  activeNodeId = nextId;
  renderCurrent();
};

const renderCurrent = () => {
  const node = getNode();
  renderScene(node, advanceTo);
  updateStatus(getState());
};

const start = async () => {
  await loadScenes();
  renderCurrent();
};

export const initEngine = () => {
  initLogin((profileId) => {
    setActiveProfile(profileId);
    start();
  });
};
