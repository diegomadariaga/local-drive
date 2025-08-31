export class FileEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public content: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
