import { NiimbotAbstractClient, ConnectionInfo } from "./abstract_client";
import { NiimbotBluetoothClient } from "./bluetooth_impl";
/** Client type for {@link instantiateClient} */
export type NiimbotClientType = "bluetooth";
/** Create new client instance */
export declare const instantiateClient: (t: NiimbotClientType) => NiimbotAbstractClient;
export { NiimbotAbstractClient, NiimbotBluetoothClient, };
export type { ConnectionInfo, };
