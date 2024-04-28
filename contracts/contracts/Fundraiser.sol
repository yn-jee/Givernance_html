// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Fundraiser {
    address public owner;
    string public name;
    uint256 public targetAmount;
    uint256 public finishTime;
    string public description;
    address payable public beneficiary; // 모금받을 주소

    uint256 public raisedAmount = 0;
    mapping(address => uint256) public donations;

    constructor(string memory _name, uint256 _targetAmount, uint256 _finishTime, string memory _description, address payable _beneficiary) {
        owner = msg.sender;
        name = _name;
        targetAmount = _targetAmount;
        finishTime = block.timestamp + _finishTime * 1 days;
        description = _description;
        beneficiary = _beneficiary;
    }

    //event DonationReceived(address indexed donor, uint amount);

    function donate() external payable {
        require(block.timestamp < finishTime, "This fundraising is over");
        require(msg.value > 0, "Donation must be greater than 0");
        (bool success, ) = beneficiary.call{value: msg.value}("");
        require(success, "Failed to send money");
        //emit DonationReceived(msg.sender, msg.value);
        donations[msg.sender] += msg.value;
        raisedAmount += msg.value;
    }

    function getInfo(address _address) public view returns (uint256) {
        require(donations[_address] > 0, "No Data"); 
        return donations[_address];
    }
}
