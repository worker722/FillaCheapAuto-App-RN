// @flow
import firebase from 'react-native-firebase';
// Optional flow type
import type { RemoteMessage } from 'react-native-firebase';
import Store from '../Stores';

export default async (message: RemoteMessage) => {
  // handle your message
  console.log("remote psuh")

  let { orderStore } = Store;
  orderStore.setNotificationCount(orderStore.notificationCount + 1);

  const localNotification = new firebase.notifications.Notification({
    sound: 'default',
    show_in_foreground: true,
  })
    .setNotificationId(new Date().toLocaleString())
    .setTitle(message.data.title)
    .setBody(message.data.body)
    .android.setChannelId('Carspot-ID')
    .android.setColor('#000000')
    .android.setPriority(firebase.notifications.Android.Priority.High);

  firebase.notifications()
    .displayNotification(localNotification)
    .catch(err => console.error(err));

  return Promise.resolve(message);
}