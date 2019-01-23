import React from 'react';
import ExpectingConfirmationsContainer from '../../../tx/ui/expectingConfirmations/ExpectingConfirmationsContainer';
import { getWeb3 } from '../../../util/connectors';

const Footer = ({ address, roleName, balance, pendingFunds }) => {
    return(
    	<div>
            <div>Address: {address}
                | Role: {roleName}
                { balance && <span>| Balance: {getWeb3().utils.fromWei(balance, 'finney')} Finney</span>}
                { pendingFunds && <span>| Pending funds: {getWeb3().utils.fromWei(pendingFunds, 'finney')} Finney</span>}
            </div>
            <ExpectingConfirmationsContainer />
  	    </div>
    )
}

export default Footer
