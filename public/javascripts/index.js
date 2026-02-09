function loadPage(url, event) {
  if (event) {
    event.preventDefault(); // Prevent full page reload
  }

  // Show loading overlay
  document.getElementById('loadingOverlay').classList.add('loading-active');

  // Stop typewriter if leaving home page
  if (typeof stopWriting !== 'undefined' && typeof stopWriting === 'function') {
    stopWriting();
  }

  // Normalize URL
  const normalizedUrl = (url === './' || url === '') ? '/' : url;
  const isHomePage = normalizedUrl === '/';

  // If navigating to home page and user has already entered, skip fetch and render directly
  if (isHomePage && window.userHasEntered) {
    const main = document.getElementById('main');
    main.style.opacity = 0;

    setTimeout(() => {
      // Update body class
      document.body.classList.remove('home-page', 'projects-page', 'games-page');
      document.body.classList.add('home-page');

      // Update the browser history
      window.history.pushState({ path: normalizedUrl }, '', normalizedUrl);

      // Directly render home page content
      renderHomePageContent();

      // Hide loading overlay
      document.getElementById('loadingOverlay').classList.remove('loading-active');

      // Fade in new content
      main.style.opacity = 1;
    }, 200);
    return;
  }

  fetch(normalizedUrl)
    .then(response => response.text())
    .then(html => {
      // Parse the new content
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, 'text/html');
      let mainElement = doc.querySelector('#main');

      // Remove overlay div if present (it's only needed on initial load)
      let overlayDiv = mainElement.querySelector('#overlay');
      if (overlayDiv) {
        overlayDiv.remove();
      }

      let newContent = mainElement.innerHTML;

      // Fade out current content
      const main = document.getElementById('main');
      main.style.opacity = 0;

      setTimeout(() => {
        // Replace the content in #main
        main.innerHTML = newContent;
        main.classList.add('page-transition');

        // Update body class based on current page
        document.body.classList.remove('home-page', 'projects-page', 'games-page');
        if (isHomePage) {
          document.body.classList.add('home-page');
        } else if (normalizedUrl.includes('projects')) {
          document.body.classList.add('projects-page');
        } else if (normalizedUrl.includes('games')) {
          document.body.classList.add('games-page');
        }

        // Update the browser history
        window.history.pushState({ path: normalizedUrl }, '', normalizedUrl);

        // Hide loading overlay
        document.getElementById('loadingOverlay').classList.remove('loading-active');

        // Fade in new content
        main.style.opacity = 1;

        // Only initialize if on the main page
        if (isHomePage) {
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

// Function to render home page content
function renderHomePageContent() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <h1 name="top" id="status_text" class="header"><a>leonimust.com</a></h1>
    <p name="bottom" id="text2" class="textiboi">young programmer, i like games but i probably don't like you</p>
  `;

  // Ensure music is playing when returning to home page
  if (typeof music !== 'undefined' && music.paused) {
    music.play().catch(err => {
      console.log('Could not autoplay music:', err);
    });
  }

  // Add the typewriter and navigation elements
  setTimeout(function () {
    var doc = document.getElementById("main");

    // Create navigation links
    doc.innerHTML +=
      `<div class="textiboi">
          <a id="typElement"></a>
       </div>
       <div class="nav-container">
          <a class="textiboi nav-item" href="https://github.com/LeonimusTTV">GitHub</a>
          <a class="textiboi nav-item" href="/projects" onclick="loadPage('/projects', event)">projects</a>
          <a class="textiboi nav-item" href="/games" onclick="loadPage('/games', event)">games</a>
          <a class="textiboi nav-item" href="mailto:leo@leonimust.com">contact</a>
       </div>`;

    // Start typewriter if available
    if (typeof startWriting === 'function') {
      startWriting();
    }
  }, 100);
}

// Function to load main page content without initial animations if user has already entered
function loadMainWithoutAnimation() {
  // Always render home page content directly when navigating
  // (user must have already entered to be navigating between pages)
  window.userHasEntered = true;
  renderHomePageContent();
}

// Set initial body class based on current path and push initial history state
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

  // Push initial state to history so back button works correctly
  if (!window.history.state) {
    window.history.replaceState({ path: currentPath || '/' }, '', currentPath || '/');
  }
});

// Handle back/forward navigation with popstate (single unified handler)
window.addEventListener('popstate', function (event) {
  // Get path from state, fallback to current pathname or root
  let path = event.state?.path || window.location.pathname || '/';

  // Normalize path
  if (path === './' || path === '') path = '/';
  const isHomePage = path === '/';

  // Show loading overlay
  document.getElementById('loadingOverlay').classList.add('loading-active');

  // Stop typewriter if it's running
  if (typeof stopWriting !== 'undefined' && typeof stopWriting === 'function') {
    stopWriting();
  }

  // If navigating to home page and user has already entered, skip fetch and render directly
  if (isHomePage && window.userHasEntered) {
    const main = document.getElementById('main');
    main.style.opacity = 0;

    setTimeout(() => {
      // Update body class
      document.body.classList.remove('home-page', 'projects-page', 'games-page');
      document.body.classList.add('home-page');

      // Directly render home page content
      renderHomePageContent();

      // Hide loading overlay
      document.getElementById('loadingOverlay').classList.remove('loading-active');

      // Fade in new content
      main.style.opacity = 1;
    }, 200);
    return;
  }

  // Load the page dynamically based on the URL in history state
  fetch(path)
    .then(response => response.text())
    .then(html => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, 'text/html');
      let mainElement = doc.querySelector('#main');

      // Remove overlay div if present (it's only needed on initial load)
      let overlayDiv = mainElement.querySelector('#overlay');
      if (overlayDiv) {
        overlayDiv.remove();
      }

      let newContent = mainElement.innerHTML;

      // Fade out current content
      const main = document.getElementById('main');
      main.style.opacity = 0;

      setTimeout(() => {
        // Replace #main content
        main.innerHTML = newContent;
        main.classList.add('page-transition');

        // Update body class based on current page
        document.body.classList.remove('home-page', 'projects-page', 'games-page');
        if (isHomePage) {
          document.body.classList.add('home-page');
        } else if (path.includes('projects')) {
          document.body.classList.add('projects-page');
        } else if (path.includes('games')) {
          document.body.classList.add('games-page');
        }

        // Hide loading overlay
        document.getElementById('loadingOverlay').classList.remove('loading-active');

        // Fade in new content
        main.style.opacity = 1;

        // Only run loadMainWithoutAnimation if returning to the main page
        if (isHomePage) {
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
