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
  elements.ready = true;
};

const looksLikeGradient = (value) => typeof value === 'string' && value.includes('gradient');
const spriteClassMap = {
  idle: 'is-idle',
  talk: 'is-talk',
  happy: 'is-happy',
  sad: 'is-sad',
};
const spritePath = (sprite) => (sprite ? `assets/char/mahiru/${sprite}.png` : null);

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
    const sprite = node.characterSprite || 'idle';
    const spriteSrc = spritePath(sprite);
    elements.character.classList.remove(...Object.values(spriteClassMap));
    if (spriteClassMap[sprite]) {
      elements.character.classList.add(spriteClassMap[sprite]);
    }

    if (spriteSrc) {
      elements.character.src = spriteSrc;
      elements.character.style.display = 'block';
    } else if (node.character) {
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
  if (elements.game) {
    elements.game.classList.toggle('state-low-sanity', state.sanity <= 45);
    elements.game.classList.toggle('state-high-sanity', state.sanity >= 75);
    elements.game.classList.toggle('state-high-lonely', state.loneliness >= 60);
  }
};
