import * as contract from './contracts/marketplace';

/* Action codes */
export const INIT_TX = 'INIT_TX';
export const CONFIRMATION_TX = 'CONFIRMATION_TX';
export const CONFIRMED_TX = 'CONFIRMED_TX';

export const USER_LOGGED_IN = 'USER_LOGGED_IN';
export const USER_LOGGED_OUT = 'USER_LOGGED_OUT'
export const USER_BALANCE_UPDATED = 'USER_BALANCE_UPDATED';

export const ITEM_ADDED = 'ITEM_ADDED';
export const PULL_STORES = 'PULL_STORES';
export const PULL_STORE = 'PULL_STORE';
export const PULL_ITEMS = 'PULL_ITEMS';

export const USER_PENDING_FUNDS_UPDATED = 'USER_PENDING_FUNDS_UPDATED';
export const IS_EMERGENCY_UPDATED = 'IS_EMERGENCY_UPDATED';

export const ETH_PRICE_UPDATED = 'ETH_PRICE_UPDATED';
export const NETWORK_VERSION_UPDATED = 'NETWORK_VERSION_UPDATED';
export const LOGIN_METHOD_USED = 'LOGIN_METHOD_USED';

/* Actions */

function itemsMustBeUpdated(store, forceFetch) {
    return store && ((store.numItems > 0 && !store.items.length) || forceFetch);
}
export function pullItems(sellerAddress, storeId, forceFetch) {
    return function(dispatch, getState) {
        sellerAddress = sellerAddress.toUpperCase();

        const store = getState().store.storesBySeller[sellerAddress]
            && getState().store.storesBySeller[sellerAddress].stores.find(it => it.storeId === storeId);

        if(itemsMustBeUpdated(store, forceFetch)) {
            contract.getItemsMetadata(sellerAddress, storeId)
                .then((items) => {
                    dispatch({
                        type: PULL_ITEMS,
                        store,
                        items,
                    })
                });
        }
    }
}

export function pullStore(sellerAddress, storeId, forceFetch) {
    return function(dispatch, getState) {
        sellerAddress = sellerAddress.toUpperCase();

        const newStoresMetadata = getState().store.storesBySeller[sellerAddress]
            && getState().store.storesBySeller[sellerAddress].stores.find(it => it.storeId === storeId);

        if (!newStoresMetadata || forceFetch) {
            contract.getStoreMetadata(sellerAddress, storeId).then(store => {
                dispatch({
                    type: PULL_STORE,
                    sellerAddress,
                    store,
                });
            });
        }
    }
}

export function pullStores(sellerAddresses, forceFetch) {
    return function(dispatch, getState) {
        Promise.all(sellerAddresses
            .filter(sellerAddress => forceFetch || !getState().storesBySeller || !getState().storesBySeller[sellerAddress])
            .map(async sellerAddress => ({ sellerAddress, stores: await contract.getStoresMetadataBySeller(sellerAddress) }))
        ).then(newStoresMetadata => dispatch({ type: PULL_STORES, newStoresMetadata }));
    }
}

export function pullEveryStore(forceFetch) {
    return function(dispatch, getState) {
        if (forceFetch || !getState().sellers) {
            contract.getSellerAddresses()
                .then(sellers => {
                    sellers = sellers.map(it => it.toUpperCase());
                    // We get the needed stores metadata
                    return Promise.all(sellers
                        .filter(sellerAddress => forceFetch || !getState().storesBySeller || !getState().storesBySeller[sellerAddress])
                        .map(async sellerAddress => ({ sellerAddress, stores: await contract.getStoresMetadataBySeller(sellerAddress) }))
                    );
                })
                .then(newStoresMetadata => dispatch({ type: PULL_STORES, newStoresMetadata }));
        }
    }
}
