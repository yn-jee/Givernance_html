import { LoadingAnimation } from './LoadingAnimation.js';

const animation = new LoadingAnimation('../images/loadingAnimation.json');
await animation.loadAnimation();

const urlParams = new URLSearchParams(window.location.search);
const contractAddress = urlParams.get('contractAddress'); // 'contractAddress' 파라미터의 값 가져오기

// 이더리움 프로바이더 초기화
async function initializeProvider() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    return new ethers.providers.Web3Provider(window.ethereum);
}

// 컨트랙트 정보를 가져와 페이지에 표시하는 함수
async function fetchAndDisplayFundraiserDetails(provider, address) {
    try {
        animation.startTask();

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

        // 컨트랙트 객체 생성
        const contract = new ethers.Contract(address, fundraiserABI, provider);

        // 컨트랙트 데이터 가져오기
        const name = await contract.name();
        const description = await contract.description();
        const targetAmount = ethers.utils.formatEther(await contract.targetAmount());
        const finishTime = new Date((await contract.finishTime()).toNumber() * 1000).toLocaleString();
        const raisedAmount = ethers.utils.formatEther(await contract.raisedAmount());
        let image = null;
        if (!contract.image) {
            image = "images/donationBox.png";
        }
        //const image = "images/donationBox.png";        
        // 페이지에 표시할 내용 생성
        const detailsDiv = document.getElementById('fundraiserDetails');
        detailsDiv.innerHTML = `
            <h1 class="fundraiserTitle">${name}</h1>
            <img class="fundraiserImage" src=${image} title="fundraiserImage">
            <p class="fundraiserDescription">${description}</p>
            <p>Target Amount: ${targetAmount} ETH</p>
            <p>Finish Time: ${finishTime}</p>
            <p>Raised Amount: ${raisedAmount} ETH</p>
        `;
        animation.endTask();
    } catch (error) {
        console.error('Error fetching contract details:', error);
        document.getElementById('fundraiserDetails').innerHTML = '<p>Error fetching fundraiser details.</p>';
        animation.endTask(); // 에러 발생 시에도 로딩 종료
    }
}

// 메인 실행
(async function() {
    if (contractAddress) {
        const provider = await initializeProvider();
        await fetchAndDisplayFundraiserDetails(provider, contractAddress);
    } else {
        document.getElementById('fundraiserDetails').innerHTML = '<p>No contract address provided.</p>';
    }

    if (contractAddress) {
        animation.startTask(); // 로딩 시작
        const provider = await initializeProvider();
        await fetchAndDisplayFundraiserDetails(provider, contractAddress);
        animation.endTask(); // 로딩 종료
    } else {
        document.getElementById('fundraiserDetails').innerHTML = '<p>No contract address provided.</p>';
    }
})();