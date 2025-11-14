import React from "react";
import { FaGithubSquare, FaLinkedin } from "react-icons/fa";
import logo from "../../assets/resources/FaceFrames.png";

function Footer() {
    const footerBg = "bg-emerald-800 text-white";
    const hoverColor = "hover:text-blue-600";

    return (
        <footer className={`w-full ${footerBg} shadow-inner pt-8 mt-12 transition-colors duration-500`}>
            <div className="container mx-auto px-6 sm:px-8">
                <div className="
                    flex flex-col justify-between
                    md:flex-row md:flex-wrap
                    gap-8 pb-8 border-b border-white border-opacity-20
                ">

                    {/* Column 1 */}
                    <div className="w-full md:w-1/2 lg:w-1/4">
                        <div className="flex items-center text-3xl font-extrabold italic select-none mb-3">
                            <img src={logo} alt="Face Frames" className="w-32 h-auto rounded-xl" />
                        </div>
                        <p className="text-sm text-white">
                            Discover your next perfect glasses.
                        </p>
                    </div>

                    {/* Column 2 */}
                    <div className="w-full md:w-1/2 lg:w-1/4">
                        <h3 className="text-xl font-semibold mb-4 border-b-2 border-sky-200 inline-block">
                            Developers
                        </h3>
                        <ul className="space-y-3 text-white">
                            <li>
                                <a href="https://alejandromtz10.github.io/AlejandroDev" className={`text-base duration-300 ${hoverColor}`}>
                                    Developed by
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/AlejandroMtz10/Face-Frames" className={`text-base duration-300 ${hoverColor}`}>
                                    Repository
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div className="w-full md:w-1/2 lg:w-1/4">
                        <h3 className="text-xl font-semibold mb-4 border-b-2 border-sky-200 inline-block">
                            Social Media
                        </h3>
                        <ul className="flex space-x-5 mt-2">
                            <li>
                                <a href="https://github.com/AlejandroMtz10" className={`text-6xl duration-300 ${hoverColor}`} aria-label="GitHub">
                                    <FaGithubSquare />
                                </a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/in/alejandro-martínez-rivera-a35541248" className={`text-6xl duration-300 ${hoverColor}`} aria-label="LinkedIn">
                                    <FaLinkedin />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="border-0"/>

                {/* Copyright */}
                <div className="py-4">
                    <h4 className="text-center">
                        © {new Date().getFullYear()} FaceFrames. All rights reserved.
                    </h4>
                </div>
            </div>
        </footer>
    );
}

export default Footer;