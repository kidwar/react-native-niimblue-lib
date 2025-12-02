import { NiimbotAbstractClient, ConnectionInfo } from "./abstract_client";
import { NiimbotBluetoothClient } from "./bluetooth_impl";

/** Client type for {@link instantiateClient} */
export type NiimbotClientType = "bluetooth";

/** Create new client instance */
export const instantiateClient = (t: NiimbotClientType): NiimbotAbstractClient => {
  if (t === "bluetooth") {
    return new NiimbotBluetoothClient();
  }
  throw new Error("Invalid client type");
};

export {
  NiimbotAbstractClient,
  NiimbotBluetoothClient,
};

export type {
  ConnectionInfo,
};
