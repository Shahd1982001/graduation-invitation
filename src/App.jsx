import ScrollInvite from './components/ScrollInvite.jsx'
import useReducedMotion from './hooks/useReducedMotion.js'
export default function App() {
  return <ScrollInvite reduce={useReducedMotion()} />
}
