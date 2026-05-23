export type UserFilterOptions = {
  name?: string;
  email?: string;
  role?: User['roles'][number];
};

export type UserSortOptions = {
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
  name?: 'ASC' | 'DESC';
  email?: 'ASC' | 'DESC';
};

export class User {
  public constructor(
    public id: string,
    public name: string,
    public email: string,
    public roles: ('AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMINISTRATOR')[],
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
