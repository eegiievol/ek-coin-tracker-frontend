import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Analyzer from './pages/Analyzer'
import Volume24h from './pages/Volume24h'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Home />}      />
        <Route path="/analyzer"   element={<Analyzer />}  />
        <Route path="/volume24h"  element={<Volume24h />} />
      </Routes>
    </BrowserRouter>
  )
}
