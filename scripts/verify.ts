// para correr: npx hardhat run scripts/verify.ts --network sepolia

import fs from "fs";
import path from "path";
import { run } from "hardhat";

async function main() {
  // Ruta del JSON con direcciones
  const filePath = path.join(__dirname, "..", "deployments", "sepolia.json");

  if (!fs.existsSync(filePath)) {
    console.error("No se encontró el archivo de despliegues:", filePath);
    process.exit(1);
  }

  const deploymentsRaw = fs.readFileSync(filePath, "utf-8");
const deployments = JSON.parse(deploymentsRaw);

for (const [contractName, data] of Object.entries(deployments)) {
  const address = (data as any).address;
  const args = (data as any).args || [];

  let contractPath = "";
  switch (contractName) {
    case "DAppToken":
      contractPath = "contracts/DappToken.sol:DAppToken";
      break;
    case "LPToken":
      contractPath = "contracts/LPToken.sol:LPToken";
      break;
    case "TokenFarm":
      contractPath = "contracts/TokenFarm.sol:TokenFarm";
      break;
    default:
      console.warn(`⚠️ No se reconoce ${contractName}, salteando...`);
      continue;
  }

  try {
    console.log(`🔍 Verificando ${contractName} en ${address}...`);
    await run("verify:verify", {
      address,
      constructorArguments: args,
      contract: contractPath,
    });
    console.log(`✅ Verificado ${contractName}`);
  } catch (error: any) {
    console.error(`❌ Error verificando ${contractName}:`, error.message || error);
  }
}
    console.log("✅ Verificación completada.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});