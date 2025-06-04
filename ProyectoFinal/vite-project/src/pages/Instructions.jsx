import { useNavigate } from "react-router-dom";

export default function Instructions() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/validacion"); // reemplazá por la ruta real
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">📘 Instrucciones</h1>

      <p className="text-gray-300 max-w-xl text-center mb-8">
        Bienvenido a la dApp de certificación. En los próximos pasos, vas a poder conectar tu wallet,
        visualizar tus NFTs y, si cumplís con los requisitos, vas a poder mintear un NFT especial
        de tipo <strong>"TP"</strong> que será enviado automáticamente a los destinatarios predefinidos.
      </p>

      <ul className="list-disc text-left text-gray-200 mb-6 space-y-2">
        <li>Conectá tu wallet usando MetaMask.</li>
        <li>Verificá que tenés los NFTs necesarios para continuar.</li>
        <li>Completá el formulario solo si se valida correctamente.</li>
        <li>El NFT será enviado automáticamente a Dani y Pablo.</li>
      </ul>

      <button
        onClick={handleStart}
        className="bg-indigo-600 hover:bg-indigo-700 transition px-6 py-3 rounded text-white font-semibold shadow"
      >
        ✅ Comenzar
      </button>
    </div>
  );
}
