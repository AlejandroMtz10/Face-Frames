/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { GiSunglasses, GiHamburgerMenu } from "react-icons/gi";
import logo from "../../assets/resources/FaceFrames.png";
import ThemeToggle from "../ThemeToggle";
import "./Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="w-full bg-emerald-800 text-white shadow-md py-2 transition duration-500">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="Face Frames" className="w-32 h-auto rounded-xl" />
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-x-4">
          {/* Desktop Links */}
          <ul className="hidden sm:flex items-center gap-x-4">
            <Link to="/">
              <li className="flex flex-col items-center text-xl hover:underline hover:text-blue-500 duration-300">
                <IoHomeOutline />
                Home
              </li>
            </Link>
            <Link to="/Glasses">
              <li className="flex flex-col items-center text-xl hover:underline hover:text-blue-500 duration-300">
                <GiSunglasses />
                Glasses
              </li>
            </Link>

            {/* 👇 Aquí usamos el nuevo componente ThemeToggle */}
            <ThemeToggle />
          </ul>

          {/* Botón Hamburguesa (solo móvil) */}
          <div className="sm:hidden">
            <button
              onClick={toggleMenu}
              id="btn_menu"
              name="btn_menu"
              className="text-3xl"
            >
              <GiHamburgerMenu />
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <ul
          className={`sm:hidden flex flex-col items-center gap-2 pb-4 animate-slide-down bg-emerald-700 dark:bg-gray-800`}
        >
          <Link to="/" onClick={toggleMenu}>
            <li className="flex items-center gap-2 text-xl hover:underline hover:text-sky-500">
              <IoHomeOutline /> Home
            </li>
          </Link>

          <Link to="/Glasses" onClick={toggleMenu}>
            <li className="flex items-center gap-2 text-xl hover:underline hover:text-sky-500">
              <GiSunglasses /> Glasses
            </li>
          </Link>

          {/* 👇 ThemeToggle también en el menú móvil */}
          <li className="p-2 mt-2 w-full flex justify-center">
            <ThemeToggle />
          </li>
        </ul>
      )}
    </div>
  );
}

export default Navbar;