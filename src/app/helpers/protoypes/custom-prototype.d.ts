interface IChangeParams {
  [index: string]: any;
}

interface String {
  change(model: IChangeParams): string;

  getExtension(): string;
}

interface Window {
  getConfigMergeProperties(): { scope: string, properties: string[] };
  getPrivateBuild(): string;
}
