const buildSearchEngine = (docs = []) => {
  const search = (token) => {
    const term = token.match(/\w+/g);
    if (!term) {
      return [];
    }
    return docs
      .filter(({ text }) => {
        const matches = text.match(/\w+/g);
        const normalizedMatches = matches.filter((t) => t.toLowerCase() === term[0].toLowerCase());
        return normalizedMatches.length > 0;
      })
      .map(({ id }) => id);
  };

  return {
    search,
  };
};

export default buildSearchEngine;
