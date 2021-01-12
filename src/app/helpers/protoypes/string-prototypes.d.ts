interface String {
  change(model: IChangeParams): string;
}

interface IChangeParams {
  [index: string]: any;
}
