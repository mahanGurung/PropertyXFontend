import { Cl, fetchCallReadOnlyFunction, fetchContractMapEntry, principalCV } from '@stacks/transactions';

import axios from 'axios';

const CONTRACT_ADDRESS = 'ST1JG6WDA1B4PZD8JZY95RPNKFFF5YKPV57BHPC9G';
const MARKETPLACE_CONTRACT_NAME = 'marketplace';




const getFtImageUrl = async (ftContractAddress, ftContractName, stxAddress) => {
  try {
    const options = {
      contractAddress: ftContractAddress,
      contractName: ftContractName,
      functionName: "get-token-uri",
      functionArgs: [],
      senderAddress: stxAddress,
      network: "testnet"
    };

    const response = await fetchCallReadOnlyFunction(options);
    console.log('Ft url: ', response)
    const url = response.value.value.value;
    const axiosResponse = await axios.get(url);
    console.log('ft image axiosResponse: ', axiosResponse)
    return axiosResponse.data; // This should be the image URL or an object containing it
  } catch (e) {
    console.error("Get Ft image error: ", e);
    return null;
  }
}

const getTokenName = async (ftContractAddress, ftContractName, stxAddress) => {
  try {
    const options = {
      contractAddress: ftContractAddress,
      contractName: ftContractName,
      functionName: "get-name",
      functionArgs: [],
      senderAddress: stxAddress,
      network: "testnet"
    };

    const response = await fetchCallReadOnlyFunction(options);
    return response.value.value;
  } catch (e) {
    console.error("Get token name error: ", e);
    return null;
  }
}

export const isFtWhitelisted = async (ftContractAddress, ftContractName, stxAddress) => {
    try {
      const options = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: MARKETPLACE_CONTRACT_NAME,
        functionName: "is-whitelisted",
        functionArgs: [principalCV(`${ftContractAddress}.${ftContractName}`)],
        senderAddress: stxAddress,
        network: "testnet"
      };

      const response = await fetchCallReadOnlyFunction(options);
      return JSON.parse(response.type);
    } catch (e) {
      console.error("Whitelist check error: ", e);
      return false;
    }
}

export const getTokenSymbol = async (ftContractAddress, ftContractName, stxAddress) => {
    try {
      const options = {
        contractAddress: ftContractAddress,
        contractName: ftContractName,
        functionName: "get-symbol",
        functionArgs: [],
        senderAddress: stxAddress,
        network: "testnet"
      };

      const response = await fetchCallReadOnlyFunction(options);
      return response.value.value;
    } catch (e) {
      console.error("Get token symbol error: ", e);
      return null;
    }
}

export const fetchUserApts = async (stxAddress, toast) => {
    if (!stxAddress) return [];

    try {
      
      const url = `https://api.testnet.hiro.so/extended/v2/addresses/${stxAddress}/balances/ft?limit=100&offset=0`;
      const response = await axios.get(url);
      const ftBalances = response.data.results;

      const ownedAptsWithImages = (await Promise.all(
        ftBalances.map(async (ft) => {
          const ftContract = ft.token.split('::')[0];
          const [ftContractAddress, ftContractName] = ftContract.split('.');
          
          const isWhitelisted = await isFtWhitelisted(ftContractAddress, ftContractName, stxAddress);
          if (!isWhitelisted) {
            return null;
          }

          console.log("ftContract address: ", ftContractAddress)
          console.log("ftContract address: ", ftContractName)


          const imageData = await getFtImageUrl(ftContractAddress, ftContractName, stxAddress);
          const name = await getTokenName(ftContractAddress, ftContractName, stxAddress);
          const symbol = await getTokenSymbol(ftContractAddress, ftContractName, stxAddress);
          console.log("symbol: ", symbol)
          console.log("imageData: ", imageData)
          console.log("name: ", name)


          // Fetch staked amount
          let stakedAmount = 0;
          let unlockTime = 0;

          try {
            const mapKey = (stxAddress);
            const mapName = `locked-${symbol}`;
            
            const stakedAmountResult = await fetchContractMapEntry({
              contractAddress: ftContractAddress,
              contractName: ftContractName,
              mapName: mapName,
              mapKey: Cl.principal(mapKey),
              network: 'testnet'
            });
            console.log("stake amount: ",stakedAmount)
            console.log("stake amount: ",stakedAmountResult.value.value)

            if (stakedAmountResult && stakedAmountResult.value.value.amount.value && stakedAmountResult.value.value.time.value ) {
              stakedAmount = Number(stakedAmountResult.value.value.amount.value);
              unlockTime = Number(stakedAmountResult.value.value.time.value);

            console.log("stake amount: ",stakedAmount)

            }
          } catch (e) {
            console.error(`Could not fetch staked amount for ${symbol}`, e);
          }

          return {
            ...ft,
            imageUrl: imageData,
            name: name || ft.token.split('::')[1],
            symbol: symbol,
            isListed: false,
            stakedAmount: stakedAmount / 1000000,
            UnlockTime: unlockTime
          };
        })
      )).filter(Boolean);
      return ownedAptsWithImages;
    } catch (error) {
      console.error('Error loading user APTs:', error);
      toast({
        title: 'Data Loading Error',
        description: 'Failed to load your APTs. Please try again later.',
        variant: 'destructive'
      });
      return [];
    }
  };
