
async function fetchAllEventsFromContract(provider) {
    try {
        // Requesting Ethereum accounts and initializing provider
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
        //const contractAddressesDiv = document.getElementById('contractAddresses');

        //contractAddressesDiv.innerHTML = ''; // Clear all previous addresses

        const fromBlock = 0; // Starting block (e.g., 0)
        const toBlock = 'latest'; // Last block
        const events = await fundraiserFactory.queryFilter({}, fromBlock, toBlock);
        
        // 화면에 출력하기
        /*events.forEach(event => {
            const addressLine = document.createElement('div');
            if (event.event === "FundraiserCreated") {
                addressLine.innerText = `Fundraiser Address: ${event.args.fundraiserAddress}`;
            } else {
                addressLine.innerText = `Event: ${event.event} at ${event.address}`;
            }
            contractAddressesDiv.appendChild(addressLine);
        });*/
        const fundraiserAddresses = events.filter(event => event.event === "FundraiserCreated").map(event => event.args.fundraiserAddress);
        return fundraiserAddresses;
    } catch (error) {
        console.error("Error fetching events:", error);
        return []; // Return an empty array in case of an error
    }
};

// 주소로 컨트랙트 정보 가져오기
async function fetchAllFundraiserDetails(fundraiserAddresses, provider) {
    const fundraiserABI = [
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
                    "internalType": "string",
                    "name": "_description",
                    "type": "string"
                },
                {
                    "internalType": "address payable",
                    "name": "_beneficiary",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "beneficiary",
            "outputs": [
                {
                    "internalType": "address payable",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "description",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "donate",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "donations",
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
            "name": "finishTime",
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
                    "internalType": "address",
                    "name": "_address",
                    "type": "address"
                }
            ],
            "name": "getInfo",
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
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "raisedAmount",
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
            "name": "targetAmount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    const details = await Promise.all(fundraiserAddresses.map(async address => {
        const contract = new ethers.Contract(address, fundraiserABI, provider);
        const name = await contract.name();
        const description = await contract.description();
        const beneficiary = await contract.beneficiary();
        const targetAmount = ethers.utils.formatEther(await contract.targetAmount());
        const finishTime = new Date((await contract.finishTime()).toNumber() * 1000).toLocaleString();
        const raisedAmount = ethers.utils.formatEther(await contract.raisedAmount());
        const owner = await contract.owner();

        return {
            address,
            name,
            description,
            beneficiary,
            targetAmount,
            finishTime,
            raisedAmount,
            owner
        };
    }));

    return details;
}

document.addEventListener('DOMContentLoaded', async function () {
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const fundraiserAddresses = await fetchAllEventsFromContract(provider);
        const details = await fetchAllFundraiserDetails(fundraiserAddresses, provider);
        console.log('Fundraiser Details:', details);
        const container = document.querySelector('.fundraiserContainer');
        details.forEach(detail => {
            const item = document.createElement('div');
            item.id = 'fundraiserBox';
            item.innerHTML = `
            <img class="donationBox" src="images/donationBox.png" title="donationBox">
            <h2 class="fundraiser-title">${detail.name}</h2>
            <p class="target-amount">Target Amount is <b>${detail.targetAmount} gwei</b></p>
            <p class="finish-date">Open untli <b>${detail.finishTime}</b></p>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error("Initialization error:", error);
    }
});