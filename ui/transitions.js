export const applySceneTransition = (element, background) => {
  if (!element) return;
  element.style.background = background || 'linear-gradient(135deg, #fce7f3, #dbeafe)';
};
