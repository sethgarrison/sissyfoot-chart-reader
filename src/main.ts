import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import DebugPage from './DebugPage.svelte'
import AdminPage from './AdminPage.svelte'

const getHashRoute = () => {
  const h = window.location.hash?.replace(/^#\/?/, '') || ''
  return h
}

const target = document.getElementById('app')!
const route = getHashRoute()
const Component =
  route === 'admin' ? AdminPage : route === 'debug' ? DebugPage : App
const app = mount(Component, { target })

// Re-mount when hash changes (e.g. navigate to/from #debug or #admin)
window.addEventListener('hashchange', () => {
  const newRoute = getHashRoute()
  const newComponent =
    newRoute === 'admin' ? AdminPage : newRoute === 'debug' ? DebugPage : App
  if (Component !== newComponent) {
    window.location.reload()
  }
})

export default app
