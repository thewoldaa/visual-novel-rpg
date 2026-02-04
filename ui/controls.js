import { resetProgress, resetState } from '../core/state.js';

export const initControls = () => {
  const resetButton = document.getElementById('reset-run');
  if (!resetButton) return;
  resetButton.addEventListener('click', () => {
    resetState();
    resetProgress();
    window.location.reload();
  });
};
