import { PhoContext } from './context'

export type TypeName = 'string' | 'number' | 'integer' | 'boolean'
export interface IField {
  fullPath: string
  phoContext: PhoContext
}
