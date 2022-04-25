import _ from 'lodash';
import pluralize from 'pluralize';

const normalizeWord = (word) => pluralize.singular(word.toLowerCase());

const parseDocuments = (docs) => docs.reduce((acc, { id, text }) => {
  let newAcc = { ...acc };
  const terms = [...text.match(/[\w+']+/gi)];

  terms.forEach((term) => {
    const normalizedWord = normalizeWord(term);
    const wordData = newAcc[normalizedWord] || { ids: new Set(), matchedDocsData: {} };
    const { ids, matchedDocsData } = wordData;
    ids.add(id);
    const prevCount = _.get(matchedDocsData[id], 'wordCountInDoc', 0);
    newAcc = {
      ...newAcc,
      [normalizedWord]: {
        ids,
        matchedDocsData: {
          ...matchedDocsData,
          [id]: {
            wordCountInDoc: prevCount + 1,
            wordsInDoc: terms.length,
          },
        },
      },
    };
  });

  return newAcc;
}, {});

const buildInvertedIndex = (documents) => {
  if (documents.length === 0) {
    return {};
  }

  const parsedDocsData = parseDocuments(documents);

  const docDataWithTfIdf = Object.entries(parsedDocsData).map(([word, data]) => {
    const { ids, matchedDocsData } = data;
    const idf = Math.log(documents.length / [...ids].length);
    const ftIdfs = Object.entries(matchedDocsData).map(([id, { wordCountInDoc, wordsInDoc }]) => {
      const tf = wordCountInDoc / wordsInDoc;
      const tfIdf = tf * idf;
      return [id, tfIdf];
    });

    return [word, { ids, tfIdfs: Object.fromEntries(ftIdfs) }];
  });

  return Object.fromEntries(docDataWithTfIdf);
};

const rankDocuments = (index, targetWords) => {
  const iter = (wordsToMatch, result) => {
    if (wordsToMatch.length === 0) {
      return _.union(...result);
    }
    const allMatchedDocIds = wordsToMatch.map((word) => {
      const ids = _.get(index[word], 'ids', []);
      return Array.from(ids);
    });
    const docIdsWithAllWords = _.intersection(...allMatchedDocIds);

    const docIdsWithWordWeight = docIdsWithAllWords.map((id) => {
      const wordsTotalWeight = wordsToMatch.reduce((acc, word) => {
        const newAcc = acc + index[word].tfIdfs[id];
        return newAcc;
      }, 0);
      return ({ id, wordsTotalWeight });
    });
    const sortedIds = docIdsWithWordWeight
      .sort((a, b) => b.wordsTotalWeight - a.wordsTotalWeight)
      .map(({ id }) => id);

    return iter(wordsToMatch.slice(0, wordsToMatch.length - 1), [...result, sortedIds]);
  };

  return iter(targetWords, []);
};

const buildSearchEngine = (docs = []) => {
  const index = buildInvertedIndex(docs);

  const search = (token) => {
    const terms = token.match(/\w+/g);
    if (!terms) {
      return [];
    }
    const normalizedTargetWords = [...terms].map(normalizeWord);
    const rankedDocsIds = rankDocuments(index, normalizedTargetWords);
    return rankedDocsIds;
  };

  return {
    search,
  };
};

export default buildSearchEngine;
