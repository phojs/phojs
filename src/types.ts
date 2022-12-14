import { PhoContext } from './context'
import {Category} from "./category";

export type TypeName = 'string' | 'number' | 'integer' | 'boolean'
export type ArrayType = TypeName | 'any' | Category
export interface IField {
  fullPath: string
  phoContext: PhoContext
}
