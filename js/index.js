async function fetchAllEventsFromContract() {
    try {
        // Requesting Ethereum accounts and initializing provider
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log('Provider and signer initialized.');

        const fundraiserFactoryAddress = "0x207dffcd5921401dcb87ab60b7a75f841dc6c9ad";
        const fundraiserFactoryABI = [
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_targetAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_finishTime",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address payable",
                        "name": "_beneficiary",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "_description",
                        "type": "string"
                    }
                ],
                "name": "createFundraiser",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "fundraiserAddress",
                        "type": "address"
                    }
                ],
                "name": "FundraiserCreated",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "getFundraisers",
                "outputs": [
                    {
                        "internalType": "contract Fundraiser[]",
                        "name": "",
                        "type": "address[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        const fundraiserFactory = new ethers.Contract(fundraiserFactoryAddress, fundraiserFactoryABI, signer);
        const contractAddressesDiv = document.getElementById('contractAddresses');

        contractAddressesDiv.innerHTML = ''; // Clear all previous addresses

        const fromBlock = 0; // Starting block (e.g., 0)
        const toBlock = 'latest'; // Last block
        const events = await fundraiserFactory.queryFilter({}, fromBlock, toBlock);
        
        // 화면에 출력하기
        events.forEach(event => {
            const addressLine = document.createElement('div');
            if (event.event === "FundraiserCreated") {
                addressLine.innerText = `Fundraiser Address: ${event.args.fundraiserAddress}`;
            } else {
                addressLine.innerText = `Event: ${event.event} at ${event.address}`;
            }
            contractAddressesDiv.appendChild(addressLine);
        });
        /*const addresses = events.filter(event => event.event === "FundraiserCreated").map(event => event.args.fundraiserAddress);
        return addresses;*/
    } catch (error) {
        console.error("Error fetching events:", error);
        //return []; // Return an empty array in case of an error
    }
};




document.addEventListener('DOMContentLoaded', async function () {
    fetchAllEventsFromContract(); // Fetch event logs when page loads
});
