import { ClassConstructor } from '@app-types/constructor'

export interface CastOptionContract {
  model: () => ClassConstructor<any>
  unwrap?: string
  shape?: Record<string, () => ClassConstructor<any>>,
}
