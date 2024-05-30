import { createHelia } from 'helia';
import { json } from '@helia/json';

async function main() {
    const helia = await createHelia();
    const heliaJson = json(helia);

    console.log('Helia instance created:', helia);
    console.log('Helia JSON instance created:', heliaJson);
}

main().catch(console.error);
