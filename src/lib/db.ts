import Dexie, { type Table } from 'dexie';

export interface MidjourneyParams {
  version: string;
  aspectRatio: string;
  stylize: number;
  chaos: number;
  quality: number;
  weird: number;
  seed?: number;
  tile: boolean;
  stop: number;
  styleRef: string;
  characterRef: string;
  personalize: string;
  no: string;
}

export interface Prompt {
  id?: number;
  title: string;
  body: string;
  params: MidjourneyParams;
  tags: string[];
  imageDataUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_PARAMS: MidjourneyParams = {
  version: '7',
  aspectRatio: '1:1',
  stylize: 100,
  chaos: 0,
  quality: 1,
  weird: 0,
  seed: undefined,
  tile: false,
  stop: 100,
  styleRef: '',
  characterRef: '',
  personalize: '',
  no: '',
};

class PromptVaultDB extends Dexie {
  prompts!: Table<Prompt>;

  constructor() {
    super('PromptVaultDB');
    this.version(1).stores({
      prompts: '++id, title, *tags, createdAt, updatedAt',
    });
  }
}

export const db = new PromptVaultDB();

// CRUD Operations
export async function addPrompt(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date();
  return db.prompts.add({
    ...prompt,
    createdAt: now,
    updatedAt: now,
  } as Prompt);
}

export async function updatePrompt(id: number, data: Partial<Omit<Prompt, 'id' | 'createdAt'>>): Promise<void> {
  await db.prompts.update(id, {
    ...data,
    updatedAt: new Date(),
  });
}

export async function deletePrompt(id: number): Promise<void> {
  await db.prompts.delete(id);
}

export async function getPrompt(id: number): Promise<Prompt | undefined> {
  return db.prompts.get(id);
}

export async function getAllPrompts(): Promise<Prompt[]> {
  return db.prompts.orderBy('updatedAt').reverse().toArray();
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  version?: string;
  aspectRatio?: string;
}

export async function searchPrompts(filters: SearchFilters): Promise<Prompt[]> {
  let results = await getAllPrompts();

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    results = results.filter((p) =>
      filters.tags!.every((tag) => p.tags.includes(tag))
    );
  }

  if (filters.version) {
    results = results.filter((p) => p.params.version === filters.version);
  }

  if (filters.aspectRatio) {
    results = results.filter((p) => p.params.aspectRatio === filters.aspectRatio);
  }

  return results;
}

export async function getAllTags(): Promise<string[]> {
  const prompts = await db.prompts.toArray();
  const tagSet = new Set<string>();
  prompts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
