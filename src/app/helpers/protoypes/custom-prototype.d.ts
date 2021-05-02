interface IChangeParams {
  [index: string]: any;
}

interface String {
  change(model: IChangeParams): string;
  getExtension(): string;
}
