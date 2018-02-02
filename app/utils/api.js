const id = 'YOUR_CLIENT_ID';
const sec = 'YOUR_SECRET_ID';
const params = `?client_id=${id}&client_secret=${sec}`;

function getGitHubUserApi(username) {
  return `https://api.github.com/users/${username}`;
}

async function getProfile(username) {
  // add params on the end of url if needed
  const response = await fetch(getGitHubUserApi(username));
  return response.json();
}

async function getRepos(username) {
  const response = await fetch(
    `${getGitHubUserApi(username)}/repos?per_page=100`
  );
  return response.json();
}

function getStarCount(repos) {
  return repos.reduce(
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

async function getUserData(player) {
  const [profile, repos] = await Promise.all([
    getProfile(player),
    getRepos(player)
  ]);
  return { profile, score: calculateScore(profile, repos) };
}

function sortPlayers(players) {
  return players.sort((a, b) => b.score - a.score);
}

export default {
  async battle(players) {
    try {
      const userData = await Promise.all(players.map(getUserData));
      return sortPlayers(userData);
    } catch (error) {
      handleError(error);
      return null;
    }
  },
  async fetchPopularRepos(language) {
    const encodedURI = window.encodeURI(
      `https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`
    );
    try {
      const response = await fetch(encodedURI);
      const repos = await response.json();
      return repos.items;
    } catch (error) {
      handleError(error);
      return null;
    }
  }
};
