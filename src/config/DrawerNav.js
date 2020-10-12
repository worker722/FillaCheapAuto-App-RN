//import {createDrawerNavigator} from 'react-navigation';
import React from 'react';
import {View, Text} from 'react-native'
import _ from 'lodash'
import Home from '../drawerscreens/home/Home';
import Profile from '../drawerscreens/profile/Profile';
import AdvancedSearch from '../drawerscreens/search/AdvancedSearch';
import Inbox from '../drawerscreens/inbox/Inbox';
import {createDrawerNavigator} from 'react-navigation-drawer';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Comparison from '../drawerscreens/comparison/Comparison';
import { Icon } from 'react-native-elements';

import About from '../drawerscreens/about/About';
import Blog from '../drawerscreens/blog/Blog';
import ReviewGrid from '../drawerscreens/review/ReviewGrid';
import Support from '../drawerscreens/support/Support';
import ContactUs from '../drawerscreens/contact/ContactUs';
import Package from '../drawerscreens/package/Package';
import Shop from '../drawerscreens/shop/Shop';
import ShopFilters from '../drawerscreens/shop/filters/ShopFilters';
import Cart from '../drawerscreens/shop/cart/Cart';
import Sell from '../drawerscreens/sell/Sell';
import DetailOfAds from '../drawerscreens/profile/tabs/adDetailTabs/AdDetailTabManager';
import AdDetailTabManager from '../drawerscreens/profile/tabs/adDetailTabs/AdDetailTabManager';
import AdDetail from '../drawerscreens/profile/tabs/adDetailTabs/AdDetailTabManager';
import Search from '../drawerscreens/search/AdvancedSearch';
import SearchDetail from '../drawerscreens/search/detail/SearchDetail';
import SearchDetailRightIcon from '../components/SearchDetailRightIcon';
import DrawerRightIcons from '../config/DrawerRightIcons';
import DealerTabManager from '../drawerscreens/dealer/DealerTabManager';
import SellEdit from '../drawerscreens/sellEdit/SellEdit';
import Store from './../Stores';



import {
    I18nManager
  } from 'react-native';
import SideMenu from './SideMenu';
import { createStackNavigator } from 'react-navigation-stack';
import Chat from '../drawerscreens/inbox/chat/Chat';

let { orderStore } = Store;
console.log('orderStore orderStore orderStore',orderStore.drawerMenu)
// orderStore.drawerMenu.map((item, key) => { console.log('=>>>>>>>>>>>>>>>>>>>>>>>> Item',item)});
var result = _.find(orderStore.drawerMenu, { "key": "inbox_list" });
//console.log('loadsh result of drawer menu inbox',result);
const commonOptions = {
  headerStyle: {
    backgroundColor: 'green',
    borderBottomWidth: 0,
  },
};
const HomeStack = createStackNavigator({
  Home: {
    screen: Home,
    header: null
  },
  AdDetail: {
    screen: AdDetail,
    header: null
  },
  AdDetailTabManager: {
    screen: AdDetailTabManager,
    header: null
  },
  DealerTabManager: {
    screen: DealerTabManager,
    navigationOptions: {
      headerTitleStyle: {
        flex: 1,
        color: 'white',
        textAlign: "center",
        fontSize: 13,
        fontWeight: "200",

      },


      headerTintColor: "#fff",
      headerRight: <DrawerRightIcons />,

    }


  },
  SellEdit: {
    screen: SellEdit,
    navigationOptions: {
      headerTitleStyle: {
        flex: 1,
        color: 'white',
        textAlign: "center",
        fontSize: 13,
        fontWeight: "200",
      },
      headerTintColor: "#fff",
      headerRight: <DrawerRightIcons />,
    }
  },
  Comparison:{
    screen: Comparison,
    header: null,
  },
  Package: {
      screen: Package,
      header: null,
  },
  ReviewGrid:{
    screen:ReviewGrid,
    header: null,
  },
  About:{
    screen:About,
    header: null,
  },
  ContactUs:{
    screen:ContactUs,
    header: null,
  },
  Blog:{
    screen:Blog,
    header: null,
  },
}, {
  initialRouteName: 'Home',
  navigationOptions: ({ navigation }) => {
    let tabBarVisible = true;
    // const { routeName } = navigation.state.routes[navigation.state.index];
    // if (routeName !== 'Home') {
    //   tabBarVisible = false;
    // }
    return {
      ...commonOptions,
      tabBarVisible,
    };
  },
});

const AdvanceSearchStack = createStackNavigator({
  AdvancedSearch: {
    screen: AdvancedSearch,
    header: null
  },
  
  Search: {
    screen: Search,
    header: null,
  },
  SearchDetail: {
    screen: SearchDetail,
    header: null,
    // navigationOptions: {
    //   headerTitleStyle: {
    //     flex: 1,
    //     color: 'white',
    //     textAlign: "center",
    //     fontSize: 13,
    //     fontWeight: "200",

    //   },


    //   headerTintColor: "#fff",
    //   headerRight: <SearchDetailRightIcon />,


    // }
  },
  
}, {
  initialRouteName: 'AdvancedSearch',
  navigationOptions: ({ navigation }) => {
    let tabBarVisible = true;
    // const { routeName } = navigation.state.routes[navigation.state.index];
    // if (routeName !== 'Home') {
    //   tabBarVisible = false;
    // }
    return {
      ...commonOptions,
      tabBarVisible,
    };
  },
});

const SellStack = createStackNavigator({
  Sell: {
    screen: Sell,
    header: null
  },
  
}, {
  initialRouteName: 'Sell',
  navigationOptions: ({ navigation }) => {
    let tabBarVisible = true;
    return {
      ...commonOptions,
      tabBarVisible,
    };
  },
});

const InboxStack = createStackNavigator({
  Inbox: {
    screen: Inbox,
    header: null
  },
  Chat: {
    screen: Chat,
    header: null,
  },
  
}, {
  initialRouteName: 'Inbox',
  navigationOptions: ({ navigation }) => {
    let tabBarVisible = true;
    return {
      ...commonOptions,
      tabBarVisible,
    };
  },
});

const ProfileStack = createStackNavigator({
  Profile: {
    screen: Profile,
    header: null
  },
  
}, {
  initialRouteName: 'Profile',
  navigationOptions: ({ navigation }) => {
    let tabBarVisible = true;
    return {
      ...commonOptions,
      tabBarVisible,
    };
  },
});

const tabStack = createBottomTabNavigator({
  Home: {
    screen: HomeStack,
    header: null,
    navigationOptions: {
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.navigate('Home');
          defaultHandler();
        },
        tabBarLabel: 'Home',
        tabBarOptions: {
          activeTintColor: '#197A36',
        },
        tabBarIcon: ({ focused, horizontal, tintColor }) => (
          <Icon
            name='home'
            type='font-awesome'
            color={tintColor}
          />
        ),
      },
    },
    AdvancedSearch: {
      screen: AdvanceSearchStack,
      navigationOptions: {
          tabBarOnPress: ({ navigation, defaultHandler }) => {
            navigation.navigate('AdvancedSearch');
            defaultHandler();
          },
          tabBarLabel: 'Search',
          tabBarOptions: {
          activeTintColor: '#197A36',
        },
          tabBarIcon: ({ focused, horizontal, tintColor }) => (
            <Icon
              name='search'
              type='font-awesome'
              color={tintColor}
            />
          ),
        },
      },
  Sell: {
    screen: SellStack,
    navigationOptions: {
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.navigate('Sell');
          defaultHandler();
        },
        tabBarOptions: {
          activeTintColor: '#197A36',
        },
        tabBarIcon: ({ focused, horizontal, tintColor }) => (
          <Icon
            name='plus-square'
            type='font-awesome'
            color={tintColor}
          />
        ),
      },
  },
  Inbox: {
    screen: InboxStack,
    navigationOptions: {
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.navigate('Inbox');
          defaultHandler();
        },
        tabBarOptions: {
          activeTintColor: '#197A36',
        },
        tabBarIcon: ({ focused, horizontal, tintColor }) => (
          <View>
            <Icon
              name='comment'
              type='font-awesome'
              color={tintColor}
            />
            {orderStore.notificationCount !== '' && orderStore.notificationCount > 0 ?
            <View style={{position: 'absolute', height: 20, width: 20, borderRadius:10 , backgroundColor: '#197A36', alignItems: 'center', justifyContent: 'center', bottom: 8, left: 15, borderColor: '#fff', borderWidth: 1}} ><Text style={{fontSize: 10, color: '#fff'}} >{orderStore.notificationCount}</Text></View> : null}
          </View>
        ),
      },
    },
  Profile: {
    screen: ProfileStack,
    navigationOptions: {
        tabBarOnPress: ({ navigation, defaultHandler }) => {
          navigation.navigate('Profile');
          defaultHandler();
        },
        tabBarOptions: {
          activeTintColor: '#197A36',
        },
        tabBarIcon: ({ focused, horizontal, tintColor }) => (
          <Icon
            name='user'
            type='font-awesome'
            color={tintColor}
          />
        ),
      },
    },
  }
);

 DrawerNav = createDrawerNavigator({
    HomeTabs: { screen: tabStack },
    Home:{
        screen:Home,  
      },
    Profile:{
        screen:Profile,
            
    },
    DetailOfAds:{
        screen:DetailOfAds,
            
    },

    // NewAdDetail:{
    //     screen:AdDetailTabManager,
    // },
 
    Sell:{
        screen:Sell,
            
    },

    AdvancedSearch:{
        screen:AdvancedSearch
    },
   
    Inbox:{
        screen:Inbox
    },
 
    Comparison:{
        screen:Comparison,
    },
  
    Package:{
        screen:Package
    },
    Shop:{
        screen:Shop
    },
    ShopFilters:{
        screen:ShopFilters
    },
    Cart:{
        screen:Cart
    },
    About:{
        screen:About
    },
  
    ContactUs:{
        screen:ContactUs
    },
    Blog:{
        screen:Blog
    },
   

    ReviewGrid:{
        screen:ReviewGrid
    },
   
  
    Support:{
        screen:Support
    },
}


,{
    contentComponent: SideMenu,
drawerPosition: I18nManager.isRTL ?'right':'left',
},

);



export default DrawerNav;