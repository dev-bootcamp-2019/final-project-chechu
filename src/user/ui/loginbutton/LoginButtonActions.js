import { initUport, initBrowserProvider, getWeb3 } from './../../../util/connectors.js';
import { browserHistory } from 'react-router';
import { initContract as initMarketplaceContract, contract as marketplace, ROLES } from '../../../util/contracts/marketplace';
import { initContract as initKrakenContract, contract as kraken } from '../../../util/contracts/krakenPriceTicker';
import { USER_LOGGED_IN, USER_BALANCE_UPDATED, USER_PENDING_FUNDS_UPDATED, IS_EMERGENCY_UPDATED, ETH_PRICE_UPDATED } from '../../../util/actions';

function userLoggedIn(user) {
    return {
        type: USER_LOGGED_IN,
        payload: user,
    }
}

function redirectAfterLogin() {
    // Used a manual redirect here as opposed to a wrapper.
    // This way, once logged in a user can still access the home page.
    const currentLocation = browserHistory.getCurrentLocation();

    if ('redirect' in currentLocation.query) {
        return browserHistory.push(decodeURIComponent(currentLocation.query.redirect));
    }
    return browserHistory.push('/dashboard');
}

async function getUserData(dispatch, address) {
    initMarketplaceContract(address);
    initKrakenContract(address);

    // Role info
    let role = await marketplace.methods.getRole().call();

    // Is the owner?
    const isOwner = await marketplace.methods.isOwner().call();
    if (isOwner) {
        role = ROLES.OWNER;
    }
    const roleName = ROLES.getRoleName(role);
    dispatch(userLoggedIn({ address, role: { name: roleName, id: role } }));

    // New balance info
    const newBalance = await getWeb3().eth.getBalance(address);
    dispatch({ type: USER_BALANCE_UPDATED, newBalance });

    // Pending funds
    if (role === ROLES.SELLER) {
        const pendingFunds = await marketplace.methods.getPendingFunds().call();
        dispatch({ type: USER_PENDING_FUNDS_UPDATED, pendingFunds });
    }

    // Is the marketplace in emergency?
    const isEmergency = await marketplace.methods.stopped().call();
    dispatch({ type: IS_EMERGENCY_UPDATED, isEmergency });

    // Kraken subscription to changes in ETH-USD
    kraken.events.LogNewKrakenPriceTicker({ fromBlock: 0 }, (error, res) => {
        console.log('Change from Kraken!', { error, res });
        dispatch({ type: ETH_PRICE_UPDATED, price: res.returnValues.price });
    });

    return redirectAfterLogin();
}

function browserProviderLogin() {
    return function(dispatch) {
        return initBrowserProvider().then((web3) => {
            const getAddress = new Promise((resolve, reject) => {
                if (web3) {
                    web3.eth.getCoinbase((error, address) => {
                        if (error) {
                            console.log('Error getting the ETH address: ', error);
                            reject(error);
                        } else {
                            resolve(address.toUpperCase());
                        }
                    });
                }
            });
            return getAddress
                .then(getUserData.bind(this, dispatch));
        });
    }
}

function uportLogin() {
  return function(dispatch) {
    const { web3 } = initUport();
    const getAddress = new Promise((resolve, reject) => {
        if (web3) {
            web3.eth.getCoinbase((error, address) => {
                if (error) {
                    console.log('Error getting the ETH address: ', error);
                    reject(error);
                } else {
                    resolve(address.toUpperCase());
                }
                /*
                uport.requestDisclosure({requested: ['name', 'country', 'image', 'avatar'], notifications: true, verified: ['Jesus Marketplace info']});
                uport.onResponse('disclosureReq').then(res => {
                    console.log({res})
                    dispatch(userLoggedIn({ ...res.payload, address, did: uport.did }));
                });
                */
            });
        }
    });
    return getAddress
        .then(getUserData.bind(this, dispatch));
  }
}

const LOGINS = { browserProviderLogin, uportLogin };

export function loginUser(provider) {
    return LOGINS[`${provider}Login`]();
}
