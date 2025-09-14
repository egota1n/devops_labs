import { render, screen } from '@testing-library/vue'
import App from './App.vue'
import router from './router'

test('App mounts without errors', async () => {
  render(App, { global: { plugins: [router] } })
  await router.isReady()
  expect(await screen.findByText('Task Manager')).toBeTruthy()
})
