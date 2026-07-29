export const getEligibleGames = (games, criteria) => {
  return games.filter(game => {
    if (game.status !== 'want-to-play') return false;
    if (criteria.players) {
      if (criteria.players < game.minPlayers || criteria.players > game.maxPlayers) {
        return false;
      }
    }
    if (criteria.maxPlayTime) {
      if (game.playTime > criteria.maxPlayTime) {
        return false;
      }
    }
    if (criteria.minRating) {
      if (game.rating < criteria.minRating) {
        return false;
      }
    }
    if (criteria.favoritesOnly && !game.isFavorite) {
      return false;
    }
    return true;
  });
};
export const scoreGame = (game, recentPicks) => {
  let score = 10;
  if (game.rating > 0) {
    score += (game.rating / 5) * 10;
  }
  if (!game.lastPickedAt) {
    score += 20; 
  } else {
    const daysSincePicked = (new Date() - new Date(game.lastPickedAt)) / (1000 * 60 * 60 * 24);
    score += Math.min(daysSincePicked, 15);
  }
  const recentIndex = recentPicks.indexOf(game.id);
  if (recentIndex !== -1) {
    const penalty = (10 - recentIndex) * 5; 
    score -= penalty;
  }
  if (game.isFavorite) {
    score += 5;
  }
  return Math.max(score, 1); 
};
export const weightedRandomPick = (scoredGames) => {
  const totalScore = scoredGames.reduce((sum, item) => sum + item.score, 0);
  let random = Math.random() * totalScore;
  for (const item of scoredGames) {
    if (random < item.score) {
      return item.game;
    }
    random -= item.score;
  }
  return scoredGames[0].game; 
};
export const buildReasonText = (game, criteria) => {
  const reasons = [];
  if (criteria.players && game.minPlayers <= criteria.players && game.maxPlayers >= criteria.players) {
    reasons.push(`perfect for ${criteria.players} players`);
  }
  if (game.rating >= 4) {
    reasons.push(`highly rated (${game.rating}/5)`);
  } else if (game.isFavorite) {
    reasons.push(`one of your favorites`);
  }
  if (!game.lastPickedAt) {
    reasons.push(`you haven't played this one in a while`);
  }
  if (reasons.length === 0) {
    return "A solid choice for tonight's game night!";
  }
  if (reasons.length === 1) {
    return `Selected because it is ${reasons[0]}.`;
  }
  const lastReason = reasons.pop();
  return `Selected because it is ${reasons.join(', ')}, and ${lastReason}.`;
};
export const pickTonightGame = (games, criteria, recentPicks) => {
  const eligible = getEligibleGames(games, criteria);
  if (eligible.length === 0) {
    return null;
  }
  const scoredGames = eligible.map(game => ({
    game,
    score: scoreGame(game, recentPicks)
  }));
  const pickedGame = weightedRandomPick(scoredGames);
  const reasonText = buildReasonText(pickedGame, criteria);
  return {
    game: pickedGame,
    reason: reasonText
  };
};
