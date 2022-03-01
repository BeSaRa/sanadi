export interface IServiceConstructor {
  new(): IServiceConstructor;
  caseType: number;
}
