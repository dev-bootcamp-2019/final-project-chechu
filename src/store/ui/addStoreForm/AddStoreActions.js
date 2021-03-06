import { contract } from '../../../util/contracts/marketplace';
import { initTx, confirmationTx } from '../../../tx/ui/expectingConfirmations/ExpectingConfirmationsActions';
import { pullStore } from '../../../util/actions';

export async function storeAdded(dispatch, receipt) {
    const { seller, storeId } = receipt.events.StoreCreated.returnValues;
    dispatch(pullStore(seller, storeId, true));
}

export function addStore(name) {
    return function(dispatch) {
        contract.methods.addStore(name)
            .send()
            .on('transactionHash', txHash => {
                dispatch(initTx(txHash));
            })
            .on('confirmation', (confirmationNumber, receipt) => {
                dispatch(confirmationTx(confirmationNumber, receipt, storeAdded.bind(null, dispatch)));
            })
            .on('error', (error, receipt) => {
                if(!/User denied transaction signature/.test(error.message)) {
                    console.error(error, receipt);
                }
            });
    }
}
