import { createContext, FC } from 'react'

export interface TangramEntry {
  [name: string]: FC | undefined
}

export enum TangramMode {
  editable = 'editable',
  readonly = 'readonly'
}

export interface TangramState {
  mode: TangramMode
  entry: TangramEntry

  /**
   * The minimum width of a column in percentage.
   */
  readonly minColumnWidthPercentage: number
  /**
   * The minimum height of a row in percentage.
   */
  readonly minRowHeightPercentage: number
}

export interface TangramAction {
  edit: () => void
  read: () => void
}

export type TangramInstance = TangramState & TangramAction

export const TangramContext = createContext<TangramInstance>(undefined!)