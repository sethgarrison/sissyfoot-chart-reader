import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import DebugPage from './DebugPage.svelte'

const isDebug = () => {
  const h = window.location.hash?.replace(/^#\/?/, '') || ''
  return h === 'debug'
}

const target = document.getElementById('app')!
const showDebug = isDebug()
const Component = showDebug ? DebugPage : App
const app = mount(Component, { target })

// Re-mount when hash changes (e.g. navigate to/from #debug)
window.addEventListener('hashchange', () => {
  if (isDebug() !== (Component === DebugPage)) {
    window.location.reload()
  }
})

export default app
