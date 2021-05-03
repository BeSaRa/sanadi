export interface DocumentFieldValidatorInterface {
  documentTitle(val: string): boolean;

  files(val: FileList): boolean;
}
