import React, { useContext, useState } from 'react';
import './Navbar.css';
import menu_icon from '../../assets/menu.png';
import logo from '../../assets/logo.png';
import search_icon from '../../assets/search.png';
import upload_icon from '../../assets/upload.png';
import more_icon from '../../assets/more.png';
import notification_icon from '../../assets/notification.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthProvider';


const Navbar = ({ setSidebar }) => {
  const navigate = useNavigate();
   const location = useLocation();
  if (
    !['/home', '/profile'].some(path => location.pathname.startsWith(path)) &&
    !location.pathname.startsWith('/search') &&
    !location.pathname.startsWith('/home/video')
) return null;
  const { profileImage, currentUser } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
  if (searchTerm.trim() !== "") {
    navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
  }
};


  const sidebar_toggle = () => {
    setSidebar((prev) => !prev);
  };

  const handleClick = () => {
    navigate("/profile");
  };

  return (
    <nav className='flex-div'>
      <div className="nav-left flex-div">
        <img src={menu_icon} alt="" className="menu-icon" onClick={sidebar_toggle} />
        <Link to='/home'> <img src={logo} alt="" className="logo" /></Link>
      </div>
      <div className="nav-middle flex-div">
        <div className="search-box flex-div">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <img
            src={search_icon}
            alt=""
            style={{ cursor: "pointer" }}
            onClick={handleSearch}
          />
        </div>
      </div>
      <div className="nav-right flex-div">
        <img src={upload_icon} alt="" />
        <img src={more_icon} alt="" />
        <img src={notification_icon} alt="" />

        {/* Profile picture */}
        <div onClick={handleClick} style={{ cursor: "pointer" }}>
          <img
            src={
              profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser?.displayName || currentUser?.email || "User"
              )}`
            }
            alt="ProfilePic"
            className="user-icon"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
