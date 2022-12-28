import { useState } from 'react'
import SystemBar from './components/system-bar'
import './App.css'


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="main-wrapper">
      <SystemBar></SystemBar>
      <div className='main-space-wrapper'>
        <div className='main-space'>
          test
        </div>
      </div>
    </div>
  )
}

export default App
