import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Info from "./Info";

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(false);

  // State to manage dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("dni");
    localStorage.removeItem("rol");
    localStorage.removeItem("correo");
    localStorage.removeItem("contrasenia");
    navigate("/");
  };

  const handleBajaDelUsuario = () => {
    setIsDropdownOpen(false);
    setShowConfirm(true);
  };

  const confirmarBaja = async () => {
    if (password === localStorage.getItem("contrasenia")) {
      const correo = localStorage.getItem("correo");
      await axios.delete(`http://localhost:8080/academicos/${correo}`);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userName");
      localStorage.removeItem("dni");
      localStorage.removeItem("rol");
      localStorage.removeItem("correo");
      localStorage.removeItem("contrasenia");
      setInfo(true)
    } else {
      setError("Contraseña incorrecta.");
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative bg-blue-700 text-white px-7 py-4 shadow-md w-full flex items-center">
      {/* Logo a la izquierda */}
      <Link to="/home" className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          style={{ width: "37px", height: "37px" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </Link>

      {/* Logo centrado */}
      <nav className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-2xl font-bold whitespace-nowrap">Perdi2EnLaUni</h1>
      </nav>

      {/* Contenedor derecho con división vertical */}
      <div className="text-xl ml-auto flex space-x-1 divide-x divide-white">
        <Link
          to="/publicar"
          className="pr-4 hover:underline whitespace-nowrap"
        >
          Publicar una pérdida
        </Link>

        {userName && (
          <div className="relative">
            {/* Profile button */}
            <button
              onClick={toggleDropdown}
              className="px-4 hover:underline whitespace-nowrap"
            >
              Mi Perfil
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <ul className="absolute z-[9999] right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg">
                <li>
                  <Link
                    to="/perfil"
                    className="block px-4 py-2 text-sm hover:bg-blue-200"
                  >
                    Mis datos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/misPublicaciones"
                    className="block px-4 py-2 text-sm hover:bg-blue-200"
                  >
                    Mis publicaciones
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-blue-200"
                  >
                    Cerrar sesión
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleBajaDelUsuario}
                    className="block px-4 py-2 text-sm w-full text-red-400 text-left bg-gray-900 hover:bg-gray-800"
                  >
                    Darse de baja
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 text-white rounded-xl shadow-xl w-80 h-80 flex flex-col justify-between p-5 border border-red-700">
            <div>
              <h3 className="font-bold text-lg mb-2 text-center text-red-500">
                Confirmar eliminación
              </h3>
              <p className="text-sm mb-4 text-center text-gray-300">
                Esta acción no se puede deshacer. Ingrese su contraseña para
                confirmar.
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-red-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Contraseña"
              />
              {error && (
                <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
              )}
            </div>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarBaja}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {info && <Info texto={"El usuario ha sido eliminado correctamente"} rutaDestino="/home" setInfo={setInfo}/>}
    </div>
  );
};

export default Navbar;
