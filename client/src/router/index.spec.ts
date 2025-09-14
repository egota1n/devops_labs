import { routes } from './index'

describe('Router', () => {
  it('has home route', () => {
    const homeRoute = routes.find(r => r.name === 'Home')
    expect(homeRoute).toBeDefined()
  })
})
