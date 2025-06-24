    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MinteoCondicionalSimple
/// @notice Permite mintear un NFT si la wallet que llama tiene al menos 1 NFT en el contrato pasado por parámetro

interface ICustomERC1155 {
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

contract MinteoCondicionalSimple {
    uint256 public currentTokenId = 0;

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

    constructor() {}

    function mintConMetadataCondicional(
        address to,
        address contratoVerificacion,
        string memory titulo,
        string memory descripcion,
        string memory nombre,
        string memory fecha,
        string memory imageUrl
    ) public {
        ICustomERC1155 contrato = ICustomERC1155(contratoVerificacion);

        bool tieneAlMenosUno = false;

        // Chequea si el msg.sender tiene al menos 1 NFT en el contrato externo
        for (uint256 id = 0; id < 100; id++) {
            try contrato.balanceOf(msg.sender, id) returns (uint256 balance) {
                if (balance > 0) {
                    tieneAlMenosUno = true;
                    break;
                }
            } catch {
                // Si el tokenId no existe o da error, seguimos al siguiente
                continue;
            }
        }

        require(tieneAlMenosUno, "La wallet no tiene NFTs en el contrato verificado");

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

    function getMetadata(uint256 tokenId) public view returns (
        string memory titulo,
        string memory descripcion,
        string memory nombre,
        string memory fecha,
        string memory imageUrl
    ) {
        Metadata memory data = metadatas[tokenId];
        return (
            data.titulo,
            data.descripcion,
            data.nombre,
            data.fecha,
            data.imageUrl
        );
    }

    function uri(uint256 tokenId) public view returns (string memory) {
        return string(abi.encodePacked(
            "data:application/json;utf8,{\"name\":\"NFT #",
            toString(tokenId),
            "\",\"description\":\"On-chain metadata NFT\",",
            "\"image\":\"", metadatas[tokenId].imageUrl, "\"}"
        ));
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}


add : 0xA72Ae3A20A78e545e21EE28FdFb72A65DFa9a0D0

[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "contratoVerificacion",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "titulo",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "descripcion",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "nombre",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "fecha",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			}
		],
		"name": "mintConMetadataCondicional",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "TransferSingle",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "balances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentTokenId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getMetadata",
		"outputs": [
			{
				"internalType": "string",
				"name": "titulo",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "descripcion",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "nombre",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "fecha",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "metadatas",
		"outputs": [
			{
				"internalType": "string",
				"name": "titulo",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "descripcion",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "nombre",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "fecha",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "uri",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]