import React from 'react'
import './AboutUs.css'

const AboutUs = () => {
  return (
    <div className="page-container">
      <div className="about-us-content">
        <h1 className="page-title">About Booze Delivery</h1>

        <section className="main-description">
          <p>Booze Delivery is your go-to platform for fast, reliable, and legal alcohol delivery. Whether it’s a party, a quiet night in, or just happy hour — we bring the bar to your doorstep.</p>
          <ul className="feature-points">
            <li>Wide variety of liquor & mixers</li>
            <li>Top-rated local and international brands</li>
            <li>Instant and scheduled deliveries</li>
          </ul>
        </section>

        <section className="features">
          <h2>What We Offer</h2>
          <div className="feature-grid">
            <div className="feature-item">
              <h3>Instant Delivery</h3>
              <p>Get your favorite drinks delivered in under 60 minutes*</p>
              <ul className="feature-points">
                <li>Real-time tracking</li>
                <li>Verified delivery partners</li>
              </ul>
            </div>
            <div className="feature-item">
              <h3>Exclusive Collections</h3>
              <p>Shop curated collections of wines, whiskies, craft beers, and more</p>
              <ul className="feature-points">
                <li>Seasonal specials</li>
                <li>Top-shelf recommendations</li>
                <li>Mixology bundles</li>
              </ul>
            </div>
            <div className="feature-item">
              <h3>Party Mode</h3>
              <p>Hosting a gathering? We got your back with bulk orders and party kits</p>
              <ul className="feature-points">
                <li>Glassware & garnishes</li>
                <li>Ice delivery options</li>
              </ul>
            </div>
            <div className="feature-item">
              <h3>Safe & Legal</h3>
              <p>We ensure legal compliance with age verification at every step</p>
              <ul className="feature-points">
                <li>Government-approved delivery model</li>
                <li>Strict ID checks</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="tech-stack">
          <h2>Our Technology</h2>
          <p>Built with cutting-edge tech to make your ordering smooth, smart, and secure.</p>
          <ul className="feature-points">
            <li>Live inventory updates</li>
            <li>Seamless in-app ordering</li>
            <li>Smart delivery route optimization</li>
          </ul>
        </section>

        <section className="mission">
          <h2>Our Mission</h2>
          <p>We're here to revolutionize how adults access their favorite drinks — responsibly, reliably, and right to their door.</p>
          <ul className="feature-points">
            <li>Elevate the home drinking experience</li>
            <li>Partner with local businesses</li>
            <li>Promote responsible consumption</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default AboutUs
