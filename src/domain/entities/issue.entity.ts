export class Issue {
  public constructor(
    public id: string,
    public journalId: string,
    public volume: number,
    public number: number,
    public title: string | null,
    public description: string | null,
    public publishedAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date,
    public journal?: import('./journal.entity').Journal,
    public publications?: import('./publication.entity').Publication[],
  ) {}
}

export type IssueSortOptions = {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  publishedAt?: 'asc' | 'desc';
  volume?: 'asc' | 'desc';
  number?: 'asc' | 'desc';
};

export type IssueFilterOptions = {
  journalId?: string;
  published?: boolean;
};

export type IssueIncludeOptions = Array<'journal' | 'publications'>;
