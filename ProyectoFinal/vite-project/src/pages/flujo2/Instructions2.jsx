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
        🎓 Bienvenido a la dApp de promoción con NFT tipo “P” En esta sección
        vas a poder conectar tu wallet, ingresar el contrato de tus NFTs y, si
        cumplís con los requisitos, se activará la opción para mintear un NFT
        especial de tipo “P”. 🧩 Pasos del proceso: Conectá tu wallet usando
        MetaMask. Ingresá la dirección del contrato donde tenés tus NFTs.
        Visualizá tus NFTs asociados a ese contrato. Si cumplís con las
        condiciones requeridas, vas a poder continuar al formulario. El NFT “P”
        se minteará automáticamente y será enviado a la wallet fija de
        promoción. 🛑 Si no cumplís c
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
