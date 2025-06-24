import { useNavigate } from "react-router-dom";

export default function Instructions() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/fetchAndVal2"); // reemplazá por la ruta real
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">📘 Instrucciones</h1>

      <p className="text-gray-300 max-w-xl text-center mb-8">
        🎓 Bienvenido a la dApp de promoción con NFT.
        En esta sección vas a poder conectar tu wallet, si
        cumplís con los requisitos, sobre los NFTs minteados previamenta a los profesores sobre la direccion de tu contrato, 
        podras mintear el NFT con el objetivo de promocionar la materia.
        Las validaciones son On-chain, de no cumplirlas, tu transaccion sera rechazada.
        🧩 Pasos del proceso: Conectá tu wallet usando
        MetaMask.
        Ingresá la dirección del contrato donde tenés tus NFTs, podes usar el copy & paste rapido previsto.
        Visualizá tus NFTs asociados a ese contrato. 
      </p>
      <button
        onClick={handleStart}
        className="bg-indigo-600 hover:bg-indigo-700 transition px-6 py-3 rounded text-white font-semibold shadow"
      >
        ✅ Comenzar
      </button>
    </div>
  );
}
