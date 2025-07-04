import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🧑‍🚀 Deployando contratos con la cuenta:", deployer.address);

  //
  // 1. Desplegar DAppToken
  //
  const DAppToken = await ethers.getContractFactory("DAppToken");
  const dappToken = await DAppToken.deploy(deployer.address);
  await dappToken.waitForDeployment();
  const dappTokenAddress = await dappToken.getAddress();
  console.log("📦 Contrato DAppToken desplegado en la dirección:", dappTokenAddress);

  //
  // 2. Desplegar LPToken
  //
  const LPToken = await ethers.getContractFactory("LPToken");
  const lpToken = await LPToken.deploy(deployer.address);
  await lpToken.waitForDeployment();
  const lpTokenAddress = await lpToken.getAddress();
  console.log("📦 Contrato LPToken desplegado en la dirección:", lpTokenAddress);

  //
  // 3. Desplegar TokenFarm
  //
  const TokenFarm = await ethers.getContractFactory("TokenFarm");
  const tokenFarm = await TokenFarm.deploy(dappTokenAddress, lpTokenAddress);
  await tokenFarm.waitForDeployment();
  const tokenFarmAddress = await tokenFarm.getAddress();
  console.log("🌾 Contrato TokenFarm desplegado en la dirección:", tokenFarmAddress);

  // 4. Guardar direcciones + argumentos en deployments/sepolia.json
  const output = {
    DAppToken: {
      address: dappTokenAddress,
      args: [deployer.address],
    },
    LPToken: {
      address: lpTokenAddress,
      args: [deployer.address],
    },
    TokenFarm: {
      address: tokenFarmAddress,
      args: [dappTokenAddress, lpTokenAddress],
    },
  };

  const folderPath = path.join(__dirname, "..", "deployments");
  const filePath = path.join(folderPath, "sepolia.json");

  // Crear carpeta si no existe
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
  console.log("📝 Direcciones guardadas en:", filePath);
}

main().catch((error) => {
  console.error("❌ Error en el despliegue:", error);
  process.exitCode = 1;
});