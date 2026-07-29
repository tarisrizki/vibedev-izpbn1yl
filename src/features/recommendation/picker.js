export const getEligibleGames = (games, criteria) => {
  return games.filter(game => {
    // Hard filter: players
    if (criteria.players) {
      if (criteria.players < game.minPlayers || criteria.players > game.maxPlayers) {
        return false;
      }
    }
    
    // Hard filter: play time
    if (criteria.maxPlayTime) {
      if (game.playTime > criteria.maxPlayTime) {
        return false;
      }
    }
    
    // Hard filter: minimum rating
    if (criteria.minRating) {
      if (game.rating < criteria.minRating) {
        return false;
      }
    }
    
    // Hard filter: favorites only
    if (criteria.favoritesOnly && !game.isFavorite) {
      return false;
    }
    
    return true;
  });
};

export const scoreGame = (game, recentPicks) => {
  let score = 10; // base score
  
  // Bonus for want-to-play
  if (game.status === 'want-to-play') {
    score += 15;
  }
  
  // Bonus proportional to rating (0 to 10 points)
  if (game.rating > 0) {
    score += (game.rating / 5) * 10;
  }
  
  // Recency decay bonus (more points if hasn't been picked recently)
  if (!game.lastPickedAt) {
    score += 20; // never picked
  } else {
    const daysSincePicked = (new Date() - new Date(game.lastPickedAt)) / (1000 * 60 * 60 * 24);
    // up to 15 points based on how long it's been
    score += Math.min(daysSincePicked, 15);
  }
  
  // Penalty if recently picked
  const recentIndex = recentPicks.indexOf(game.id);
  if (recentIndex !== -1) {
    // 0 is the most recent. Penalty is higher for smaller index.
    const penalty = (10 - recentIndex) * 5; 
    score -= penalty;
  }
  
  // Small bonus for favorites (if not exclusively filtering by favorite)
  if (game.isFavorite) {
    score += 5;
  }
  
  return Math.max(score, 1); // minimum score is 1 so it's always possible
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
  
  return scoredGames[0].game; // fallback
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
  
  if (game.status === 'want-to-play') {
    reasons.push(`still on your 'Want to Play' list`);
  } else if (!game.lastPickedAt) {
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
