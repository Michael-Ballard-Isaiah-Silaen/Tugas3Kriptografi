import {useContext, useEffect, useState} from "react";
import {CurrentUserContext} from "../lib/contexts/CurrentUserContext";
import {NavLink, useNavigate} from "react-router-dom";
import {RxHamburgerMenu} from "react-icons/rx";
import {twMerge} from "tailwind-merge";
import {NavHashLink} from "react-router-hash-link";

const Navbar = () => {
  const navigate = useNavigate();
  const currentUserContext = useContext(CurrentUserContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  if (!currentUserContext){
    return null;
  }
  const {currentUser, setCurrentUser} = currentUserContext;
  const handleLogout = () => {
    localStorage.setItem("access_token", "");
    setCurrentUser(null);
    navigate("/auth/sign-in");
  };
  const className = {
    navBarScrolled: twMerge(
      `${isScrolled ? "h-16 backdrop-blur-md bg-white/70 shadow-md" : "h-24"}`,
      ` ${isMobileMenuOpen && "bg-white"}`
    ),
    buttonScrolled: isScrolled ? "py-2" : "py-4",
  };

  return (
    <header
      className={`fixed left-0 top-0 z-[100] flex w-screen items-center justify-between px-6 font-[500] duration-100 ease-in lg:px-24 ${className.navBarScrolled}`}
    >
      <NavLink
        to="/"
        className="text-2xl font-bold tracking-wide text-red-700"
      >
        Ave Maria
      </NavLink>
      <div className="flex gap-4">
        <nav className="hidden items-center justify-center gap-8 md:flex">
          <NavHashLink to="/" smooth className="hover:text-red-600">
            Home
          </NavHashLink>
          <NavLink to="/contacts" className="hover:text-red-600">
            Contacts
          </NavLink>
        </nav>
        {currentUser?.email ? (
          <div className="group relative rounded-full border-2 border-red-400 px-6 py-1 hover:bg-red-600">
            <p>{currentUser?.username}</p>
            <div className="absolute bottom-0 right-0 h-0 translate-y-[100%] p-2 pt-4 opacity-0 group-hover:h-fit group-hover:opacity-100">
              <div className="hidden flex-col items-stretch rounded-lg border-[1px] bg-white p-2 text-start shadow-md group-hover:flex">
                <button
                  className="p-1 pr-8 text-red-600 hover:text-red-400"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <NavLink
              to="/auth/sign-up"
              className={`px-6 text-black duration-100 ease-in ${className.buttonScrolled}`}
            >
              <p>Sign Up</p>
            </NavLink>
            <NavLink
              to="/auth/sign-in"
              className={`rounded-md bg-red-500 px-6 text-white duration-100 ease-in hover:bg-red-700 ${className.buttonScrolled}`}
            >
              <p>Sign In</p>
            </NavLink>
          </div>
        )}
        <div className="flex h-full items-center justify-center md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <RxHamburgerMenu size={35} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;