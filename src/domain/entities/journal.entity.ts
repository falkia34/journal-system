import type { User } from './user.entity';

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

export type JournalSortOptions = {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  name?: 'asc' | 'desc';
};

export type JournalFilterOptions = {
  name?: string;
  editorInChiefId?: string;
};

export type JournalIncludeOptions = Array<'editorInChief'>;
