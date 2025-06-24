import { useNavigate } from "react-router-dom";

export default function Instructions() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/fetchAndVal2");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 text-gray-800 flex flex-col items-center justify-center px-6 py-12">
      <div className="bg-white/80 backdrop-blur-md border border-indigo-200 rounded-2xl shadow-xl p-8 max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-indigo-600 drop-shadow-md">
          📘 Instrucciones
        </h1>

        <p className="text-gray-700 text-lg leading-relaxed">
          🎓 Bienvenido a la <strong>dApp de promoción con NFT</strong>. En esta sección podrás conectar tu wallet y,
          si cumplís con los requisitos, <strong>mintear un NFT</strong> que certifica tu promoción.
          <br />
          🧠 Las validaciones se hacen <strong>on-chain</strong> y, si no cumplís con los requisitos,
          <span className="text-red-500 font-medium"> tu transacción será rechazada</span>.
        </p>

        <ul className="text-left text-gray-700 text-base list-disc pl-6 space-y-1">
          <li>🔌 Conectá tu wallet (MetaMask).</li>
          <li>📥 Pegá la dirección del contrato con tus NFTs.</li>
          <li>🖼️ Visualizá tus NFTs y verificá si cumplís con los criterios.</li>
          <li>🏁 Si cumplís, ¡minteá tu NFT de promoción!</li>
        </ul>

        <button
          onClick={handleStart}
          className="mt-4 bg-indigo-500 hover:bg-indigo-600 transition px-6 py-3 rounded-xl text-white font-semibold shadow-md"
        >
          ✅ Comenzar
        </button>
      </div>
    </div>
  );
}
