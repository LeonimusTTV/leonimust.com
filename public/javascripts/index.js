function loadPage(url, event) {
  if (event) {
    event.preventDefault(); // Prevent full page reload
  }

  if (window.location.pathname === './') {
    stopWriting(); 
  }

  fetch(url)
    .then(response => response.text())
    .then(html => {
      // Parse the new content
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, 'text/html');
      let newContent = doc.querySelector('#main').innerHTML;

      // Replace the content in #main
      document.getElementById('main').innerHTML = newContent;

      // Update the browser history
      window.history.pushState({ path: url }, '', url);

      // Only initialize if on the main page
      if (url === './') {
        loadMain();
      }
    })
    .catch(err => console.error('Failed to load page:', err));
}

// Handle back/forward navigation with popstate
window.addEventListener('popstate', function(event) {
  const path = event.state ? event.state.path : './';

  if (window.location.pathname === './') {
    stopWriting(); 
  }

  // Load the page dynamically based on the URL in history state
  fetch(path)
    .then(response => response.text())
    .then(html => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, 'text/html');
      let newContent = doc.querySelector('#main').innerHTML;
      
      // Replace #main content
      document.getElementById('main').innerHTML = newContent;

      // Only run addStuff if returning to the main page
      if (path === './') {
        loadMain();
      }
    })
    .catch(err => console.error('Failed to handle popstate:', err));
});
