import { useState, useEffect } from "react";

import glassesImg1 from "../../Assets/pictures/glasses.jpg";
import glassesImg2 from "../../Assets/pictures/glasses2.jpg";
import glassesImg3 from "../../Assets/pictures/glasses3.jpg";
import glassesImg4 from "../../Assets/pictures/glasses4.jpg";
import glassesImg5 from "../../Assets/pictures/glasses5.jpg";

const images = [
  glassesImg1,
  glassesImg2,
  glassesImg3,
  glassesImg4,
  glassesImg5,
];

function Carousel() {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  // Autoplay each 4 seconds
  useEffect(() => {
    const nextSlide = () => {
      setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
    };

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [total]);

  const nextSlide = () => {
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-lg border-4 border-emerald-800">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, index) => (
          <div
            key={index}
            className="
                    min-w-full 
                    h-64 
                    sm:h-80
                    md:aspect-3/2 
                    md:h-auto 
                    max-h-[700px]
                "
          >
            <img
              src={img}
              alt={`slide-${index}`}
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Prev Button */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/70 hover:bg-white p-3 rounded-full shadow-md transition"
      >
        <span className="text-2xl">❮</span>
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/70 hover:bg-white p-3 rounded-full shadow-md transition"
      >
        <span className="text-2xl">❯</span>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === index ? "bg-white scale-125" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;