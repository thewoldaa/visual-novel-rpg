import { applySceneTransition } from './transitions.js';
import { applyDialogueEffects } from './effects.js';

const elements = {};

const ensureElements = () => {
  if (elements.ready) return;
  elements.game = document.getElementById('game');
  elements.scene = document.getElementById('scene');
  elements.background = document.getElementById('bg');
  elements.character = document.getElementById('character');
  elements.characters = document.getElementById('characters');
  elements.nameBox = document.getElementById('name');
  elements.textBox = document.getElementById('text');
  elements.choicesBox = document.getElementById('choices');
  elements.statusBox = document.getElementById('status');
  elements.chapter = document.getElementById('chapter');
  elements.mood = document.getElementById('mood');
  elements.prompt = document.getElementById('prompt');
  elements.affection = document.getElementById('affection');
  elements.trust = document.getElementById('trust');
  elements.loneliness = document.getElementById('loneliness');
  elements.inventoryList = document.getElementById('inventory-list');
  elements.memoryLog = document.getElementById('memory-log');
  elements.endingsList = document.getElementById('endings-list');
  elements.ready = true;
};

const looksLikeGradient = (value) => typeof value === 'string' && value.includes('gradient');

export const renderScene = (node, onChoice) => {
  ensureElements();
  if (!node) return;

  if (looksLikeGradient(node.background)) {
    if (elements.background) {
      elements.background.removeAttribute('src');
    }
    applySceneTransition(elements.scene, node.background);
  } else if (node.background) {
    applySceneTransition(elements.scene, null);
    if (elements.background) {
      elements.background.src = node.background;
    }
  }

  if (elements.character) {
    if (node.character) {
      elements.character.src = node.character;
      elements.character.style.display = 'block';
    } else {
      elements.character.removeAttribute('src');
      elements.character.style.display = 'none';
    }
  }

  elements.characters.innerHTML = '';
  node.characters?.forEach((character) => {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.innerHTML = `
      <div class="character-name">${character.name}</div>
      <div class="character-emotion">${character.emotion}</div>
    `;
    elements.characters.appendChild(card);
  });

  elements.nameBox.textContent = node.dialogue?.speaker ?? '';
  elements.textBox.textContent = node.dialogue?.text ?? '';
  applyDialogueEffects(elements.textBox);

  if (elements.chapter) {
    elements.chapter.textContent = node.chapter ?? 'Babak Awal';
  }
  if (elements.mood) {
    elements.mood.textContent = node.mood ?? 'Tenang';
  }
  if (elements.prompt) {
    elements.prompt.textContent = node.prompt ?? 'Dengarkan napasmu dan pilih langkah berikutnya.';
  }

  elements.choicesBox.innerHTML = '';
  if (node.choices && node.choices.length) {
    node.choices.forEach((choice) => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.type = 'button';
      button.textContent = choice.text;
      button.addEventListener('click', () => {
        onChoice(choice.next, choice.effects);
      });
      elements.choicesBox.appendChild(button);
    });
  } else {
    const button = document.createElement('button');
    button.className = 'choice';
    button.type = 'button';
    button.textContent = 'Akhir Babak';
    button.disabled = true;
    elements.choicesBox.appendChild(button);
  }
};

const renderList = (element, items, emptyLabel) => {
  if (!element) return;
  element.innerHTML = '';
  if (!items || !items.length) {
    const item = document.createElement('li');
    item.className = 'hud-empty';
    item.textContent = emptyLabel;
    element.appendChild(item);
    return;
  }
  items.forEach((entry) => {
    const item = document.createElement('li');
    item.textContent = entry;
    element.appendChild(item);
  });
};

export const updateStatus = (state, endings = []) => {
  ensureElements();
  if (!state) return;
  elements.statusBox.textContent = `HP ${state.hp} · Mental ${state.mental} · Sanity ${state.sanity}`;
  if (elements.affection) {
    elements.affection.textContent = `${state.affection}`;
  }
  if (elements.trust) {
    elements.trust.textContent = `${state.trust}`;
  }
  if (elements.loneliness) {
    elements.loneliness.textContent = `${state.loneliness}`;
  }
  renderList(elements.inventoryList, state.inventory, 'Belum ada bekal.');
  renderList(elements.memoryLog, state.memoryLog, 'Kenanganmu masih kosong.');
  renderList(elements.endingsList, endings, 'Belum ada akhir yang tersimpan.');
  if (elements.game) {
    elements.game.classList.toggle('state-low-sanity', state.sanity <= 45);
    elements.game.classList.toggle('state-high-sanity', state.sanity >= 75);
    elements.game.classList.toggle('state-high-lonely', state.loneliness >= 60);
  }
};
