const axios = require('axios');

const id = 'YOUR_CLIENT_ID';
const sec = 'YOUR_SECRET_ID';
const params = `?client_id=${id}&client_secret=${sec}`;

function getGitHubUserApi(username) {
  return `https://api.github.com/users/${username}`;
}

function getProfile(username) {
  // add params on the end of url if needed
  return axios.get(getGitHubUserApi(username)).then(({ data }) => data);
}

function getRepos(username) {
  return axios.get(`${getGitHubUserApi(username)}/repos?per_page=100`);
}

function getStarCount({ data }) {
  return data.reduce(
    (count, { stargazers_count }) => count + stargazers_count,
    0
  );
}

function calculateScore({ followers }, repos) {
  return followers * 3 + getStarCount(repos);
}

function handleError(error) {
  console.warn(error);
  return null;
}

function getUserData(player) {
  return Promise.all([getProfile(player), getRepos(player)]).then(
    ([profile, repos]) => ({
      profile,
      score: calculateScore(profile, repos)
    })
  );
}

function sortPlayers(players) {
  return players.sort((a, b) => b.score - a.score);
}

module.exports = {
  battle(players) {
    return Promise.all(players.map(getUserData))
      .then(sortPlayers)
      .catch(handleError);
  },
  fetchPopularRepos(language) {
    const encodedURI = window.encodeURI(
      `https://api.github.com/search/repositories?q=stars:>1+language:
        ${language}
        &sort=stars&order=desc&type=Repositories`
    );
    return axios.get(encodedURI).then(({ data }) => data.items);
  }
};
