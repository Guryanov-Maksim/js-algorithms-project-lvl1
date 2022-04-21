import _ from 'lodash';

const buildInvertedIndex = (docs) => {
  // const serchedDocs = new RegExp(`\\b[${term}\`](?!(\\w+))\\b`, 'gi');
  const result = docs.reduce((acc, { id, text }) => {
    const words = [...text.match(/[\w+']+/gi)];
    let newAcc = { ...acc };
    for (let i = 0; i < words.length; i += 1) {
      const word = words[i].toLowerCase();
      if (newAcc[word]) {
        const { ids, inclusionCounts } = newAcc[word];
        ids.add(id);
        const prevCount = _.get(inclusionCounts, id, 0);
        newAcc = {
          ...newAcc,
          [word]: {
            ids,
            inclusionCounts: {
              ...inclusionCounts,
              [id]: prevCount + 1,
            },
          },
        };
      } else {
        const ids = new Set();
        ids.add(id);
        newAcc = {
          ...newAcc,
          [word]: {
            ids,
            inclusionCounts: {
              [id]: 1,
            },
          },
        };
      }
    }

    return newAcc;
  }, {});

  return result;
};

const rankDocuments = (index, terms) => {
  const iter = (wordsToMatch, result) => {
    if (wordsToMatch.length === 0) {
      return _.union(...result);
    }
    const allMatchedDocIds = wordsToMatch.map((word) => {
      const ids = _.get(index[word], 'ids', []);
      return Array.from(ids);
    });
    const docIdsWithAllWords = _.intersection(...allMatchedDocIds);

    const docIdsWithWordCount = docIdsWithAllWords.map((id) => {
      const totalWordsCount = wordsToMatch.reduce((acc, word) => {
        const newAcc = acc + index[word].inclusionCounts[id];
        return newAcc;
      }, 0);
      return ({ id, totalWordsCount });
    }, []);
    const sortedIds = docIdsWithWordCount.sort((a, b) => b.totalWordsCount - a.totalWordsCount);
    const ids = sortedIds.map((item) => item.id);

    return iter(wordsToMatch.slice(0, wordsToMatch.length - 1), [...result, ids]);
  };

  return iter([...terms], []);
};

const buildSearchEngine = (docs = []) => {
  const index = buildInvertedIndex(docs);

  const search = (token) => {
    const terms = token.match(/\w+/g);
    if (!terms) {
      return [];
    }
    const rankedDocsIds = rankDocuments(index, terms);
    return rankedDocsIds;
  };

  return {
    search,
  };
};

export default buildSearchEngine;
