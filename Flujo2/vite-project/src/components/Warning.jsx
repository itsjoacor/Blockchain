export default function Warning({ texto, handleAccion, setWarning }) {

  return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[999] flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-semibold mb-4">
              { texto }
            </h2>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => { handleAccion(); setWarning(false); }}
                className="bg-red-500 text-white py-2 px-4 rounded-md"
              >
                Confirmar
              </button>
              <button
                onClick={() => setWarning(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
  );
}
