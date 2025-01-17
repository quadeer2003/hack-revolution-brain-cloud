window.addEventListener('load', () => {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'popup.js';
  document.body.appendChild(script);
}); 