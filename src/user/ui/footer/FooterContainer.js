import { connect } from 'react-redux'
import Footer from './Footer'

const mapStateToProps = (state, ownProps) => {
    return {
        address: state.user.data.address,
        roleName: state.user.data.role.name,
        balance: state.user.balance,
        pendingFunds: state.user.pendingFunds,
        ETHPriceInUSD: state.tx.ETHPriceInUSD,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

const FooterContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Footer)

export default FooterContainer
