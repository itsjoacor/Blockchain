// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Contrato base ERC1155 mínimo (copiado de OpenZeppelin simplificado)
interface IERC1155 {
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

contract CustomERC1155 {
    uint256 public currentTokenId = 0;
    address public owner;

    struct Metadata {
        string titulo;
        string descripcion;
        string nombre;
        string fecha;
        string imageUrl;
    }

    mapping(uint256 => Metadata) public metadatas;
    mapping(address => mapping(uint256 => uint256)) public balances;

    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede ejecutar esta funcion");
        _;
    }

    function mintConMetadata(
        address to,
        string memory titulo,
        string memory descripcion,
        string memory nombre,
        string memory fecha,
        string memory imageUrl
    ) public onlyOwner {
        uint256 tokenId = currentTokenId;
        balances[to][tokenId] = 1;

        metadatas[tokenId] = Metadata({
            titulo: titulo,
            descripcion: descripcion,
            nombre: nombre,
            fecha: fecha,
            imageUrl: imageUrl
        });

        emit TransferSingle(msg.sender, address(0), to, tokenId, 1);

        currentTokenId++;
    }

    function balanceOf(address account, uint256 id) external view returns (uint256) {
        return balances[account][id];
    }

    function getMetadata(uint256 tokenId) public view returns (
        string memory titulo,
        string memory descripcion,
        string memory nombre,
        string memory fecha,
        string memory imageUrl
    ) {
        Metadata memory data = metadatas[tokenId];
        return (data.titulo, data.descripcion, data.nombre, data.fecha, data.imageUrl);
    }
}
