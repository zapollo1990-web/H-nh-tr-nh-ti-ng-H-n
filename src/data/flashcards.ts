import { Flashcard } from '../types';
import rawVocab from './massiveVocab.json';
import { ANIMALS_PLANTS_VOCAB } from './animalsPlantsVocab';

export const INITIAL_FLASHCARDS: Flashcard[] = [
  ...ANIMALS_PLANTS_VOCAB,
  ...(rawVocab as Flashcard[]),
];
