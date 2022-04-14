const buildSearchEngine = (docs = []) => {
  const search = (query) => docs
    .filter(({ text }) => {
      const matches = text
        .split(' ')
        .filter((word) => word.toLowerCase() === query);
      return matches.length > 0;
    })
    .map(({ id }) => id);

  return {
    search,
  };
};

export default buildSearchEngine;
