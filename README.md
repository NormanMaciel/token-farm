# 🌾 Token Farm

Proyecto DeFi simple que permite a los usuarios hacer staking de tokens LP y recibir recompensas en tokens DAPP.

El caso de uso del contrato Simple Token Farm es el siguiente:

- Los usuarios depositan tokens LP con la función deposit().
- Los usuarios pueden recolectar o reclamar recompensas con la función claimRewards().
- Los usuarios pueden deshacer el staking de todos sus tokens LP con la función withdraw(), pero aún pueden reclamar las recompensas pendientes.
- Cada vez que se actualiza la cantidad de tokens LP en staking, las recompensas deben recalcularse primero.
- El propietario de la plataforma puede llamar al método distributeRewardsAll() a intervalos regulares para actualizar las recompensas pendientes de todos los usuarios en staking.

## 🧠 Descripción

Este repositorio contiene los contratos inteligentes desarrollados con Solidity y Hardhat para una plataforma de *Token Farming*. Incluye:

- Un token ERC-20 llamado `DAppToken`
- Un token LP (`LPToken`) simulado
- Un contrato `TokenFarm` que permite hacer staking de `LPToken`, generar recompensas, retirarlas y reclamarlas

## 🛠️ Stack Tecnológico

- 🧠[Solidity](https://docs.soliditylang.org)
- 🟨[Hardhat](https://hardhat.org)
- 🛡️[OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- 🧪[TypeScript](https://www.typescriptlang.org)
- 🌱[dotenv](https://www.npmjs.com/package/dotenv)

## 🚀 Cómo usar

### 1. Clonar el repositorio

```bash
git clone https://github.com/NormanMaciel/token-farm.git
cd token-farm
```

### 2. Instalar dependencias
```bash
npm install
```
### 3. Compilar los contratos
```bash
npx hardhat compile
```

### 4. Desplegar a una red local o testnet

## Red local (Hardhat):
```bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

## Sepolia u otra red:
Asegurate de tener .env con tu clave privada y API de Alchemy o Infura. Puedes usar el .envEjemplo como ayuda.
 ```bash
npx hardhat run scripts/deploy.ts --network sepolia
```
> ⚠️ **Atención:** Este script además  de hacer el deploy, genera un archivo **sepolia.json**  dentro de la carpeta deployments, donde guarda las address de los tokens y contratos.

### 5. Verificar los contratos

Si aún no lo tenés:

```bash
npm install --save-dev @nomicfoundation/hardhat-verify
```
Luego
 ```bash
npx hardhat run scripts/verify.ts --network sepolia
```
> ⚠️ **Atención:** Cuando se ejecuta `verify.ts`, este toma las address de los contratos directamente de `sepolia.json` creado en el deploy.


### 6. Ejecutar tests
 ```bash
npx hardhat test
```


### 📁 Estructura del proyecto
 ```bash

.
├── contracts/           # Contratos inteligentes en Solidity
├── scripts/             # Scripts de despliegue
├── test/                # Tests con Hardhat y Chai
├── deployments/         # Direcciones de contratos desplegados
├── hardhat.config.ts    # Configuración de Hardhat
├── tsconfig.json        # Configuración de TypeScript
├── package.json         # Dependencias y scripts
```

### 📄 Contratos
- DAppToken.sol: Token de recompensas (ERC-20)

- LPToken.sol: Token simulado para staking

- TokenFarm.sol: Lógica de staking, retiro y recompensas

### 📜 Licencia
Este proyecto está licenciado bajo MIT.

### ✨ Autor
Norman Maciel  – https://github.com/NormanMaciel


### 🙏 Agradecimientos

Quiero expresar mi sincero agradecimiento a:

- [Luis Videla](https://gist.github.com/luisvid), por su guía, apoyo y buena disposición durante todo el desarrollo del curso.

- [Fundación ETH Kipu](https://www.ethkipu.org/es), por brindarme la oportunidad, los recursos y el espacio para aprender y crecer profesionalmente.
---
![alt text](image.png)