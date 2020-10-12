import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import Appearences from '../../config/Appearences';
import Inventory from './tabs/inventory/Inventory';

import Review from './tabs/review/Review';
import Contact from './tabs/contact/Contact';
import Store from '../../Stores';
import orderStore from '../../Stores/orderStore';
import Toast from 'react-native-simple-toast';
import Api from '../../network/Api';
import Loader from '../../components/Loader';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import stores from '../../Stores/orderStore';
export default class DealerTabManager extends React.Component {
isShowInventory = true;
isShowReviews = true;
isShowContact = true;
makeTabTransparent = false;
  static navigationOptions = ({ navigation }) => ({
     headerTitle:stores.screenTitles.public_profile,
    headerStyle: {
      backgroundColor: stores.color,
      
    },
  });

  constructor(props){
    super(props);

    this.state = {
      showSpinner:false,     
      currentItem:1,
      currentImage:0,
      screenTitle:"title",
      index:0,

    }
   
  }
  
componentWillMount = async ()=>{
  let {orderStore} = Store;
  this.setState({showSpinner:true});
  const response = await Api.post('profile/public',{user_id:this.props.navigation.state.params.dealerId});
  // console.log(this.props.navigation.state.params.dealerId);
  if(response.success === true){

      orderStore.publicProfile = response.data;

      this.isShowInventory = response.data.inventory.is_show;
      this.isShowReviews   = response.data.reviews.is_show;
      this.isShowContact   = response.data.form.is_show;


    }

  this.setState({showSpinner:false});

}

  areAllVisible = ()=>{
    if(this.isShowInventory && this.isShowReviews && this.isShowContact)
      return true;
      return false;
  }
  isInventoryVisible = ()=>{
    if(this.isShowInventory && !this.isShowReviews && !this.isShowContact)
        { 
          this.makeTabTransparent = true;
          return true;
        }
        return false;
  }
  isReviewVisible = ()=>{
    if(!this.isShowInventory && this.isShowReviews && !this.isShowContact)
        { 
          this.makeTabTransparent = true;
          return true;
        }
        return false;
  }
  isContactVisible = ()=>{
    if(!this.isShowInventory && !this.isShowReviews && this.isShowContact)
  {   this.makeTabTransparent = true;    
      return true;
          
  }
        return false;
  }
  isIRVisivle = ()=>{
    if(this.isShowInventory && this.isShowReviews && !this.isShowContact)
    return true;
    return false;
  }
  isICVisible = ()=>{
    if(this.isShowInventory && !this.isShowReviews && this.isShowContact)
    return true;
    return false;
  }
  isRCVisible = ()=>{
    if(!this.isShowInventory && this.isShowReviews && this.isShowContact)
    return true;
    return false;
  }
    _renderLabel = ({ route }) => (
      <Text>{route.title}</Text>
    );
    getNav = ()=>{
      return navigationState = {
        index: this.state.index,
        routes: [
          { key: 'Inventory', title: 'Inventory' },
          { key: 'Review', title: 'Review' },
          { key: 'Contact', title: 'Contact' },
  
        ],
      };
    }
    
    navigationStateInventory = {
      index: 0,
      routes: [
        { key: 'Inventory', title: 'Inventory' },
      
      ],
    };
    navigationStateReview = {
      index: 0,
      routes: [
        { key: 'Review', title: 'Review' },

      ],
    };
    navigationStateContact = {
      index: 0,
      routes: [
       
        { key: 'Contact', title: 'Contact' },

      ],
    };
    getNavigationStateIR = ()=>{
     return navigationStateIR = {
        index: this.state.index,
        routes: [
          { key: 'Inventory', title: 'Inventory' },
          { key: 'Review', title: 'Review' },
         
  
        ],
      };
    }
    
    getNavigationStateIC = ()=>{
      return    navigationStateIC = {
        index: this.state.index,
        routes: [
          { key: 'Inventory', title: 'Inventory' },
          { key: 'Contact', title: 'Contact' },
  
        ],
      };
    }
    getNavigationStateRC = ()=>{
      return  navigationStateRC = {
        index: this.state.index,
        routes: [
          { key: 'Review', title: 'Review' },
          { key: 'Contact', title: 'Contact' },
  
        ],
      };
    }
   
    _renderTabBar = props => (
      <TabBar
        {...props}
        scrollEnabled
        pressColor = {orderStore.color}
        indicatorStyle={{backgroundColor:orderStore.color,top:0,}}
        style={!this.makeTabTransparent ? {backgroundColor:'white',height:45,justifyContent:'center'}:{backgroundColor:'white',height:0,justifyContent:'center'}}
        labelStyle = {{color:'black'}}
        renderLabel = {this._renderLabel}
        
       />
    );
    getNavigationState = ()=>{    
      if(this.isInventoryVisible())
         return this.navigationStateInventory;
          if(this.isReviewVisible())
             return this.navigationStateReview;          
              if(this.isContactVisible())
              return this.navigationStateContact;
            if(this.isIRVisivle())
              return this.getNavigationStateIR();
              if(this.isICVisible())
             return this.getNavigationStateIC();
              if(this.isRCVisible())
              return  this.getNavigationStateRC();
             if(this.areAllVisible())
                return  this.getNav();
            }
  
    render() {
      if(this.state.showSpinner)
      return(

        <Loader/>


      );
    return (
        
        <TabView
         navigationState={this.getNavigationState()}
          renderScene={SceneMap({
            Inventory: Inventory,
            Review: Review,
            Contact: Contact,
          })}
          tabBarPosition = "bottom"
          renderTabBar={this._renderTabBar}
          onIndexChange={index => this.setState({ index:index })}
          initialLayout={{ height:0,width: Dimensions.get('window').width }}
        />
      );
    }
  }

