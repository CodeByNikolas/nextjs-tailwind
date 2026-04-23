import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TumTokenModule", (m) => {
  const tumToken = m.contract("TumToken");

  return { tumToken };
});
