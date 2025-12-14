// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustChain {
    address public owner;

    struct Product {
        string productId;
        string boxId;
        string name;
        string category;
        string manufacturer;
        string manufacturerDate;
        string manufacturePlace;
        string modelNumber;
        string serialNumber;
        string warrantyPeriod;
        string batchNumber;
        string color;
        string specs; // JSON string (public product specs - safe to show)
        uint256 price;
        string image;
        bool shipped;
        bool verifiedByRetailer;
        bool sold;
    }

    // productId -> Product
    mapping(string => Product) private products;

    // boxId -> array of productIds
    mapping(string => string[]) private productsByBox;

    // productId -> secret (admin-only). Stored as string (e.g. hashed secret)
    mapping(string => string) private productSecrets;

    event ProductRegistered(string indexed productId, string indexed boxId);
    event ProductShipped(string indexed productId);
    event ProductVerified(string indexed productId);
    event ProductSold(string indexed productId);
    event ProductSecretSet(string indexed productId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ---------------- REGISTER ----------------
    function registerProduct(
        string memory _productId,
        string memory _boxId,
        string memory _name,
        string memory _category,
        string memory _manufacturer,
        string memory _manufacturerDate,
        string memory _manufacturePlace,
        string memory _modelNumber,
        string memory _serialNumber,
        string memory _warrantyPeriod,
        string memory _batchNumber,
        string memory _color,
        string memory _specs,
        uint256 _price,
        string memory _image
    ) public {
        // ensure product does not already exist
        require(bytes(products[_productId].productId).length == 0, "Already exists");

        products[_productId] = Product(
            _productId,
            _boxId,
            _name,
            _category,
            _manufacturer,
            _manufacturerDate,
            _manufacturePlace,
            _modelNumber,
            _serialNumber,
            _warrantyPeriod,
            _batchNumber,
            _color,
            _specs,
            _price,
            _image,
            false,
            false,
            false
        );

        productsByBox[_boxId].push(_productId);

        emit ProductRegistered(_productId, _boxId);
    }

    // ---------------- SHIP ----------------
    function shipProduct(string memory _productId) public {
        require(bytes(products[_productId].productId).length > 0, "Not registered");
        products[_productId].shipped = true;
        emit ProductShipped(_productId);
    }

    // ---------------- VERIFY ----------------
    function verifyRetailer(string memory _productId) public {
        require(bytes(products[_productId].productId).length > 0, "Not registered");
        products[_productId].verifiedByRetailer = true;
        emit ProductVerified(_productId);
    }

    // ---------------- SALE ----------------
    function saleComplete(string memory _productId) public {
        require(bytes(products[_productId].productId).length > 0, "Not registered");
        products[_productId].sold = true;
        emit ProductSold(_productId);
    }

    // ---------------- ADMIN: secret setter/getter ----------------
    // set admin-only secret/seed/hash for product (onlyOwner)
    function setProductSecret(string memory _productId, string memory _secret) public onlyOwner {
        require(bytes(products[_productId].productId).length > 0, "Not registered");
        productSecrets[_productId] = _secret;
        emit ProductSecretSet(_productId);
    }

    // admin-only getter for secret
    function getProductSecret(string memory _productId) public view onlyOwner returns (string memory) {
        require(bytes(products[_productId].productId).length > 0, "Not registered");
        return productSecrets[_productId];
    }

    // ---------------- FETCH ----------------
    function getProduct(string memory _productId)
        public
        view
        returns (Product memory)
    {
        return products[_productId];
    }

    function getProductsByBox(string memory _boxId)
        public
        view
        returns (string[] memory)
    {
        return productsByBox[_boxId];
    }
}
