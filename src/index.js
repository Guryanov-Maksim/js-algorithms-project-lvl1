const buildSearchEngine = (docs = []) => {
  const search = (token) => {
    const term = token.match(/\w+/g);
    if (!term) {
      return [];
    }
    const regex = new RegExp(`\\b${term[0]}(?!(\\w+))\\b`, 'gi');
    const rankedDoc = docs.map(({ id, text }) => {
      // const matches = text.match(/\w+/g);
      const matches = text.match(regex);
      // console.log(matches);
      // const normalizedMatches = matches.filter((t) => t.toLowerCase() === term[0].toLowerCase());
      // return normalizedMatches.length > 0;
      if (matches) {
        return { id, text, rank: matches.length };
      }
      return { id, text, rank: 0 };
    });
    const matchedDocs = rankedDoc.filter((doc) => doc.rank > 0);
    const result = matchedDocs
      .sort((a, b) => b.rank - a.rank)
      .map(({ id }) => id);
    return result;
  };

  return {
    search,
  };
};

export default buildSearchEngine;
