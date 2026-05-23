import type { User } from './user';

export type JournalIncludeOptions = 'editorInChief'[];

export type JournalFilterOptions = {
  name?: string;
  editorInChiefId?: string;
};

export type JournalSortOptions = {
  name?: 'ASC' | 'DESC';
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
};

export class Journal {
  public constructor(
    public id: string,
    public name: string,
    public description: string,
    public editorInChiefId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public editorInChief?: User,
  ) {}
}
