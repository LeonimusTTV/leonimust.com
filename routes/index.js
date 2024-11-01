var express = require('express');
var router = express.Router();
const axios = require('axios');

const subdomains = ["https://supercold.leonimust.com", "https://doom.leonimust.com", "https://earthwalker.leonimust.com"];

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/projects', function(req, res, next) {
  res.render('projects');
});

const checkSubdomain = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return { url, status: response.status, statusText: 'Up' };
  } catch (error) {
    if (error.response) {
      return { url, status: error.response.status, statusText: 'Down' };
    } else {
      return { url, status: 'No response', statusText: 'Down' };
    }
  }
};

// TODO - edit games and projects to now make a weird loading thing - me :3
router.get('/games', async function(req, res, next) {
  const results = await Promise.all(subdomains.map(checkSubdomain));
  res.render('games', {results});
});

module.exports = router;
