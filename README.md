### Hexlet tests and linter status:
[![Actions Status](https://github.com/Guryanov-Maksim/js-algorithms-project-lvl1/workflows/hexlet-check/badge.svg)](https://github.com/Guryanov-Maksim/js-algorithms-project-lvl1/actions)

# Search engine

It is a simple search engine. This engine let you save documents you want to look through and find all the document ids with a phrase you want to find.

## Installation

      git clone https://github.com/Guryanov-Maksim/js-algorithms-project-lvl1.git search-engine
      cd search-engine
      make install

## Use

It is as simple as ride a bike

      import buildSearchEngine from '@hexlet-code';

      const doc1 = { id: 'doc1', text: "I can't shoot straight unless I've had a pint!" };
      const doc2 = { id: 'doc2', text: "Don't shoot shoot shoot that thing at me." };
      const doc3 = { id: 'doc3', text: "I'm your shooter." };

      const docs = [doc1, doc2, doc3];

      const searchEngine = buildSearchEngine(docs);

      cosnt result = searchEngine.search('shoot at me'); 
      
      console.log(result);  // ['doc2', 'doc1']