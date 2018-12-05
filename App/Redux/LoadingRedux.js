import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  onLoad: ['id'],
  onStopLoading: ['id']
})

export const LoadingTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const LoadingId = {
  Initializing: 'Initializing',
  Scanning: 'Scanning',
  StoppingScan: 'StoppingScan',
  Connecting: 'connecting',
  Disconnecting: 'disconnecting'
}

export const INITIAL_STATE = Immutable({
  loadingList: {}
})

/* ------------- Selectors ------------- */

export const LoadingSelectors = {
  isLoading: (state) => Object.keys(state.loading.loadingList).length > 0
}

/* ------------- Reducers ------------- */

export const addLoad = (state, { id }) => {
  return state.merge({
    loadingList: {
      ...state.loadingList,
      [id]: state.loadingList[id] !== undefined ? state.loadingList[id] + 1 : 1
    }
  })
}

export const removeLoad = (state, { id }) => {
  const previous = state.loadingList[id]

  if (previous === undefined) {
    return state
  } else if (previous <= 1) {
    return state.merge({
      loadingList: Object.keys(state.loadingList).reduce((result, key) => {
        if (key !== id) result[key] = state.loadingList[key]
        return result
      }, {})
    })
  } else {
    return state.merge({
      loadingList: {
        ...state.loadingList,
        [id]: previous - 1
      }
    })
  }
}

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.ON_LOAD]: addLoad,
  [Types.ON_STOP_LOADING]: removeLoad
})
