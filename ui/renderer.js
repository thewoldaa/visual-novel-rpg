import { applySceneTransition } from './transitions.js';
import { applyDialogueEffects } from './effects.js';

const elements = {};

const ensureElements = () => {
  if (elements.ready) return;
  elements.background = document.getElementById('background');
  elements.characters = document.getElementById('characters');
  elements.nameBox = document.getElementById('name');
  elements.textBox = document.getElementById('text');
  elements.choicesBox = document.getElementById('choices');
  elements.statusBox = document.getElementById('status');
  elements.ready = true;
};

export const renderScene = (node, onChoice) => {
  ensureElements();
  if (!node) return;

  applySceneTransition(elements.background, node.background);

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

export const updateStatus = (state) => {
  ensureElements();
  if (!state) return;
  elements.statusBox.textContent = `HP ${state.hp} · Mental ${state.mental} · Sanity ${state.sanity}`;
};
