import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { PURGE } from 'redux-persist'
import { PartialRecord } from '../../types'

export interface PriceState {
  // followingPriceAddresses: string[]
  followingPriceData: PartialRecord<string, string>
}

const initialState: PriceState = {
  // followingPriceAddresses: [],
  followingPriceData: {},
}

export const priceSlice = createSlice({
  name: 'price',
  initialState,
  reducers: {
    // addTokensToFollow: (state, action: PayloadAction<string[]>) => {
    //   const set = new Set(state.followingPriceAddresses)
    //   for (const address of action.payload) set.add(address)
    //   state.followingPriceAddresses = Array.from(set)
    // },
    updatePriceData: (state, action: PayloadAction<PartialRecord<string, string>>) => {
      for (const key of Object.keys(action.payload)) {
        state.followingPriceData[key] = action.payload[key]
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState
    })
  },
})

// export const { addTokensToFollow, updatePriceData } = priceSlice.actions
export const { updatePriceData } = priceSlice.actions

export default priceSlice.reducer
