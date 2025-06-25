function loadPage(url, event) {
  if (event) {
    event.preventDefault(); // Prevent full page reload
  }

  // Show loading overlay
  document.getElementById('loadingOverlay').classList.add('loading-active');

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

      // Fade out current content
      const main = document.getElementById('main');
      main.style.opacity = 0;

      setTimeout(() => {
        // Replace the content in #main
        main.innerHTML = newContent;
        main.classList.add('page-transition');

        // Update body class based on current page
        document.body.classList.remove('home-page', 'projects-page', 'games-page');
        if (url === './' || url === '') {
          document.body.classList.add('home-page');
        } else if (url.includes('projects')) {
          document.body.classList.add('projects-page');
        } else if (url.includes('games')) {
          document.body.classList.add('games-page');
        }

        // Update the browser history
        window.history.pushState({ path: url }, '', url);

        // Hide loading overlay
        document.getElementById('loadingOverlay').classList.remove('loading-active');

        // Fade in new content
        main.style.opacity = 1;

        // Only initialize if on the main page
        if (url === './') {
          loadMainWithoutAnimation();
        }
      }, 200);
    })
    .catch(err => {
      console.error('Failed to load page:', err);
      // Hide loading overlay even on error
      document.getElementById('loadingOverlay').classList.remove('loading-active');
    });
}

// Function to load main page content without initial animations if user has already entered
function loadMainWithoutAnimation() {
  if (window.userHasEntered) {
    // Skip initial animations but keep the appearing animations
    const main = document.getElementById('main');
    main.innerHTML = `
      <h1 name="top" id="status_text" class="header"><a>leonimust.com</a></h1>
      <p name="bottom" id="text2" class="textiboi">young programmer, i like games but i probably don't like you</p>
    `;

    // Add the typewriter and navigation elements with animations, similar to animationOver()
    setTimeout(function () {
      var doc = document.getElementById("main");

      // Create navigation links with staggered animations
      doc.innerHTML +=
        `<div class="textiboi">
            <a id="typElement"></a>
         </div>
         <div class="nav-container">
            <a class="textiboi nav-item animated fadeIn" style="animation-delay: 100ms" href="https://github.com/LeonimusTTV">GitHub</a>
            <a class="textiboi nav-item animated fadeIn" style="animation-delay: 200ms" href="/projects" onclick="loadPage('/projects', event)">projects</a>
            <a class="textiboi nav-item animated fadeIn" style="animation-delay: 300ms" href="/games" onclick="loadPage('/games', event)">games</a>
            <a class="textiboi nav-item animated fadeIn" style="animation-delay: 400ms" href="mailto:leo@leonimust.com">contact</a>
         </div>`;

      startWriting();
    }, 100);
  } else {
    // First time visiting, use normal animation flow
    loadMain();
  }
}

// Handle browser back button
window.addEventListener('popstate', function (event) {
  if (event.state && event.state.path) {
    loadPage(event.state.path);
  } else {
    loadPage('./');
  }
});

// Set initial body class based on current path
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  document.body.classList.remove('home-page', 'projects-page', 'games-page');

  if (currentPath === '/' || currentPath === './' || currentPath === '') {
    document.body.classList.add('home-page');
  } else if (currentPath.includes('projects')) {
    document.body.classList.add('projects-page');
  } else if (currentPath.includes('games')) {
    document.body.classList.add('games-page');
  }
});

// Handle back/forward navigation with popstate
window.addEventListener('popstate', function (event) {
  const path = event.state ? event.state.path : './';

  // Show loading overlay
  document.getElementById('loadingOverlay').classList.add('loading-active');

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

      // Fade out current content
      const main = document.getElementById('main');
      main.style.opacity = 0;

      setTimeout(() => {
        // Replace #main content
        main.innerHTML = newContent;
        main.classList.add('page-transition');

        // Hide loading overlay
        document.getElementById('loadingOverlay').classList.remove('loading-active');

        // Fade in new content
        main.style.opacity = 1;

        // Only run loadMainWithoutAnimation if returning to the main page
        if (path === './') {
          loadMainWithoutAnimation();
        }
      }, 200);
    })
    .catch(err => {
      console.error('Failed to handle popstate:', err);
      // Hide loading overlay even on error
      document.getElementById('loadingOverlay').classList.remove('loading-active');
    });
});
