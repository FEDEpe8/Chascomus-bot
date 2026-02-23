if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Acá le decimos al navegador que vaya a buscar el archivo sw.js
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('¡Service Worker registrado correctamente!', reg))
      .catch(err => console.error('Falló el registro del Service Worker:', err));
  });
}