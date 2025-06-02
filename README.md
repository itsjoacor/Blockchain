# 🚀 dApp Blockchain – NFTs ERC-1155
> ⚠️ Este proyecto se encuentra en desarrollo.

---

## 🛠️ Tecnologías utilizadas

| Tecnología        | Propósito                                                       |
|-------------------|------------------------------------------------------------------|
| **React**         | Renderizado dinámico de la interfaz de usuario.                 |
| **Tailwind CSS**  | Estilado moderno y responsivo, con aspecto futurista.           |
| **Vite**          | Entorno de desarrollo rápido y ligero.                          |
| **ethers.js**     | Comunicación con la blockchain y contratos inteligentes.        |
| **MetaMask**      | Extensión para conexión y firma con wallet del usuario.         |
| **ERC-1155**      | Estándar de tokens para NFTs semi-fungibles.                    |

---

## 🌐 Contexto general

El objetivo de esta dApp es interactuar con contratos ERC-1155 ya desplegados en la blockchain para:

- Visualizar NFTs que posee una wallet.
- Validar ciertos requisitos a partir de la tenencia de esos NFTs.
- Permitir el minteo de nuevos NFTs si se cumplen los criterios.
- Enviar los NFTs minteados a direcciones predefinidas.

---

## 🔁 FLOW 1 – Asociación de Wallet y Minteo de NFT “TP”

### 🎯 Objetivo
Permitir que el usuario conecte su wallet, visualice sus NFTs, y si **cumple ciertos requisitos de forma global (sobre todos los NFTs que posee)**, pueda mintear un NFT tipo **"TP"**, enviándolo automáticamente a **dos wallets predefinidas**.

### 🔷 Pasos

1. **Conectar Wallet**
   - El usuario hace clic en “Conectar Wallet”.
   - MetaMask solicita autorización.
   - Al aprobar, se guarda la dirección de la wallet conectada.

2. **Ingresar dirección de contrato**
   - El usuario ingresa la dirección de un contrato ERC-1155.
   - Se consulta el contrato usando esa dirección.

3. **Visualización de NFTs**
   - Se accede al contrato ERC-1155 desde una dirección fija (`contractAddress`).
   - Se recuperan los NFTs que posee la wallet conectada.
   - Los NFTs se muestran en formato **cards** (solo visual).

4. **Verificación de requisitos globales**
   - Se ejecuta una validación sobre el **conjunto total de NFTs**.
   - Ejemplo: cantidad total de NFTs, IDs presentes, otras caracteristicas, etc.
   - Si se cumplen los requisitos, se habilita la siguiente etapa (boton creacion nft).  **Si no valida Flow 1 bis** -> NO PUEDE PASAR. QUE ESTE COMO ERR

5. **Formulario de Minteo**
   - El usuario completa datos en un formulario (por definir).
   - Se procede al minteo del NFT “TP”.

6. **Envío automático**
   - El NFT minteado se envía automáticamente a:
     - `w2` → Wallet de Dani
     - `w3` → Wallet de Pablo

7. **Pantalla de éxito**
   - Se muestra una pantalla de éxito.

---

## 🔁 FLOW 2 – Visualización y Promoción con NFT “P”

### 🎯 Objetivo
Permitir que un usuario conecte su wallet y visualice sus NFTs de **un contrato proporcionado por él mismo**. Si **la suma total de NFTs cumple ciertos requisitos**, se habilita el minteo del NFT tipo **“P”**, que se enviará a una wallet fija.

### 🔷 Pasos

1. **Conectar Wallet**
   - Igual que en Flow 1: botón “Conectar Wallet” → MetaMask → autorización.

2. **Ingresar dirección de contrato**
   - El usuario ingresa la dirección de un contrato ERC-1155.
   - Se consulta el contrato usando esa dirección.

3. **Visualización de NFTs**
   - Se muestran los NFTs que posee esa wallet del contrato ingresado.
   - Las cards son solo visuales (no accionables individualmente).

4. **Validación para promoción**
   - Se hace una verificación sobre **la totalidad de NFTs poseídos**.
   - Si los cumple, se habilita la opción de promoción (botón). **Si no valida Flow 2 bis** -> NO PUEDE PASAR. QUIERO PROMOCIONAR

5. **Formulario de Minteo**
   - El usuario completa los datos requeridos.
   - Se mintea el NFT “P”.

6. **Envío automático**
   - El NFT minteado se envía a:
     - `w1` → Wallet fija predefinida

7. **Pantalla de éxito**
   - Se muestra confirmación al usuario.

---

## 🌐 Variables globales

| Variable      | Descripción                                     |
|---------------|--------------------------------------------------|
| `contractAddress` | Contrato fijo usado en Flow 1                    |
| `contractAddress2` | puede haber otra para el flow 3 que visualice?  |
| `w1`             | Wallet fija para recibir NFT "P" (Flow 2)         |
| `w2`, `w3`       | Wallets fijas para recibir NFT "TP" (Flow 1)      |

---

## ✅ Validaciones posibles

Estas son algunas validaciones personalizables para ambos flujos:

- Tener más de cierta cantidad de NFTs.
- Poseer uno o varios NFTs con IDs específicos.
- Sumar un balance total mínimo.
- Comprobar metadata de NFTs desde `uri()`.

---

## 📌 Estado actual

- [ ] Estructura del proyecto iniciada con Vite + React.
- [ ] Conexión con MetaMask implementada.
- [ ] Visualización de NFTs en formato cards.
- [ ] Lógica de validación global pendiente.
- [ ] Función de minteo e interacción con contratos en desarrollo.

---

## 📎 Requisitos para ejecutar (próximamente)
## 📎 COSAS JOACO
   - Fijarse de mandar el proyecto de la notebook para agregarle ABI actualizado y poder extraer datos Pablo nftreader
## 📎 DUDAS 
   - Cuales son los criterios a verificar de cada flow
   - Debo dejar poner la direccion del contrato que quiero ver NFTs? Que pasa si tengo otros NFTs del mismo tipo. Tengo que darle la direccion de un contrato no de "Che traeme los erc1155 de esta wallet, pudo haber jugado con otros"
   - Revisar flujo si se entendio bien o no
   - 
   

```bash
git clone https://github.com/tuusuario/tu-repo.git
cd tu-repo
npm install
npm run dev
