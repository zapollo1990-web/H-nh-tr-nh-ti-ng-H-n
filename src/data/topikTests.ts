import { TopikTest } from '../types';
import { TOPIK_TESTS_PART_1 } from './topikTestsData1';
import { TOPIK_TESTS_PART_2 } from './topikTestsData2';
import { TOPIK_TESTS_PART_3 } from './topikTestsData3';

// TỔNG HỢP TOÀN BỘ ĐỀ THI THỬ TOPIK I & TOPIK II (TỪ CẤP ĐỘ 1 ĐẾN CẤP ĐỘ 6)
export const TOPIK_TESTS: TopikTest[] = [
  ...TOPIK_TESTS_PART_1,
  ...TOPIK_TESTS_PART_2,
  ...TOPIK_TESTS_PART_3,
];

export { TOPIK_TESTS_PART_1, TOPIK_TESTS_PART_2, TOPIK_TESTS_PART_3 };

