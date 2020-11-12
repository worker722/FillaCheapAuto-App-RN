

import React, { Component } from 'react';
import { View, Text, AsyncStorage, Alert, I18nManager, Platform, AppState, SafeAreaView, StatusBar, BackHandler, Linking } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import VersionCheck from 'react-native-version-check';
import StackNav from './src/config/StackNav';
import { MenuProvider } from 'react-native-popup-menu';
import firebase, { NotificationOpen, Notification } from 'react-native-firebase';
import Store from './src/Stores';
import LocalDb from './src/storage/LocalDb';

import { getIntertial } from './src/components/adMob/Intertial';
import Banner from './src/components/adMob/Banner';
//import type { RemoteMessage } from 'react-native-firebase';
import { observer } from 'mobx-react';
import {
  AdMobInterstitial,
} from 'react-native-admob'
import { or } from 'react-native-reanimated';
@observer
export default class App extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      tabBarColor: '#000000',
      showIntertial: false,
      showBannerTop: false,
      showBannerBottom: false,
    };
  }

  handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'inactive') {
    }
  }

  componentDidUpdate() {
    let { orderStore } = Store;
    if (orderStore.banner.isShow == 'true') {
      orderStore.banner.isShow = false;
      if (orderStore.banner.position === 'top')
        this.setState({ showBannerTop: true });
      if (orderStore.banner.position === 'bottom')
        this.setState({ showBannerBottom: true });
    }

    if (orderStore.inter.isShow == 'true') {
      orderStore.inter.isShow = false;
      getIntertial();
    }
  }

  async componentDidMount() {
    await this.subToTopic();
    await this.createNotificationListeners(); //add this line
    AppState.addEventListener('change', this.handleAppStateChange);

    let { orderStore } = Store;

    const channel = new firebase.notifications.Android.Channel(
      'Carspot-ID',
      'Carspot-NAME',
      firebase.notifications.Android.Importance.High
    ).setDescription('A natural description of the channel');
    firebase.notifications().android.createChannel(channel);

    firebase.messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
          firebase.messaging().getToken().then(token => {
            orderStore.DEVICE_TOKEN = token
          })

          if (Platform.OS === 'ios') {
            this.notificationListenerIOS = firebase.messaging().onMessage(notification => {
              // console.warn('notification===>>>',notification);
              let { orderStore } = Store;
              orderStore.setNotificationCount(orderStore.notificationCount + 1);
              //Showing Local notification IOS
              const localNotification = new firebase.notifications.Notification()
                .setNotificationId(new Date().toLocaleString())
                .setTitle(notification.title)
                .setBody(notification.body)

              firebase.notifications()
                .displayNotification(localNotification)
                .catch(err => console.error(err));
            })
          } else {
            this.notificationListenerANDROID = firebase.notifications().onNotification(notification => {
              //Showing local notification Android
              let { orderStore } = Store;
              orderStore.setNotificationCount(orderStore.notificationCount + 1);

              const localNotification = new firebase.notifications.Notification({
                sound: 'default',
                show_in_foreground: true,
              })
                .setNotificationId(new Date().toLocaleString())
                .setTitle(notification.title)
                .setBody(notification.body)
                .android.setChannelId('Carspot-ID')
                .android.setColor('#000000')
                .android.setPriority(firebase.notifications.Android.Priority.High);

              firebase.notifications()
                .displayNotification(localNotification)
                .catch(err => console.error(err));
            })
          }
        } else {
          firebase.messaging().requestPermission()
            .then(() => {
              firebase.messaging().registerForNotifications()
              alert("User Now Has Permission")
            })
            .catch(error => {
              console.log(error);
            });
        }

      });

    const notificationOpen = await firebase.notifications().getInitialNotification();

    if (notificationOpen) {
      // App was opened by a notification
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action;
      // Get information about the notification that was opened
      const notification = notificationOpen.notification;
    }

  }

  componentWillUnmount = async () => {
    AppState.removeEventListener('change', this.handleAppStateChange);
    if (Platform.OS === 'ios')
      this.notificationListenerIOS && this.notificationListenerIOS();
    else
      this.notificationListenerANDROID && this.notificationListenerANDROID();

    AdMobInterstitial.removeAllListeners();
  }

  async subToTopic() {
    let topic = 'global';
    firebase.messaging().subscribeToTopic(topic);
  }

  async componentWillMount() {
    this.checkUpdateNeeded();
    let { orderStore } = Store;
    const launchType = await LocalDb.getLaunchType();
    if (launchType === "first") {
      orderStore.isPublicProfile = true;
      await LocalDb.setLaunchType();
    }
  }

  async createNotificationListeners() {
    firebase.notifications().onNotificationDisplayed((notification: Notification) => {
      // Process your notification as required
      // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    });


    /*
    * Triggered when a particular notification has been received in foreground
    * */
    firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    firebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body } = notificationOpen.notification;
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
    }

    firebase.messaging().onMessage(async message => {
      if (message.data.push_type == 'yes')
        this.showNotification(message.data.title, message.data.body);
    });
  }


  showNotification(title, body) {

    const localNotification = new firebase.notifications.Notification({
      sound: 'default',
      show_in_foreground: true,
    })
      .setNotificationId(new Date().toLocaleString())
      .setTitle(title)
      .setBody(body)
      .android.setChannelId('Carspot-ID')
      .android.setColor('#000000')
      .android.setPriority(firebase.notifications.Android.Priority.High);

    firebase.notifications()
      .displayNotification(localNotification)
      .catch(err => console.error(err));
  }

  checkUpdateNeeded = async () => {
    let updateNeeded = await VersionCheck.needUpdate();
    if (updateNeeded.isNeeded) {
      Alert.alert(
        'Please Update', 'You will have to update your app to the latest version to continue using. ',
        [
          {
            text: 'OK', onPress: () => {
              BackHandler.exitApp();
              Linking.openURL(updateNeeded.storeUrl)
            }
          },
        ],
        { cancelable: false },
      );
    }
  }


  render() {
    let { orderStore } = Store;
    setTimeout(() => {
      this.setState({ tabBarColor: orderStore.appColor })
    }, 5000);
    return (
      <View style={{ flex: 1, }}>
        <MenuProvider>
          <StatusBar
            hidden={false}
            animated={true}
            backgroundColor={this.state.tabBarColor}
            barStyle="light-content"
            networkActivityIndicatorVisible={Platform.OS === 'ios' ? false : false}
            showHideTransition={Platform.OS === 'ios' ? 'slide' : null}
          />
          <SafeAreaView style={{ flex: 1, backgroundColor: this.state.tabBarColor }}>
            {this.state.showBannerTop ? <Banner /> : null}

            <StackNav />
            {/* {this.state.showBannerBottom ? <Banner /> : null} */}

          </SafeAreaView>

        </MenuProvider>

      </View>
    );
  }
}


