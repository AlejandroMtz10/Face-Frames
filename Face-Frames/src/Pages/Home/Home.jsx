import React from "react";
import Carousel from "../../Components/Carousel";
import MainCard from "../../Components/MainCard";
function Home() {
    return (
        <div>
            <h1 className="text-4xl font-bold text-center my-8">Face Frames</h1>
            <p className="text-center text-lg mx-4">
                Discover the perfect glasses for your face based on the shape of your face.
            </p>
            <div className="p-4">
                <Carousel />
            </div>
            <div className="px-4 py-2">
                <MainCard />
            </div>
        </div>
    );
}

export default Home;