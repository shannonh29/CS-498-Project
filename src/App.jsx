import { useMemo, useState } from 'react'
import './App.css'

function getTomorrow(dateString) {
  const date = new Date(dateString)
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}

function formatPrice(price) {
  if (price == null || price === '') return 'N/A'
  const numericPrice = Number(String(price).replace(/[^\d.]/g, ''))
  return Number.isNaN(numericPrice) ? String(price) : `$${numericPrice.toFixed(2)}`
}

function App() {
  const today = useMemo(() => {
    const now = new Date()
    return now.toISOString().split('T')[0]
  }, [])

  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(getTomorrow(today))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:3000/api/query1?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
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

  function handleStartDateChange(value) {
    setStartDate(value)
    setEndDate(getTomorrow(value))
  }

  return (
    <div className="page">
      <div className="container">
        <header>
          <h1>Airbnb Query 1</h1>
          <p>
            Search available Portland listings for a required two-day period and sort them by average
            rating.
          </p>
        </header>

        <section className="card">
          <form onSubmit={handleSubmit} className="form">
            <div className="field-group">
              <label htmlFor="start-date">Start date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) => handleStartDateChange(event.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="end-date">End date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
              <small>For Query 1, this must be exactly one day after the start date.</small>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search listings'}
            </button>
          </form>
        </section>

        {error ? <div className="alert error">{error}</div> : null}

        {data ? (
          <section className="results">
            <div className="results-summary">
              <h2>Results</h2>
              <p>
                {data.count} listing{data.count === 1 ? '' : 's'} found from {data.start_date} to{' '}
                {data.end_date}.
              </p>
            </div>

            <div className="listings-grid">
              {data.results.map((listing) => (
                <article className="listing-card" key={listing._id}>
                  <h3>{listing.name}</h3>
                  <p><strong>Neighborhood:</strong> {listing.neighborhood || 'N/A'}</p>
                  <p><strong>Room type:</strong> {listing.room_type || 'N/A'}</p>
                  <p><strong>Accommodates:</strong> {listing.accommodates ?? 'N/A'}</p>
                  <p><strong>Property type:</strong> {listing.property_type || 'N/A'}</p>
                  <p><strong>Average rating:</strong> {listing.avg_rating ?? 'N/A'}</p>
                  <p><strong>Price per night:</strong> {formatPrice(listing.price)}</p>
                  <div>
                    <strong>Amenities:</strong>
                    {Array.isArray(listing.amenities) && listing.amenities.length > 0 ? (
                      <ul>
                        {listing.amenities.slice(0, 10).map((amenity, index) => (
                          <li key={`${listing._id}-${amenity}-${index}`}>{amenity}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>N/A</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}

export default App