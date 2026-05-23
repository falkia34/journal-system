export class PaginationOptions {
  public constructor(
    public take: number = 25,
    public cursor?: string,
    public nextCursor?: string,
    public previousCursor?: string,
  ) {}
}
