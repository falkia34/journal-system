import { Journal } from './journal';
import { Publication } from './publication';

export type IssueIncludeOptions = ('journal' | 'publications')[];

export type IssueFilterOptions = {
  journalId?: string;
  published?: boolean;
};

export type IssueSortOptions = {
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
  publishedAt?: 'ASC' | 'DESC';
  volume?: 'ASC' | 'DESC';
  number?: 'ASC' | 'DESC';
};

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
    public journal?: Journal,
    public publications?: Publication[],
  ) {}
}
