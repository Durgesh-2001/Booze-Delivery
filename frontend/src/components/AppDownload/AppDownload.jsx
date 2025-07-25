import React from 'react'
import './AppDownload.css'
import { assets } from '../../assets/assets'

const AppDownload = () => {
  return (
    <div className='app-download' id='app-download'>
      <h2>Drink Smart, Order Smarter</h2>
      <p>Get the <b>Booze Delivery</b> app for the smoothest alcohol delivery experience on your phone</p>
      <div className='app-download-platforms'>
        <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
          <img src={assets.play_store} alt="Get it on Google Play" />
        </a>
        <a href="https://www.apple.com/app-store" target="_blank" rel="noopener noreferrer">
          <img src={assets.app_store} alt="Download on App Store" />
        </a>
      </div>
    </div>
  )
}

export default AppDownload
