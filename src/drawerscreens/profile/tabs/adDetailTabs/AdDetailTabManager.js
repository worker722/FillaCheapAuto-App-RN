import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { HeaderBackButton } from 'react-navigation-stack';
import Toolbar from '../../../../config/DetailToolbarMenu';

import Appearences from '../../../../config/Appearences';
import Overview from './tabs/overview/Overview';
import Bids from './tabs/bids/Bids';
import Store from '../../../../Stores';
import Toast from 'react-native-simple-toast';
import Api from '../../../../network/Api';
import Loader from '../../../../components/Loader';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Db from '../../../../storage/LocalDb';
import { observer } from 'mobx-react';
import stores from '../../../../Stores/orderStore';
import { values } from 'lodash';
import ConfirmDialogue from '../../../../components/ConfirmDialogue';
import MenuConfirmDialogue from '../../../../components/ConfirmDialogue';
@observer
export default class AdDetailTabManager extends React.Component {
selec_opt;item; option; text; index;
nav_data = this.props.navigation.state.params.adId;
repeat=false;

constructor(props) {
  super(props);

  this.state = {
    showSpinner: true,
    currentItem: 1,
    currentImage: 0,
    isImageViewVisle: false,
    screenTitle: "title",
    bidsVisible: true,
    index: 0,
    descriptionTitle: [{
      title: '',

    }],
    mapTitle: [{
      title: '',

    }],
    ad_data:'',
    showMenuConfirmDialogue: false,
    showConfirmDialogue:false
  }

}
getdata(){
  let { orderStore } = Store;
  if(orderStore.detailToolbarModel.repeat == true){
    //console.log('j')
    if(orderStore.detailToolbarModel.status == 'Edit'){
      this.props.navigation.navigate('SellEdit', { adId: orderStore.detailToolbarModel.data.ad_id, isUpdate: true });
    }
    else if(orderStore.detailToolbarModel.status == 'Delete'){
      this.setState({showConfirmDialogue: true})
      this.item =  orderStore.detailToolbarModel.data.ad_id
    }
    else{
      this.setState({showMenuConfirmDialogue: true})
      this.option = orderStore.detailToolbarModel.status;
      this.item =  orderStore.detailToolbarModel.data.ad_id
    }
    orderStore.setOnClickActiveListner(false,'','');
  }
  
}
componentDidMount(){
  let timer = setInterval(()=> this.getdata(), 1000)
 }


  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('otherParam', stores.screenTitles.ad_detail),
    headerStyle: {
        backgroundColor: stores.color,
      },

      headerTitleStyle: {
        flex: 1,
        color: 'white',
        textAlign: "center",
        fontFamily: Appearences.Fonts.paragaphFont,
        fontSize: 13,
        fontWeight: "200",

      },
      headerRight: <Toolbar fnc={async(val,id) => {
      }}/>,
      headerLeft: <HeaderBackButton
        onPress={() => {
        navigation.goBack(null) }} tintColor={'#fff'} />
  });

  
  componentWillUpdate = () => {
    let { orderStore } = Store;
    orderStore.setAdDetailComponentMounted(false);
  }
  componentWillMount = async () => {
    let { orderStore } = Store;

    const params = { ad_id: this.props.navigation.state.params.adId };
    // console.warn('ad id is',JSON.stringify(params));

    orderStore.adDetail = await Api.post('ad_post', params);
    // console.log('so res is',JSON.stringify(orderStore.adDetail))
    const data = orderStore.adDetail.data;
    this.setState({ad_data: data})
    const staticText = data.static_text;
    this.setState({ bidsVisible: data.bid_popup.is_show });
    orderStore.setDetailToolbarModel(staticText, data.report_popup.select);
    orderStore.detailToolbarModel.shareText = staticText.share_btn;
    if (orderStore.adDetail.success === true) {

      // console.log('ad detail', JSON.stringify(data))
      let descriptionTitleClone = [...this.state.descriptionTitle];
      let mapTitleClone = [...this.state.mapTitle];

      descriptionTitleClone[0].title = staticText.description_title;
      mapTitleClone[0].title = data.ad_detail.location.title;
      const profile = await Db.getUserProfile();
      if (profile != null) {


        if (profile.id == data.profile_detail.id) {
          orderStore.setAdDetailComponentMounted(true);

        }
        else {
          orderStore.setAdDetailComponentMounted(false);
        }
      }







      this.setState({ descriptionTitle: descriptionTitleClone, mapTitle: mapTitleClone });




    }
    this.setState({ showSpinner: false });

  }
  deleteItem = async (item) => {
    this.setState({ showSpinner: true });

    const params = { ad_id: item, }
    let response = await Api.post('ad/delete', params);
    if (response.success === true) {
      this.props.navigation.goBack();
    }

    this.setState({ showConfirmDialogue: false });
    if (response.message.length != 0)
      Toast.show(response.message);
    // this.recallService(1);
  }
  onOptionSelected = async (item, option) => {
    this.setState({ showSpinner: true, showMenuConfirmDialogue: false });

    let params = {
      ad_id: item,
      ad_status: option,
    };
    //console.log(params)
    let response = await Api.post('ad/update/status', params);
    if (response.success === true) {
      this.props.navigation.goBack();
    }
    if (response.message.length != 0)
      Toast.show(response.message);
    this.setState({ showSpinner: false });
  }

  _renderLabel = ({ route }) => (
    <Text>{route.title}</Text>
  );

  getNavigationState = () => {
    let { orderStore } = Store
    return navigationState = {
      index: this.state.index,
      routes: [
        { key: 'Overview', title: orderStore.adDetail.data.tabs_text.overview_tab_text, },
        { key: 'Bids', title: orderStore.adDetail.data.tabs_text.bid_tab_text },

      ],
    };
  }
  getNavigationStateNoBid = () => {
    return navigationStateNoBid = {
      index: this.state.index,
      routes: [
        { key: 'Overview', title: 'Overview' },

      ],

    };
  }

  _renderTabBar = props => (
    <TabBar
      {...props}
      scrollEnabled
      pressColor={stores.color}
      indicatorStyle={{ backgroundColor: stores.color, top: 0, }}
      style={this.state.bidsVisible ? { backgroundColor: 'white', height: 45, justifyContent: 'center', } : { height: 0, width: 0 }}
      labelStyle={{ color: 'black' }}
      renderLabel={this._renderLabel}

    />
  );

  renderScene = ({ route, jumpTo }) => {

    let { orderStore } = Store;
    switch (route.key) {
      case 'Overview':
        return <Overview
          callBackFunc={async (item) => {


            this.setState({ showSpinner: true });

            let { orderStore } = Store;


            const params = { ad_id: item.ad_id };
            orderStore.adDetail = await Api.post('ad_post', params);
            const data = orderStore.adDetail.data;
            const staticText = data.static_text;
            this.setState({ bidsVisible: data.bid_popup.is_show });
            orderStore.setDetailToolbarModel(staticText, data.report_popup.select);
            orderStore.detailToolbarModel.shareText = staticText.share_btn;
            if (orderStore.adDetail.success === true) {


              let descriptionTitleClone = [...this.state.descriptionTitle];
              let mapTitleClone = [...this.state.mapTitle];

              descriptionTitleClone[0].title = staticText.description_title;
              mapTitleClone[0].title = data.ad_detail.location.title;

              const profile = await Db.getUserProfile();
              if (profile != null) {


                if (profile.id == data.profile_detail.id) {
                  orderStore.setAdDetailComponentMounted(true);

                }
                else {
                  orderStore.setAdDetailComponentMounted(false);
                }
              }
              this.setState({ descriptionTitle: descriptionTitleClone, mapTitle: mapTitleClone });
            }

            this.setState({ showSpinner: false });
          }}
        />;
      case 'Bids':
        if (this.state.bidsVisible)
          return <Bids
          // callBackFunc = {()=>{
          //   this.setState({onPageTwoNextClick:false,index:2,indexToShow:3})
          // }}
          />;
        return null;

      default:
        return null;
    }
  }


  render() {
    if (this.state.showSpinner)
      return (

        <Loader />


      );
    return (
      <>
      <TabView
        navigationState={this.state.bidsVisible ? this.getNavigationState() : this.getNavigationStateNoBid()}
        renderScene={this.renderScene}
        tabBarPosition="bottom"
        renderTabBar={this._renderTabBar}
        onIndexChange={index => this.setState({ index: index })}
        initialLayout={{ height: 0, width: Dimensions.get('window').width }}
        swipeEnabled={false}
      />
        <ConfirmDialogue
          visible={this.state.showConfirmDialogue}
          onConfirm={() => { this.deleteItem(this.item) }}
          onCancel={() => { this.setState({ showConfirmDialogue: false }) }}
        />
        <MenuConfirmDialogue
          visible={this.state.showMenuConfirmDialogue}
          onConfirm={() => { 
            //console.log(this.item)
            this.onOptionSelected(this.item, this.option) }}
          onCancel={() => { this.setState({ showMenuConfirmDialogue: false }) }}
        />
      </>
    );
  }
}

