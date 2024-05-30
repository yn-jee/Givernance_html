import { createHelia } from 'helia'
import { json } from '@helia/json'

const helia = await createHelia()
const j = json(helia)
  
// 파일 업로드 함수
export async function uploadFile(fileContent) {
    try {
        const fileAddress = await j.add(fileContent)
        console.log('File added to IPFS:', fileAddress);
        return fileAddress;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

// 파일 다운로드 함수
export async function getFile(hash) {
    try {
        const stream = await j.get(hash);

        let data = '';
        for await (const chunk of stream) {
            data += chunk.toString();
        }

        console.log('File content:', data);
        return data;
    } catch (error) {
        console.error('Error fetching file:', error);
    }
}
