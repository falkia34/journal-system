export class File {
  public constructor(
    public id: string,
    public filename: string,
    public originalName: string,
    public mimeType: string,
    public size: number,
  ) {}
}
