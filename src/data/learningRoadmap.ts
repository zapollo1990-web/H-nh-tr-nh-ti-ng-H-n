import { RoadmapStage } from '../types';
import { BEGINNER_STAGES } from './stages/beginnerStages';
import { INTERMEDIATE_STAGES } from './stages/intermediateStages';
import { ADVANCED_STAGES } from './stages/advancedStages';

export const ROADMAP_STAGES: RoadmapStage[] = [
  ...BEGINNER_STAGES,
  ...INTERMEDIATE_STAGES,
  ...ADVANCED_STAGES,
];

export { BEGINNER_STAGES, INTERMEDIATE_STAGES, ADVANCED_STAGES };
