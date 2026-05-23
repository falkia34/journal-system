export class Session {
  public constructor(
    public user: {
      id: string;
      name: string;
      emailAddress: string;
      imageUrl: string | null;
    },
    public roles: ('AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMINISTRATOR')[],
    public activeRole: 'AUTHOR' | 'REVIEWER' | 'EDITOR' | 'ADMINISTRATOR',
  ) {}
}
