import { BabyName } from '../types';

export function getNames(): Promise<BabyName[]>;
export function getNamesByCategory(category: string): Promise<BabyName[]>;
export function searchNames(query: string): Promise<BabyName[]>;
export function getNameById(id: string): Promise<BabyName>;
