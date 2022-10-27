const fs = require('fs')

const contractsDir = __dirname + '/../../build'
const filePath = contractsDir + '/deployedContracts.json'

const saveContract = ({ contractName, chainId, contractData }) => {
  // const contractName = Object.keys(contractData[chainId])[0];
  const rawdata = fs.readFileSync(filePath)
  const deployedContracts = JSON.parse(rawdata)

  if (!contractName) {
    console.error('Error during file creation : contractName is missing')
    return
  }

  if (!deployedContracts[chainId]) {
    deployedContracts[chainId] = {
      [contractName]: {
        ...contractData[chainId][contractName],
        olds: [],
        date: new Date().toISOString(),
      },
    }
  } else if (!deployedContracts[chainId][contractName]) {
    deployedContracts[chainId] = {
      ...deployedContracts[chainId],
      [contractName]: {
        ...contractData[chainId][contractName],
        olds: [],
        date: new Date().toISOString(),
      },
    }
  } else {
    const old = deployedContracts[chainId][contractName]
    const olds = [old, ...deployedContracts[chainId][contractName].olds]
    delete old.olds

    deployedContracts[chainId][contractName] = {
      ...contractData[chainId][contractName],
      date: new Date().toISOString(),
      olds,
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(deployedContracts))
}

const saveContractData = (contractData) => {
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}))
    }
  } catch (error) {
    console.lerrorog('Error during file creation : ', error)
    return
  }

  const chainId = Object.keys(contractData)[0]

  if (!chainId) {
    console.error('Error during file creation : chainId is missing')
    return
  }

  Object.keys(contractData[chainId]).map((contractName) =>
    saveContract({ contractName, chainId, contractData })
  )
}
module.exports = saveContractData
