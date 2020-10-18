// @flow
import firebase from 'react-native-firebase';
// Optional flow type
import type { RemoteMessage } from 'react-native-firebase';

export default async (message: RemoteMessage) => {
  // handle your message
  console.log("remote psuh")
  const localNotification = new firebase.notifications.Notification({
    sound: 'default',
    show_in_foreground: true,
    show_in_background: true
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