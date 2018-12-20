'use strict';

import React from 'react';
import ReactDom from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import App from './App';
import Login from './components/Login.jsx';
import Page from './components/Page.jsx';
import IndexPage from './components/IndexPage.jsx'

import bigScreen from './components/finishWork/bigScreen.jsx'
import FinishWork from './components/finishWork/FinishWork.jsx'
//consumption
import OrderManage from './components/consumption/OrderManage.jsx';
import Order from './components/consumption/Order.jsx'
import CostClose from './components/consumption/CostClose.jsx';
import FixOrder from './components/consumption/FixOrder.jsx';
import OrderDetail from './components/consumption/OrderDetail.jsx';
import ReservationManage from './components/consumption/ReservationManage.jsx'
//income
import IncomeSearch from './components/income/IncomeSearch.jsx';
import IncomeDetail from './components/income/IncomeDetail.jsx';
import PayDetail from './components/income/PayDetail.jsx';
import OtherPay from './components/income/OtherPay.jsx';
import HistoryIncomeDetail from './components/income/HistoryIncomeDetail.jsx';
import HistoricalAccount from './components/income/HistoricalAccount.jsx';
import HistoryOutcomeDetail from './components/income/HistoryOutcomeDetail.jsx';
//member
import ClientInfo from './components/member/ClientInfo.jsx'
import ClientDetail from './components/member/ClientDetail.jsx'
import PayHistory from './components/member/PayHistory.jsx'
import AddClient from './components/member/AddClient.jsx'
import BuyCard from './components/member/BuyCard.jsx'
import ModifyClient from './components/member/ModifyClient.jsx'
import AutoInsurance from './components/member/AutoInsurance.jsx'

//product
import ItemManage from './components/productManage/ItemManage.jsx';
import PartsManage from './components/productManage/PartsManage.jsx';
import CardManage from './components/productManage/CardManage.jsx';
import AddParts from './components/productManage/AddParts.jsx';
//buy
import ProviderManage from './components/buySellStock/ProviderManage.jsx';
import ProductSearch from './components/buySellStock/ProductSearch.jsx';
import ReceiptDetail from './components/buySellStock/ReceiptDetail.jsx';
import PutInStorage from './components/buySellStock/PutInStorage.jsx';
import SellProduct from './components/buySellStock/SellProduct.jsx';
import ProductReceipts from './components/buySellStock/ProductReceipts.jsx';
import StorageEdit from './components/buySellStock/StorageEdit.jsx';
import ProviderDetail from './components/buySellStock/ProviderDetail.jsx';
import BusinessSummary from './components/dataTable/BusinessSummary.jsx';
import flowDetails from './components/dataTable/flowDetails.jsx';

//system
import StaffManage from './components/systemSetting/StaffManage.jsx';
import AccountManage from './components/systemSetting/AccountManage.jsx';
import StaffDetail from './components/systemSetting/StaffDetail.jsx';
import StoreAdd from './components/systemSetting/StoreAdd.jsx';
import StoreComment from './components/systemSetting/StoreComment.jsx';
import StoreManage from './components/systemSetting/StoreManage.jsx';
import StoreDetail from './components/systemSetting/StoreDetail.jsx';
import CabinetManage from './components/systemSetting/CabinetManage.jsx';

//marketingManagement
import preferentialActivities from './components/marketingManagement/preferentialActivities.jsx';

import OrderManagement from './components/orderManagement/OrderManagement.jsx';
const routes = < Route path={"/"} components={Page}>
    <Route path={"login"} component={Login} />
    <Route path={"bigScreen"} component={bigScreen} />
    <Route path={"orderManagement"} component={OrderManagement} />
    <Route path={"finishWork"} component={FinishWork} />
    <Route path={"app"} component={App} >
        <Route path={"consumption"} >
            <Route path={"order(/:modifyId)"} component={Order} />
            <Route path={"fixorder"} component={FixOrder} />
            <Route path={"costclose/:orderId"} component={CostClose} />
            <Route path={"ordermanage"} component={OrderManage} />
            <Route path={"ordermanage/:orderId"} component={OrderDetail} />
            <Route path={"reservationManage"} component={ReservationManage} />
        </Route>
        <Route path={"incomeManage"} >
            <Route path={"incomeSearch"} component={IncomeSearch} />
            <Route path={"incomeSearch/incomedetail/:mode"} component={IncomeDetail} />
            <Route path={"incomeSearch/paydetail/:mode"} component={PayDetail} />
            <Route path={"historyAccount"} component={HistoricalAccount} />
            <Route path={"historyIncomeDetail/:Date"} component={HistoryIncomeDetail} />
            <Route path={"historyOutcomeDetail/:Date"} component={HistoryOutcomeDetail} />
            <Route path={"otherPay"} component={OtherPay} />
        </Route>
        <Route path={"member"} >
            <Route path={"memberShip(/:id)"} component={BuyCard} />
            <Route path={"customer"} component={ClientInfo} />
            <Route path={"customer/:id"} component={ClientDetail} />
            <Route path={"modifyclient/:id"} component={ModifyClient} />
            <Route path={"customer/:id/payhistory"} component={PayHistory} />
            <Route path={"addclient"} component={AddClient} />
            <Route path={"autoInsurance"} component={AutoInsurance} />
        </Route>
        <Route path={"buySellStock"} >
            <Route path={"productSearch"} component={ProductSearch} />
            <Route path={"putInStorage"} component={PutInStorage} />
            <Route path={"storageEdit/:receiptId"} component={StorageEdit} />
            <Route path={"sellProduct"} component={SellProduct} />
            <Route path={"providerManage"} component={ProviderManage} />
            <Route path={"providerDetail/:providerId"} component={ProviderDetail} />
            <Route path={"productReceipts/:receiptId"} component={ReceiptDetail} />
        </Route>
        <Route path={"productManage"} >
            <Route path={"addParts"} component={AddParts} />
            <Route path={"itemManage"} component={ItemManage} />
            <Route path={"partsManage"} component={PartsManage} />
            <Route path={"cardManage"} component={CardManage} />
        </Route>
        <Route path={"dataTable"} >
            <Route path={"businessSummary"} component={BusinessSummary} />
            <Route path={"flowDetails"} component={flowDetails} />
        </Route>
        <Route path={"marketingManagement"}>
            <Route path={"preferentialActivities"} component={preferentialActivities} />
        </Route>
        <Route path={"systemSet"} >
            <Route path={"staffManage"} component={StaffManage} />
            <Route path={"accountManage"} component={AccountManage} />
            <Route path={"storeAdd"} component={StoreAdd} />
            <Route path={"storeAdd/:storeId"} component={StoreAdd} />
            <Route path={"staffManage/:id"} component={StaffDetail} />
            <Route path={"storeManage"} component={StoreManage} />
            <Route path={"storeDetail/:storeId"} component={StoreDetail} />
            <Route path={"storeComment"} component={StoreComment} />
            <Route path={"cabinetManage"} component={CabinetManage} />
        </Route>
        <Route path="/dashboard/index" component={IndexPage} />
    </Route>
</Route>

ReactDom.render((
    <Router history={hashHistory} >
        {routes}
    </Router>),
    document.getElementById('app')
);