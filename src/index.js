const rankDocuments = (docs, terms) => {
  const regexes = terms.map((term) => new RegExp(`\\b${term}(?!(\\w+))\\b`, 'gi'));
  const result = docs.map(({ id, text }) => {
    const rankedDoc = {
      id,
      text,
      matchedWordsCount: 0,
      inclusionCount: 0,
    };
    for (let i = 0; i < regexes.length; i += 1) {
      const regex = regexes[i];
      const matches = text.match(regex);
      if (matches) {
        rankedDoc.matchedWordsCount += 1;
        rankedDoc.inclusionCount += matches.length;
      }
    }

    return rankedDoc;
    // const matches = text.match(/\w+/g);
    // const matches = text.match(regex);
    // console.log(matches);
    // const normalizedMatches = matches.filter((t) => t.toLowerCase() === term[0].toLowerCase());
    // return normalizedMatches.length > 0;
    // if (matches) {
    //   return { id, text, rank: matches.length };
    // }
    // return { id, text, rank: 0 };
  });

  return result;
};

const buildSearchEngine = (docs = []) => {
  const search = (token) => {
    const terms = token.match(/\w+/g);
    if (!terms) {
      return [];
    }
    const rankedDocs = rankDocuments(docs, terms);
    const matchedDocs = rankedDocs.filter((doc) => doc.matchedWordsCount > 0);
    // const docsSortedByWordsCount = matchedDocs
    //   .sort((a, b) => b.matchedWordsCount - a.matchedWordsCount);
    const groupedByWordCount = matchedDocs.reduce((acc, item) => {
      const { matchedWordsCount } = item;
      if (acc[matchedWordsCount]) {
        return { ...acc, [matchedWordsCount]: [...acc[matchedWordsCount], item] };
      }
      return { ...acc, [matchedWordsCount]: [item] };
    }, {});
    const sortedWordCounts = Object.keys(groupedByWordCount).sort((a, b) => b - a);

    const result = sortedWordCounts
      .reduce((acc, count) => (
        [...acc, ...groupedByWordCount[count].sort((a, b) => b.inclusionCount - a.inclusionCount)]
      ), [])
      .map(({ id }) => id);
    return result;
  };

  return {
    search,
  };
};

export default buildSearchEngine;
