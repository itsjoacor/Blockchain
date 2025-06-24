import React, { useRef } from "react";

const EstadoTag = ({ estado, id, onChange }) => {
  const selectRef = useRef(null);

  const estados = ["EN_BUSQUEDA", "LOCALIZADO", "EN_STAND_DE_OP", "RECUPERADO"];

  const colorMap = {
    EN_BUSQUEDA: "bg-red-500",
    LOCALIZADO: "bg-orange-500",
    EN_STAND_DE_OP: "bg-violet-600",
    RECUPERADO: "bg-green-600"
  };

  const handleChange = (e) => {
    const nuevoEstado = e.target.value;
    onChange(id, nuevoEstado);
  };

  const colorWrap = colorMap[estado] || "bg-gray-500";

  return (
    <select
      ref={selectRef}
      value={estado}
      onChange={handleChange}
      className={`px-2 py-1 rounded text-white font-semibold ${colorWrap}`}
    >
      {estados.map((opcion) => (
        <option
          key={opcion}
          value={opcion}
          className="text-white bg-gray-700"
        >
          {opcion.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
};

export default EstadoTag;
