export abstract class BaseModel {
  // @ts-ignore
  id: number;
  arName: string = '';
  enName: string = '';
  updatedBy?: number | undefined;
  updatedOn?: number | undefined;
  clientData?: string | undefined;

  abstract save(): void

  abstract update(): void

  abstract create(): void

  abstract delete(): void
}
