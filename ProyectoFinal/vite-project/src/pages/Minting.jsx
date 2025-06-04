import { useLocation } from "react-router-dom";

const Minting = () => {
    const location = useLocation();
    const wallet = location.state?.wallet;

    return (
        <div>
            <h1>Minteo</h1>
            <p>Minteando para wallet: {wallet}</p>
        </div>
    );
};

export default Minting;
