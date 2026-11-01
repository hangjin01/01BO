import { Capacitor, registerPlugin } from '@capacitor/core';
export type WakeStatus = {state:'off'|'starting'|'listening';error:string};
export const supportsWake = () => Capacitor.getPlatform()==='android';
export const NativeWake=registerPlugin<{
  status():Promise<WakeStatus>;
  start():Promise<void>;
  stop():Promise<void>;
  consumeWake():Promise<{detected:boolean}>;
}>('O1boWake');
export async function stopWake(){if(supportsWake())await NativeWake.stop();}
