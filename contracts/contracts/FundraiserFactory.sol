// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Fundraiser.sol"; // 이전에 작성한 Fundraiser 컨트랙트를 import

contract FundraiserFactory {
    Fundraiser[] public fundraisers;

    event FundraiserCreated(address fundraiserAddress);

    function createFundraiser(string memory _name, uint256 _targetAmount, uint256 _finishTime, address payable _beneficiary, string memory _description) public {
        Fundraiser newFundraiser = new Fundraiser(_name, _targetAmount, _finishTime, _description, _beneficiary);
        fundraisers.push(newFundraiser);
        emit FundraiserCreated(address(newFundraiser));
    }

    function getFundraisers() public view returns (Fundraiser[] memory) {
        return fundraisers;
    }
}

