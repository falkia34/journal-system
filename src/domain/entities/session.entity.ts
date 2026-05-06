export class Session {
  public constructor(
    public user: {
      id: string;
      name: string;
      emailAddress: string;
    },
    public roles: ('Author' | 'Reviewer' | 'Editor' | 'Administrator')[],
    public expiresAt: Date,
  ) {}
}
