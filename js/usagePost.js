import { LoadingAnimation } from './LoadingAnimation.js';
import { minidenticonSvg } from 'https://cdn.jsdelivr.net/npm/minidenticons@4.2.1/minidenticons.min.js';
import { fundraiserFactoryAddress, fundraiserFactoryABI, fundraiserABI } from './contractConfig.js';
//import { uploadTextToIPFS, downloadTextFromIPFS } from './ipfs.js';
// import { createHeliaHTTP } from "@helia/http";
// import { unixfs } from "@helia/unixfs";
import { deployGiversToken, deployGiver, GiversTokenABI, GiversTokenBytecode, GiverABI, GiverBytecode } from "./tokenDeploy.js";


const animation = new LoadingAnimation('../images/loadingAnimation.json');
await animation.loadAnimation();

const urlParams = new URLSearchParams(window.location.search);
const contractAddress = urlParams.get('contractAddress'); // 'contractAddress' 파라미터의 값 가져오기


async function createHeliaInstance() {
    const helia = await createHeliaHTTP({
        url: 'http://localhost:5001' // IPFS 데몬의 HTTP API 엔드포인트
    });
    return helia;
}

// 파일 업로드 함수
export async function uploadTextToIPFS(textData) {
    try {
        const helia = await createHeliaInstance();
        const heliaFs = unixfs(helia);
        const encoder = new TextEncoder();
        const bytes = encoder.encode(textData);
        const fileCid = await heliaFs.addBytes(bytes);

        return {
            message: 'Text uploaded successfully',
            data: textData,
            cid: fileCid.toString()
        };
    } catch (error) {
        console.error('Error uploading text:', error);
        throw new Error('Internal Server Error');
    }
}

// 파일 다운로드 함수
export async function downloadTextFromIPFS(cid) {
    try {
        const helia = await createHeliaInstance();
        const heliaFs = unixfs(helia);
        const decoder = new TextDecoder();
        let text = "";

        for await (const chunk of heliaFs.cat(CID.parse(cid))) {
            text += decoder.decode(chunk, {
                stream: true,
            });
        }
        return text;
    } catch (error) {
        console.error('Error downloading text:', error);
        throw new Error('Internal Server Error');
    }
}

// 이더리움 프로바이더 초기화
async function initializeProvider() {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    // 연결된 메타마스크 주소
    const connectedAddress = accounts[0]; 
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    return { provider, connectedAddress };
}

async function getEvents(provider, fundraiserFactoryAddress) {
    const fundraiserFactory = new ethers.Contract(fundraiserFactoryAddress, fundraiserFactoryABI, provider);

    const fromBlock = 0;
    const toBlock = 'latest';
    const events = await fundraiserFactory.queryFilter(fundraiserFactory.filters.FundraiserCreated(), fromBlock, toBlock);
    return events;
}


async function getFundraiserCreatorAddresses(provider, events, _fundraiserAddress) {
    for (let event of events) {
        const txHash = event.transactionHash;
        const tx = await provider.getTransaction(txHash);
        const creatorAddress = tx.from;
        if (_fundraiserAddress == event.args.fundraiserAddress){
            return creatorAddress;
        }
    }
}

function trimAddress(address) {
    return `${address.slice(0, 7)}...${address.slice(-5)}`;
}

function copyToClipboard(text) {
    // navigator.clipboard 지원 여부 확인
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Address copied to clipboard!');
        }).catch(err => {
            console.error('Error copying text to clipboard: ', err);
        });
    } else {

        const textArea = document.createElement("textarea");
        textArea.value = text;
        // 화면 밖으로
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Address copied to clipboard!');
        } catch (err) {
            console.error('Error copying text to clipboard: ', err);
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

// 트랜잭션 해시를 이용하여 생성된 블록 번호를 가져오는 함수
async function getContractCreationBlock(provider, events, _fundraiserAddress) {
    for (let event of events) {
        const txHash = event.transactionHash;
        const tx = await provider.getTransaction(txHash);
        if (_fundraiserAddress === event.args.fundraiserAddress) {
            return tx.blockNumber;
        }
    }
    throw new Error('Fundraiser address not found in events');
}

// 타임스탬프 가져오기
async function getBlockTimestamp(provider, blockNumber) {
    const block = await provider.getBlock(blockNumber);
    return block.timestamp;
}

async function fetchAndDisplayFundraiserDetails(provider, connectedAddress, address, factoryAddress) {
    try {
        animation.startTask();

        // 컨트랙트 객체 생성
        const contract = new ethers.Contract(address, fundraiserABI, provider);
        // 모든 트랜잭션 가져오기
        const events = await getEvents(provider, factoryAddress);

        // 컨트랙트 데이터 가져오기
        const name = await contract.name();
        const contractOwner = await getFundraiserCreatorAddresses(provider, events, address);
        
        // 생성된 시간 가져오기
        const blockNumber = await getContractCreationBlock(provider, events, address);
        const timestamp = await getBlockTimestamp(provider, blockNumber);
        const creationDate = new Date(timestamp * 1000).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        const description = await contract.description();
        const targetAmount = ethers.utils.formatUnits(await contract.targetAmount(), 'gwei');
        const finishTime = new Date((await contract.finishTime()).toNumber() * 1000).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
        const raisedAmount = ethers.utils.formatUnits(await contract.raisedAmount(), 'gwei');
        const image = contract.image || "images/donationBox.png";

        // _items 데이터 가져오기
        let items = [];
        let index = 0;
        while (true) {
            try {
                const item = await contract.items(index);
                items.push(item);
                index++;
            } catch (error) {
                break; // 더 이상 항목이 없으면 루프 종료
            }
        }

        // 페이지에 표시할 내용 생성
        const detailsDiv = document.getElementById('fundraiserDetails');
        detailsDiv.innerHTML = `
            <h1 class="fundraiserTitle">${name}</h1>
            <div class="contractMetaData">
                <div class="profile">
                    <minidenticon-svg class="profileImage" username="${contractOwner}"></minidenticon-svg>
                    <p class="contractOwner" fullAddress="${contractOwner}">${trimAddress(contractOwner)}</p>
                </div>
                <p class="creationTime">${creationDate}</p>
            </div>
            <img class="fundraiserImage" src="${image}" title="fundraiserImage">
            <p class="fundraiserDescription">${description}</p>
            <p class="fundraiserFinishTime">${finishTime} 마감</p>

            <div class="fundraisingStatus">
            <div class="raisedAmount"><b>${parseInt(raisedAmount).toLocaleString()} GWEI</b> 후원되었어요</div>
            <div class="progressPercentage">${(raisedAmount / targetAmount * 100).toFixed(1)}%</div>
            </div>
            <div class="progressBarContainer">
                <div class="progressBar" style="width: ${(raisedAmount / targetAmount * 100)}%;"></div>
            </div>
            <div class="supporterInfo">
                <span class="targetAmount">${parseInt(targetAmount).toLocaleString()} GWEI 목표</span>
            </div>

            <div class="items">
                <h3 style="text-align: left;">Items</h3>
                <ul>
                    ${items.map(item => `
                        <div class="itemInfo">
                            <div class="itemNamePrice">
                                <p class="itemName">${item.name}</p>
                                <p class="itemPrice">개당 ${parseInt(ethers.utils.formatUnits(item.price.mul(ethers.BigNumber.from('1000000000')), 'gwei')).toLocaleString()} GWEI</p>
                            </div>
                            <div class="itemDetails">
                                <p class="itemQuantity">${item.quantity}개</p>
                                <p class="totalPrice">총 ${parseInt(ethers.utils.formatUnits(item.price.mul(item.quantity).mul(ethers.BigNumber.from('1000000000')), 'gwei')).toLocaleString()} GWEI</p>
                            </div>
                        </div>
                    `).join('')}
                </ul>
            </div>
        `;
        // // IPFS에 업로드할 plain string 데이터
        // const plainStringData = "This is a plain string to upload to IPFS...";

        // // IPFSUpload 함수 정의
        // async function IPFSUpload(data) {
        //     try {
        //         const url = `${window.location.origin}/api/IPFSUpload`;

        //         const response = await fetch(url, {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             },
        //             body: JSON.stringify({ data })
        //         });

        //         console.log(`Request body: ${JSON.stringify({ data })}`);

        //         if (!response.ok) {
        //             throw new Error(`HTTP error! status: ${response.status}`);
        //         }

        //         const responseData = await response.json();
        //         console.log('Response from server:', responseData);

        //         // CID로 IPFS에서 파일 검색
        //         const cid = responseData.cid;
        //         console.log(`File CID: ${cid}`);
        //         const fileUrl = `https://ipfs.io/ipfs/${cid}`;
        //         console.log(`IPFS file URL: ${fileUrl}`);
        //     } catch (error) {
        //         console.error('Error uploading data:', error);
        //     }
        // };

        // // IPFSUpload 함수 호출
        // IPFSUpload(plainStringData);

        animation.endTask();
    } catch (error) {
        console.error('Error fetching contract details:', error);
        document.getElementById('fundraiserDetails').innerHTML = '<p>Error fetching fundraiser details.</p>';
        animation.endTask(); // 에러 발생 시에도 로딩 종료
    }
}

document.getElementById('registerUsage').addEventListener('click', async () => {
    console.log('button clicked');
    const usageDescription = document.getElementById('usageDescription').value;
    
    if (!usageDescription) {
        alert('Please enter a description.');
        return;
    }

    const jsonContent = {
        description: usageDescription
    };

    const jsonString = JSON.stringify(jsonContent);

    // IPFS에 JSON 파일 업로드
    const ipfsPath = await uploadTextToIPFS(jsonString);
    
    if (ipfsPath) {
        alert('File successfully uploaded to IPFS. Path: ' + ipfsPath);
    }
});





// 메인 실행
(async function() {
    if (contractAddress) {
        const { provider, connectedAddress } = await initializeProvider();
        await fetchAndDisplayFundraiserDetails(provider, connectedAddress, contractAddress, fundraiserFactoryAddress);
    } else {
        document.getElementById('fundraiserDetails').innerHTML = '<p>No contract address provided.</p>';
    }
})();
