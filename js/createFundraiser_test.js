import { LoadingAnimation } from './LoadingAnimation.js';

function getCurrentDateTime() {
    const now = new Date();

    // 현재 시간을 `datetime-local` 포맷으로 변환 (ISO 포맷에서 분까지만 사용)
    const dateTimeLocal = now.toISOString().slice(0, 16);

    return dateTimeLocal;
}

document.addEventListener('DOMContentLoaded', async function () {
    const animation = new LoadingAnimation('../images/loadingAnimation.json');
    await animation.loadAnimation();

    try {
        animation.startTask(); // 로딩 시작
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log('Provider and signer initialized.');

        const fundraiserFactoryAddress = "0xbf92fbee16dd1fb5a1dcffafd71edbec9460eb5b";
        const fundraiserFactoryABI = [
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
                    }
                ],
                "name": "createFundraiser",
                "outputs": [],
                "stateMutability": "nonpayable",
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
                "name": "fundraisers",
                "outputs": [
                    {
                        "internalType": "contract Fundraiser",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
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
        console.log('Contract initialized.');

        // FundraiserCreated 이벤트 리스너
        fundraiserFactory.on("FundraiserCreated", (fundraiserAddress) => {
            console.log(`New Fundraiser Created at: ${fundraiserAddress}`);
            alert(`New Fundraiser Created at: ${fundraiserAddress}`);
        });

        document.getElementById('registerFundraiser').addEventListener('click', async function() {
            animation.startTask(); // 로딩 시작
            const name = document.getElementById('fundraiserName').value;
            const targetAmountInput = document.getElementById('fundraiserTargetAmount').value;
            const targetAmount = ethers.utils.parseUnits(targetAmountInput, 'gwei');
            console.log('Target Amount (Ether):', targetAmount);

            const finishTimeElement = document.getElementById('fundraiserFinishTime');
            finishTimeElement.min = getCurrentDateTime();
            const finishTimeInput = finishTimeElement.value;
            if (!finishTimeInput) {
                console.error('Finish time is not provided.');
                alert('Please provide a finish time.');
                animation.endTask(); // 로딩 종료
                return;
            }
            const finishTimeUnix = Math.floor(new Date(finishTimeInput).getTime() / 1000);
            console.log('Finish Time (Unix):', finishTimeUnix);

            const description = document.getElementById('fundraiserDescription').value;

            try {
                const transactionResponse = await fundraiserFactory.createFundraiser(name, targetAmount, finishTimeUnix, description);
                await transactionResponse.wait();
                console.log('Fundraiser created:', transactionResponse);
                alert('Fundraiser has been registered successfully!');
            } catch (error) {
                console.error('Failed to register fundraiser:', error);
                alert('Error registering the fundraiser. Please check the console for more details.');
            } finally {
                animation.endTask(); // 로딩 종료
            }
        });

    } catch (error) {
        console.error("Error initializing application:", error);
    } finally {
        animation.endTask(); // 로딩 종료
    }
});

/*//document.addEventListener('DOMContentLoaded', function () {
	//import Web3 from 'https://cdn.jsdelivr.net/npm/web3@1.3.0/dist/web3.min.js';

	//const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/5020a98ceaa44a15a5bdff0c257ec0ee');
	const web3 = new Web3(provider);

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
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "fundraisers",
			"outputs": [
				{
					"internalType": "contract Fundraiser",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
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

	const fundraiserFactory = new web3.eth.Contract(fundraiserFactoryABI, fundraiserFactoryAddress);

	document.getElementById('registerFundraiser').addEventListener('click', async function() {
		const name = document.getElementById('fundraiserName').value;
		const targetAmount = web3.utils.toWei(document.getElementById('fundraiserTargetAmount').value, 'ether');
		const finishTime = new Date(document.getElementById('fundraiserFinishTime').value).getTime() / 1000;
		const beneficiary = document.getElementById('fundraiserBeneficiary').value;
		const description = document.getElementById('fundraiserDescription').value;

		try {
			const accounts = await web3.eth.requestAccounts().then(console.log);
			const result = await fundraiserFactory.methods.createFundraiser(name, targetAmount, finishTime, beneficiary, description)
				.send({ from: accounts[0], gas: 3000000 });
			console.log('Fundraiser created:', result);
			alert('Fundraiser has been registered successfully!');
		} catch (error) {
			console.error('Failed to register fundraiser:', error);
			alert('Error registering the fundraiser. Please check the console for more details.');
		}
	});*/


//});
// 함수 사용 예
//createFundraiser('Charity Event', 'www.example.com', 'http://image.url.com', 'Description of the fundraiser event', '0xBeneficiaryAddress');



/*async function initializeProvider() {
    try {
        // Requesting Ethereum accounts
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Getting list of accounts
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
            signer = provider.getSigner(accounts[0]);
            fundraiser = new ethers.Contract(
                fundraiserAddress,
                fundraiserABI,
                signer
            );
        } else {
            console.error("No Ethereum accounts available.");
        }
    } catch (error) {
        console.error("Error initializing provider:", error);
    }
}


async function _createFundraiser() {
    try {
		
		/*function createFundraiser(string memory _name, uint256 _targetAmount, uint256 _finishTime, address payable _beneficiary, string memory _description) public {
			Fundraiser newFundraiser = new Fundraiser(_name, _targetAmount, _finishTime, _description, _beneficiary);
			fundraisers.push(newFundraiser);
			emit FundraiserCreated(address(newFundraiser));
		}

        const mood = document.getElementById("mood").value;
        await MoodContract.setMood(mood);
    } catch (error) {
        console.error("Error setting mood:", error);
    }
}



async function getMood() {
    try {
        const mood = await MoodContract.getMood();
        document.getElementById("showMood").innerText = `Received Message: ${mood}`;
        console.log(mood);
    } catch (error) {
        console.error("Error getting mood:", error);
    }
}

async function setMood() {
    try {
        const mood = document.getElementById("mood").value;
        await MoodContract.setMood(mood);
    } catch (error) {
        console.error("Error setting mood:", error);
    }
}

window.onload = () => {
    initializeProvider();
};*/