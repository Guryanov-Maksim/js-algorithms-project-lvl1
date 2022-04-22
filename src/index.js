import _ from 'lodash';
import pluralize from 'pluralize';

const buildInvertedIndex = (docs) => {
  if (docs.length === 0) {
    return {};
  }
  console.log(docs);
  const allWordsInDocs = docs.reduce((acc, { text }) => {
    const words = [...text.match(/[\w+']+/gi)];
    words.forEach((word) => {
      const singleWord = pluralize.singular(word.toLowerCase());
      acc.add(singleWord);
    });
    return acc;
  }, new Set());

  const docDataWithTermFrequency = [...allWordsInDocs].reduce((acc, word) => {
    let newAcc = { ...acc };
    for (let i = 0; i < docs.length; i += 1) {
      const { id, text } = docs[i];
      const words = [...text.match(/[\w+']+/gi)].map((w) => pluralize.singular(w.toLowerCase()));
      if (words.includes(word)) {
        const count = words.filter((w) => w === word);
        const { ids, counts } = _.get(newAcc, word, { ids: [], counts: { [id]: 0 } });
        newAcc = {
          ...newAcc,
          [word]: {
            ids: [...ids, id],
            counts: {
              ...counts,
              [id]: count.length / words.length,
            },
          },
        };
      }
    }

    return newAcc;
  }, {});

  const docDataWithTfIdf = Object.entries(docDataWithTermFrequency).map(([word, data]) => {
    const { ids, counts } = data;
    const idf = Math.log(docs.length / ids.length);
    const tfs = Object.entries(counts);
    const ftIdfs = tfs.map(([id, tf]) => {
      const tfIdf = tf * idf;
      return [id, tfIdf];
    });

    return [word, { ids, ftIdfs: Object.fromEntries(ftIdfs) }];
  });
  console.log(Object.fromEntries(docDataWithTfIdf));

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

    const docIdsWithWordCount = docIdsWithAllWords.map((id) => {
      const totalWordsCount = wordsToMatch.reduce((acc, word) => {
        const newAcc = acc + index[word].ftIdfs[id];
        return newAcc;
      }, 0);
      return ({ id, totalWordsCount });
    }, []);
    const sortedIds = docIdsWithWordCount.sort((a, b) => b.totalWordsCount - a.totalWordsCount);
    console.log(sortedIds);
    const ids = sortedIds.map((item) => item.id);

    return iter(wordsToMatch.slice(0, wordsToMatch.length - 1), [...result, ids]);
  };

  return iter(targetWords, []);
};

const buildSearchEngine = (docs = []) => {
  const index = buildInvertedIndex(docs);

  const search = (token) => {
    console.log(token);
    const terms = token.match(/\w+/g);
    if (!terms) {
      return [];
    }
    const singleWords = [...terms].map((word) => pluralize.singular(word.toLowerCase()));
    const rankedDocsIds = rankDocuments(index, singleWords);
    return rankedDocsIds;
  };

  return {
    search,
  };
};

export default buildSearchEngine;
