export class User {
  public constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public roles: ('Author' | 'Reviewer' | 'Editor' | 'Administrator')[],
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export type UserSortOptions = {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  name?: 'asc' | 'desc';
  email?: 'asc' | 'desc';
};

export type UserFilterOptions = {
  name?: string;
  email?: string;
  role?: User['roles'][number];
};
