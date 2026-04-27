import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Query1 from './Query1'
import Query2 from './Query2'
// import Query3 from './Query3'

function Home() {
  return (
    <div className="container">
      Please select a query to begin
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="page">
        <nav className="navbar">
          <div className="navbar-content">
            <ul className="navbar-menu">
              <li><Link to="/query1">Query 1</Link></li>
              <li><Link to="/query2">Query 2</Link></li>
              {/* <li><Link to="/query3">Query 3</Link></li> */}
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/query1" element={<Query1 />} />
          <Route path="/query2" element={<Query2 />} />
          {/* <Route path="/query3" element={<Query3 />} /> */}
        </Routes>
      </div>
    </Router>
  )
}

export default App