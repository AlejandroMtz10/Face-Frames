import React, { useState } from "react";
import { Link } from "react-router-dom";
import glassesImg from "../../Assets/pictures/glasses6.webp";

function MainCard() {
    const title = "Face Frames";
    const subtitle = "Discover your perfect glasses";
    const description = "Just upload a photo of your face or take a selfie and let our AI recommend the best frames for your face shape.";
    
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);
    
    return (
        <div className="w-full max-w-8xl mx-auto bg-emerald-500 rounded-2xl p-6 md:p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl">
            {/* Image */}
            <div className="flex shrink-0">
                <img src={glassesImg} alt="Picture glasses" className="w-4xl h-auto md:w-2xl md:h-auto drop-shadow-xl rounded-2xl"/>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-4 md:gap-6 w-full">
                {subtitle && (
                    <h3 className="text-sm uppercase tracking-wide opacity-80">
                        {subtitle}
                    </h3>
                )}

                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                    {title}
                </h1>

                {description && (
                    <p className="text-lg md:text-xl opacity-90">{description}</p>
                )}

                {/* Button */}
                <Link to="/Glasses" onClick={toggleMenu}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition w-fit"
                >
                    Try it now
                </Link>
            </div>
        </div>
    );
}

export default MainCard;
