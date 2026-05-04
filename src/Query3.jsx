import { useMemo, useState } from 'react'
import './App.css'

function formatDate(date) {
  return date.toLocaleDateString('en-CA')
}

function getFirstDayOfCurrentMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function getFirstDayOfNextMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

function Query3() {
  const defaultStart = useMemo(() => formatDate(getFirstDayOfCurrentMonth()), [])
  const defaultEnd = useMemo(
    () => formatDate(getFirstDayOfNextMonth(getFirstDayOfCurrentMonth())),
    []
  )

  const [targetMonthStart, setTargetMonthStart] = useState(defaultStart)
  const [targetMonthEnd, setTargetMonthEnd] = useState(defaultEnd)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:3000/api/query3?target_month_start=${encodeURIComponent(targetMonthStart)}&target_month_end=${encodeURIComponent(targetMonthEnd)}`
      )

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

  return (
    <div className="container">
      <header>
        <h1>Airbnb Query 3</h1>
        <p>
          Show bookable availability periods for Salem Entire home/apt listings during a selected month.
        </p>
      </header>

      <section className="card">
        <form onSubmit={handleSubmit} className="form">
          <div className="field-group">
            <label htmlFor="target-month-start">Month start</label>
            <input
              id="target-month-start"
              type="date"
              value={targetMonthStart}
              onChange={(event) => setTargetMonthStart(event.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="target-month-end">Month end</label>
            <input
              id="target-month-end"
              type="date"
              value={targetMonthEnd}
              onChange={(event) => setTargetMonthEnd(event.target.value)}
              required
            />
            <small>
              Use the first day of the month as the start and the first day of the next month as the end.
            </small>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Find availability periods'}
          </button>
        </form>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      {data ? (
        <section className="results">
          <div className="results-summary">
            <h2>Results</h2>
            <p>
              {data.count} bookable period{data.count === 1 ? '' : 's'} found for {data.city}.
            </p>
          </div>

          {data.results.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Listing Name</th>
                  <th>Month</th>
                  <th>Available From</th>
                  <th>Available To</th>
                  <th>Minimum Nights</th>
                </tr>
              </thead>

              <tbody>
                {data.results.map((item, index) => (
                  <tr key={`${item.listing_id}-${item.availability_from}-${index}`}>
                    <td>{item.name}</td>
                    <td>{item.month}</td>
                    <td>{item.availability_from}</td>
                    <td>{item.availability_to}</td>
                    <td>{item.minimum_nights}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No bookable availability periods found.</p>
          )}
        </section>
      ) : null}
    </div>
  )
}

export default Query3