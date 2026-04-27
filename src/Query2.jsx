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

function Query2() {
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
        `http://localhost:3000/api/query2?target_month_start=${encodeURIComponent(targetMonthStart)}&target_month_end=${encodeURIComponent(targetMonthEnd)}`
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
        <h1>Airbnb Query 2</h1>
        <p>
          Find neighborhoods in any city that have no available listings during the selected month range.
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
            {loading ? 'Searching...' : 'Find neighborhoods'}
          </button>
        </form>
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      {data ? (
        <section className="results">
          <div className="results-summary">
            <h2>Results</h2>
            <p>
              {data.count} neighborhood{data.count === 1 ? '' : 's'} found from{' '}
              {data.target_month_start} to {data.target_month_end}.
            </p>
          </div>

          {data.results.length > 0 ? (
            <div className="listings-grid">
              {data.results.map((item, index) => (
                <article
                  className="listing-card"
                  key={`${item.city}-${item.neighborhood}-${index}`}
                >
                  <h3>{item.neighborhood}</h3>
                  <p>
                    <strong>City:</strong> {item.city || 'N/A'}
                  </p>
                  <p>
                    <strong>Status:</strong> No available listings found in this month range
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p>No neighborhoods matched this query.</p>
          )}
        </section>
      ) : null}
    </div>
  )
}

export default Query2