import { useNavigate } from "react-router-dom";

export default function Instructions() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/fetchAndVal"); // reemplazá por la ruta real
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 text-gray-800 flex flex-col items-center justify-center px-6 py-12">
      <div className="bg-white shadow-xl border border-indigo-200 rounded-2xl p-8 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4 drop-shadow">
          📘 Instrucciones
        </h1>

        <p className="text-gray-600 mb-6 text-lg">
          Bienvenido a la dApp de certificación. En los próximos pasos vas a poder:
        </p>

        <ul className="text-left text-gray-700 mb-6 space-y-3 list-disc pl-6 text-base">
          <li>🔗 Conectar tu wallet usando MetaMask.</li>
          <li>✅ Verificar si tenés los NFTs requeridos para continuar.</li>
          <li>📝 Completar el formulario si cumplís con los requisitos.</li>
          <li>📤 El NFT será enviado automáticamente a <strong>Dani</strong> y <strong>Pablo</strong>.</li>
        </ul>

        <button
          onClick={handleStart}
          className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all"
        >
          ✅ Comenzar
        </button>
      </div>
    </div>
  );
}
