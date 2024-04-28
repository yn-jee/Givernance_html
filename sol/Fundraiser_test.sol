// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Fundriaser_test {
    string fundraiser;

    function setFundraiser(string memory _fundraiser) public {
        fundraiser = _fundraiser;
    }

    function getFundraiser() public view returns (string memory) {
        return fundraiser;
    }
}