import basket_icon from './basket_icon.png'
import logo from './logo.png'
import header_img from './header_img.png'
import search_icon from './search_icon.png'
import order_icon from './order_icon.png'
import bell_icon from './bell_icon.gif'


import menu_1 from './menu_1.png'
import menu_2 from './menu_2.png'
import menu_3 from './menu_3.png'
import menu_4 from './menu_4.png'
import menu_5 from './menu_5.png'
import menu_6 from './menu_6.png'
import menu_7 from './menu_7.png'
import menu_8 from './menu_8.png'

import app_store from './app_store.png'
import play_store from './play_store.png'
import linkedin_icon from './linkedin_icon.png'
import instagram_icon from './instagram_icon.png'
import twitter_icon from './twitter_icon.png'
import cross_icon from './cross_icon.png'


export const assets = {
    logo,
    basket_icon,
    header_img,
    bell_icon,
    search_icon,
    order_icon,
    app_store,
    play_store,
    linkedin_icon,
    instagram_icon,
    twitter_icon,
    cross_icon,
}
export const menu_list = [
    {
        menu_name: "Whiskey",
        menu_image: menu_1
    },
    {
        menu_name: "Vodka",
        menu_image: menu_2
    },
    {
        menu_name: "Rum",
        menu_image: menu_3
    },
    {
        menu_name: "Gin",
        menu_image: menu_4
    },
    {
        menu_name: "Tequila",
        menu_image: menu_5
    },
    {
        menu_name: "Brandy",
        menu_image: menu_6
    },
    {
        menu_name: "Beer",
        menu_image: menu_7
    },
    {
        menu_name: "Wine",
        menu_image: menu_8
    }
   ]
export const url = '`${import.meta.env.VITE_API_BASE_URL}'

//['Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Brandy', 'Liqueur', 'Beer', 'Wine']