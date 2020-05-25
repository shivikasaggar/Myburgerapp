import React, { Component } from "react";
import Auxillary from '../../hoc/Auxillary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler'
import Spinner from '../../components/UI/Spinner/Spinner';
import axios from '../../axios-orders';

const INGRIDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.7,
    bacon: 0.9,
    meat:1.2
}
class BurgerBuilder extends Component {
   /* constructor(props) {
        super(props);
        this.state = { ...}
    }*/
    state = {
        //this ingridients is not an array,its an object therefore we cant apply map.we need to convert object to array.
        ingridients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false

    }
    componentDidMount() {
        console.log(this.props);
        axios.get('https://myburger-react-6c170.firebaseio.com/ingridients.json')
            .then(response => {
                this.setState({ ingridients: response.data });
            });;
    }
    purchaseHandler=()=> {
        this.setState({ purchasing: true });

    }
    purchaseCancelHandler = () => {
        this.setState({ purchasing: false });
    }
    purchaseContinueHandler = () => {
        //alert('You are ready to continueeee!!');

        const queryParam = [];
        for (let i in this.state.ingridients) {
            queryParam.push(encodeURIComponent(i) + '='+ encodeURIComponent(this.state.ingridients[i]));
        }
        queryParam.push('price=' + this.state.totalPrice);
        const queryString = queryParam.join('&');
        this.props.history.push({
            pathname: '/checkout',
            search: '?' + queryString
        });
    }
    updatePurchaseHandler(ingridients) {
       
        const sum = Object.keys(ingridients).map(igKey => {
            return ingridients[igKey];
        }).reduce((sum , el) => {
            return sum + el;
        }, 0);
        this.setState({ purchasable: sum > 0 });
    }

    addIngridientHandler = (type) => {
        const oldCount = this.state.ingridients[type];
        const updatedCount = oldCount + 1;
        const updatedIngridients = {
            ...this.state.ingridients
        };
        updatedIngridients[type] = updatedCount;
        const priceAddition = INGRIDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({ totalPrice: newPrice, ingridients: updatedIngridients });
        this.updatePurchaseHandler(updatedIngridients);
    }
    removeIngridientHandler = (type) => {
       
        const oldCount = this.state.ingridients[type];
        if (oldCount <= 0) {
            return;
        }
        const updatedCount = oldCount - 1;
        const updatedIngridients = {
            ...this.state.ingridients
        };
        updatedIngridients[type] = updatedCount;
        const priceDeducted = INGRIDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice-priceDeducted;
        this.setState({ totalPrice: newPrice, ingridients: updatedIngridients });
        this.updatePurchaseHandler(updatedIngridients);
    }
    render() {
        const disabledInfo = {
            ...this.state.ingridients
        };
        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key]<=0
        }
        let orderSummary = null;
        
        let burger = <Spinner />;
        if (this.state.ingridients) {
            burger = (
                <Auxillary>
                    <Burger ingridients={this.state.ingridients} />
                    <BuildControls
                        ingridientAdded={this.addIngridientHandler}
                        ingridientRemoved={this.removeIngridientHandler}
                        disabled={disabledInfo}
                        purchasable={this.state.purchasable}
                        price={this.state.totalPrice}
                        ordered={this.purchaseHandler} />
                </Auxillary>
            );
            orderSummary = <OrderSummary
                purchaseCanceled={this.purchaseCancelHandler}
                purchaseContinue={this.purchaseContinueHandler}
                price={this.state.totalPrice}
                ingridients={this.state.ingridients} />;
        }
       
        if (this.state.loading) {
            orderSummary = <Spinner />;

        }
        return (
            <Auxillary>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler} >
                    {orderSummary}
                </Modal>
                {burger}
            </Auxillary>
            );
    }

}
export default BurgerBuilder;