import types from './assembleTypes'
import opOrder from './operationOrder'
import cleanup from './cleanup'

export const stages = [[types, cleanup], [opOrder]]
