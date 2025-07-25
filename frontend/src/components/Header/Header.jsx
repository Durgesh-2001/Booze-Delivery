import React from 'react'
import './Header.css'

const Header = ({ setShowLogin }) => {
  const handleViewNow = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setShowLogin(true)
      return
    }
    document.getElementById('explore-categories').scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className='header'>
      <div className="header-contents">
        <h2>Cheers Delivered</h2>
        <p>
          Craving a cold one? 🍻 Get your favorite beers, wines, and spirits delivered straight to your doorstep—fast, fresh, and legal. Explore our wide range of alcoholic beverages and let the party come to you. Whether it's a chill night or a wild weekend, we’ve got your back.
        </p>
        <button onClick={handleViewNow}>View Now</button>
      </div>
    </div>
  )
}

export default Header
