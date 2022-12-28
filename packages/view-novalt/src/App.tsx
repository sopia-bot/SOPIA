import { useEffect, useState } from 'react'
import SystemBar from './components/system-bar'
import RouterWrapper from './components/router-wrapper'
import './App.css'
import { HashRouter } from 'react-router-dom'


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="main-wrapper">
      <SystemBar></SystemBar>
      <div className='main-space-wrapper'>
        <div className='main-space'>
          <HashRouter>
            <RouterWrapper />
          </HashRouter>
        </div>
      </div>
    </div>
  )
}

export default App
