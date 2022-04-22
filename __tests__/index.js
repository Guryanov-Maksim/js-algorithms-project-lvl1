import { test, expect } from '@jest/globals';
import buildSearchEngine from '../src/index.js';

const doc1 = { id: 'doc1', text: "I can't SHooT straight unless I've had a pint!" };
const doc2 = { id: 'doc2', text: "Don't shoot shoot shoot that thing at him." };
const doc3 = { id: 'doc3', text: "I'm your shooter." };
const doc4 = { id: 'doc4', text: "Don't shoot that thing at me." };
const doc5 = { id: 'doc5', text: 'Please shoot that thing at a small bottle.' };
const docs = [doc1, doc2, doc3, doc4, doc5];

const expectedResults = ['doc2', 'doc1', 'doc4', 'doc5'];
const expectedResults2 = ['doc1'];
const expectedResults3 = ['doc4', 'doc5', 'doc2', 'doc1'];

test('clear search', () => {
  const searchEngineWithDocs = buildSearchEngine(docs);
  const searchEngineWithoutDocs = buildSearchEngine([]);

  // punctuation marks
  expect(searchEngineWithDocs.search('pint')).toEqual(expectedResults2);
  expect(searchEngineWithDocs.search('pint!')).toEqual(expectedResults2);

  expect(searchEngineWithDocs.search('shoot')).toEqual(expectedResults);
  expect(searchEngineWithDocs.search('shoot at me')).toEqual(expectedResults3);
  expect(searchEngineWithDocs.search('mismatch')).toEqual([]);
  expect(searchEngineWithDocs.search('')).toEqual([]);
  expect(searchEngineWithoutDocs.search('shoot')).toEqual([]);
  expect(searchEngineWithoutDocs.search('')).toEqual([]);
});
