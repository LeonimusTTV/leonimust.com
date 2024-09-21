function loadPage(url, event) {
  if (event) {
    event.preventDefault(); // Prevent full page reload
  }

  fetch(url)
    .then(response => response.text())
    .then(html => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, 'text/html');

      let newContent = doc.querySelector('#main').innerHTML;

      document.getElementById('main').innerHTML = newContent;

      window.history.pushState({ path: url }, '', url);
    })
    .catch(err => console.error('Failed to load page:', err));
}

// TODO make index be backable without reloading the whole page
window.addEventListener('popstate', function(event) {
  this.window.location.pathname = "/"; // Redirect to home page
});
