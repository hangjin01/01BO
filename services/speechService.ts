import {registerPlugin} from '@capacitor/core';
export const NativeSpeech=registerPlugin<{listen(options:{language:string}):Promise<{text:string;cancelled:boolean}>}>('O1boSpeech');
