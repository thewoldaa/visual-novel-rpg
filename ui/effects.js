export const applyDialogueEffects = (element) => {
  if (!element) return;
  element.classList.remove('text-fade');
  void element.offsetWidth;
  element.classList.add('text-fade');
};
