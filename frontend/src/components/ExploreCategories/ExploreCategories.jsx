import React from 'react'
import './ExploreCategories.css'
import { menu_list } from '../../assets/assets'

const ExploreCategories = ({ category, setCategory }) => {
  return (
    <div className='explore-categories' id='explore-categories'>
      <h1>Explore Alcohol Categories</h1>
      <p className='explore-categories-text'>
      From smooth whisky to crisp beers — tap your favorite and get it delivered 🍸
      </p>
      <div className='explore-categories-list'>
        {menu_list.map((item, index) => (
          <div
            onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)}
            key={index}
            className='explore-categories-item'
          >
            <img
              className={category === item.menu_name ? "active" : ""}
              src={item.menu_image}
              alt={item.menu_name}
            />
            <p>{item.menu_name}</p>
          </div>
        ))}
      </div>
      <hr />
    </div>
  )
}

export default ExploreCategories
