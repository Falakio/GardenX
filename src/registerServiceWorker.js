export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful');
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  }
}
