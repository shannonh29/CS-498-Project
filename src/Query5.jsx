import { useState } from 'react'
import './App.css'

function Query5() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3000/api/query5')
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message || 'Request failed')
      }

      setData(json)
    } catch (err) {
      setData(null)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // 🔑 Group results by city
  const groupedData = data?.results.reduce((acc, item) => {
    if (!acc[item.city]) {
      acc[item.city] = []
    }
    acc[item.city].push(item)
    return acc
  }, {})

  return (
    <div className="container">
      <header>
        <h1>Airbnb Query 5</h1>
        <p>December review counts grouped by city and year.</p>
      </header>

      <section className="card">
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Loading...' : 'Search December Reviews'}
        </button>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      {groupedData ? (
        <section className="results">
          <h2>Results</h2>

          {Object.entries(groupedData).map(([city, rows]) => (
            <div key={city} className="city-section">
              <h3>{city}</h3>

              <table className="results-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Review Count</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((item) => (
                    <tr key={`${city}-${item.year}`}>
                      <td>{item.year}</td>
                      <td>{item.review_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  )
}

export default Query5