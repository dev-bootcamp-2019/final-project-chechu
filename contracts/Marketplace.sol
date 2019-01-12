pragma solidity ^0.5.0;

contract Marketplace {

  uint status;
  function setStatus(uint newStatus) public payable { status = newStatus; }
  function getStatus() public view returns (uint) { return status; }

  /* set owner */
  address owner;

  enum Roles { ADMIN, SELLER, BUYER }

  /* To know the role of a specific user
  */
  mapping(address => Roles) roles;
  mapping(address => bool) privilegedUsers;

  modifier isOwner () { require (msg.sender == owner); _;}
  modifier isAdmin () { require (privilegedUsers[msg.sender] && roles[msg.sender] == Roles.ADMIN); _;}
  modifier isSeller () { require (privilegedUsers[msg.sender] && roles[msg.sender] == Roles.SELLER); _;}
  modifier isBuyer (address _address) { require (!privilegedUsers[_address]); _;}

  constructor() public {
    owner = msg.sender;
  }

  function getRole() public view returns(Roles) {
    return privilegedUsers[msg.sender] ? roles[msg.sender] : Roles.BUYER;
  }

  function addAdmin(address newAdmin) public isOwner() {
    roles[newAdmin] = Roles.ADMIN;
    privilegedUsers[newAdmin] = true;
  }

  function addSeller(address newSeller) public isAdmin() isBuyer(newSeller) {
    roles[newSeller] = Roles.SELLER;
    privilegedUsers[newSeller] = true;
  }
}
