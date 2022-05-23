import { ClassConstructor } from '@app-types/constructor'

export interface CastResponseContract {
  fallback: string
  unwrap?: string
  shape?: Record<string, () => ClassConstructor<any>>
}
