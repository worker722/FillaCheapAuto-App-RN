import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { YellowBox } from 'react-native';
import bgMessaging from './src/firebase/bgMessaging';
import firebase from 'react-native-firebase';
import messaging from '@react-native-firebase/messaging';
console.disableYellowBox = true;
// YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader','Class RCTCxxModule']);

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log("index psuh")
    console.log(remoteMessage)
    const localNotification = new firebase.notifications.Notification({
        sound: 'default',
        show_in_foreground: true
    })
        .setNotificationId(new Date().toLocaleString())
        .setTitle(remoteMessage.notification.title)
        .setBody(message.notification.body)
        .android.setChannelId('Carspot-ID')
        .android.setColor('#000000')
        .android.setPriority(firebase.notifications.Android.Priority.High);

    firebase.notifications()
        .displayNotification(localNotification)
        .catch(err => console.error(err));
});

AppRegistry.registerComponent('carsport', () => App);
//AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);
