import React from 'react'
import './Navbar.css'
import menu_icon from '../../assets/menu.png'
import logo from '../../assets/logo.png'
import search_icon from '../../assets/search.png'
import upload_icon from '../../assets/upload.png'
import more_icon from '../../assets/more.png'
import notification_icon from '../../assets/notification.png'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = ({ setSidebar }) => {
    const navigate = useNavigate();

    const sidebar_toggle = () => {
        setSidebar((prev) => !prev);
    }

    const handleClick = () => {
        navigate("/profile");
    }

    return (
        <nav className='flex-div'>
            <div className="nav-left flex-div">
                <img src={menu_icon} alt="" className="menu-icon" onClick={sidebar_toggle} />
                <Link to='/'> <img src={logo} alt="" className="logo" /></Link>
            </div>
            <div className="nav-middle flex-div">
                <div className="search-box flex-div">
                    <input type="text" placeholder="Search" />
                    <img src={search_icon} alt="" />
                </div>
            </div>
            <div className="nav-right flex-div">
                <img src={upload_icon} alt="" />
                <img src={more_icon} alt="" />
                <img src={notification_icon} alt="" />

                {/* ✅ Make profile image clickable */}
                <div onClick={handleClick} style={{ cursor: "pointer" }}>
                    <img
                        src={`https://ui-avatars.com/api/?name=Bennett+Thong`}
                        alt="ProfilePic"
                        className="user-icon"
                    />
                </div>
            </div>
        </nav>
    )
}

export default Navbar
