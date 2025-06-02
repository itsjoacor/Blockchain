import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Info = ({ texto, rutaDestino, setInfo }) => {
    const [presionado, setPresionado] = useState(false);
    const navigate = useNavigate();

    const quitarComponente = () => {
        setPresionado(true);
        setInfo(false);
        setTimeout(() => {
            navigate(rutaDestino);
        }, 500); // Esperar para que se vea la transición
    };

    return (
        <div>
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[999]" />
                <div
                    className={`w-[400px] h-[140px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-400 rounded-[10px] p-5 text-center shadow-md z-[1000] transition-opacity duration-500 flex flex-col justify-between ${
                        presionado ? "animate-slide-out" : "animate-slide-in"
                    }`}
                    >
                    <h2 className="text-white font-sans font-medium my-2">{texto}</h2>
                    <div className="flex justify-center mt-4">
                        <button
                            className="px-5 py-2 mb-10 bg-blue-700 text-white rounded-md hover:bg-blue-550 hover:shadow-lg hover:scale-[1.02] transition-transform duration-300"
                            onClick={quitarComponente}
                            >
                            OK
                        </button>
                    </div>
                </div>
        </div>
    );
};

export default Info;
