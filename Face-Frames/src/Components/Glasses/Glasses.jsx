import React from "react";
import CardGlasses from "../CardGlasses";
import glassesData from "../../Data-json/glasses.json";

const glasses = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {glassesData.map((glasses, index) => (
                <CardGlasses
                    key={index}
                    glassesData={glasses}
                />
            ))}
        </div>
    );
};

export default glasses;