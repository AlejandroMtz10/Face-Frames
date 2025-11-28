import React from "react";
import Carousel from "../../Components/Carousel";
import MainCard from "../../Components/MainCard";
import Glasses from "../../Components/Glasses";
function Home() {
    return (
        <div>
            <h1 className="text-4xl font-bold text-center my-8">Face Frames</h1>
            <p className="text-center text-lg mx-4">
                Discover the perfect glasses for your face based on the shape of your face.
            </p>
            <section className="p-4">
                <Carousel />
            </section>
            <section className="px-4 py-2">
                <MainCard />
            </section>
            <section className="px-4 pt-6 pb-2">
                <h2 className="text-3xl text-center font-semibold mb-4 text-emerald-900 dark:text-white">
                    Kind of glasses
                </h2>

                <hr className="my-8 mx-12 h-px bg-emerald-900 border-0 dark:bg-emerald-300" />
                
                <Glasses className="pt-2" />
            </section>
        </div>
    );
}

export default Home;