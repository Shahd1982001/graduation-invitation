import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './styles.css'

const root = createRoot(document.getElementById('root'))
root.render(<ErrorBoundary><App /></ErrorBoundary>)

// في التطوير: لو انقطعت نسخة Vite أثناء التشغيل، نعيد التحميل مرة واحدة تلقائيًا
if (import.meta.hot) {
  import.meta.hot.on('vite:ws:disconnect', () => {
    if (!sessionStorage.getItem('vite-reloaded')) {
      sessionStorage.setItem('vite-reloaded', '1')
      window.location.reload()
    }
  })
  import.meta.hot.on('vite:connect', () => sessionStorage.removeItem('vite-reloaded'))
}
