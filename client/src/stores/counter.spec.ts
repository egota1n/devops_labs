import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from './counter'

describe('Counter Store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('increments', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
    store.increment()
    expect(store.count).toBe(1)
  })

  it('decrements', () => {
    const store = useCounterStore()
    store.decrement()
    expect(store.count).toBe(-1)
  })
})
