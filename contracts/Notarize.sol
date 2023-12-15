// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

error hashAlreadyNotarized();

contract Notarize is OwnableUpgradeable, AccessControlEnumerableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    //Create new role for address
    bytes32 public constant HASH_WRITER = keccak256("HASH_WRITER");

    CountersUpgradeable.Counter private _docCounter;
    mapping(uint256 => Doc) private _documents;
    mapping(bytes32 => bool) private _regHashes;

    struct Doc {
        string docUrl; //URI of the document that exist off-chain
        bytes32 docHash; //Hash of the document
    }

    CountersUpgradeable.Counter public getInfoCounter;

    event DocHashAdded(
        uint256 indexed docCounter,
        string docUrl,
        bytes32 dochash
    );

    function initialize() external initializer {
        __Ownable_init();
        //add deployer as admin
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function setHashWriterRole(
        address _hashWriter
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(HASH_WRITER, _hashWriter);
    }

    function addNewDocument(
        string memory _url,
        bytes32 _hash
    ) external onlyRole(HASH_WRITER) {
        if (_regHashes[_hash]) {
            revert hashAlreadyNotarized();
        }
        uint256 counter = _docCounter.current();
        _documents[counter] = Doc({docUrl: _url, docHash: _hash});
        _regHashes[_hash] = true;
        _docCounter.increment();
        emit DocHashAdded(counter, _url, _hash);
    }

    function getDocInfo(
        uint256 _num
    ) external view returns (string memory, bytes32) {
        require(_num < _docCounter.current(), "Number does not exist");
        return (_documents[_num].docUrl, _documents[_num].docHash);
    }

    function getDocInfoCounter(
        uint256 _num
    ) external returns (string memory, bytes32) {
        getInfoCounter.increment();
        return (_documents[_num].docUrl, _documents[_num].docHash);
    }

    function getDocsCount() external view returns (uint256) {
        return _docCounter.current();
    }

    function getRegisteredHash(bytes32 _hash) external view returns (bool) {
        return _regHashes[_hash];
    }
}
