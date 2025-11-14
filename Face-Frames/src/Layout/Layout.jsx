import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../components/Footer";
import './Layout.css';

function Layout() {
    return (
        <div className="flex flex-col bg-white text-black dark:bg-gray-800 dark:text-white min-h-screen">
            <header>
                <Navbar/>
            </header>

            {/* El main hereda el color de fondo y de texto del padre. Solo ajustamos el padding. */}
            <main className="py-2 grow">
                <Outlet />
            </main>

            {/* Usamos un footer semántico y clases responsivas para su propio fondo */}
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Layout;