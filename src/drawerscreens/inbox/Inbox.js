import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  Alert,
  TouchableHighlight,
  FlatList,
  RefreshControl,
} from 'react-native';
import moment from 'moment';
import _ from 'lodash';
import styles from './Styles';
import firebase from 'react-native-firebase';
import Store from '../../Stores';
import Toast from 'react-native-simple-toast';
import Api from '../../network/Api';
import { Avatar } from 'react-native-elements';
import NoDataFound from '../../components/NoDataFound';
import Loader from '../../components/Loader';
import * as Progress from 'react-native-progress';
import Appearences from '../../config/Appearences';
import stores from '../../Stores/orderStore';
import LocalDb from '../../storage/LocalDb';

let currentOffers = new Array();
let allOffers = new Array();
let pagination = { current_page: 0, max_num_page: 0, per_page_num: 7, has_next_page: true };

export default class Inbox extends Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('otherParam', stores.screenTitles.inbox),
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
  });

  onMessageRecieve = async (remoteMessage) => {
    const data = remoteMessage.data;
    const chat = JSON.parse(data.chat);
    const notification = {
      type: chat.type,
      date: chat.date,
      img: chat.img,
      text: chat.text,
      ad_id: chat.ad_id,
    };

    if (Platform.OS === 'ios') {
      this.notificationListenerIOS = firebase.messaging().onMessage(notification => {
        const localNotification = new firebase.notifications.Notification()
          .setNotificationId(notification.ad_id)
          .setTitle("testr")
          .setBody(notification.text)

        firebase.notifications()
          .displayNotification(localNotification)
          .catch(err => console.error(err));
      })
    }
    else {
      this.notificationListenerANDROID = firebase.notifications().onNotification(notification => {
        const localNotification = new firebase.notifications.Notification({
          sound: 'default',
          show_in_foreground: true,
        })
          .setNotificationId("1")
          .setTitle("test")
          .setBody(notification.text)
          .android.setChannelId('channelId') // e.g. the id you chose above
          // .android.setSmallIcon('ic_stat_notification') // create this icon in Android Studio
          .android.setColor('#000000') // you can set a color here
          .android.setPriority(firebase.notifications.Android.Priority.High);

        firebase.notifications()
          .displayNotification(localNotification)
          .catch(err => console.error(err));
      })
    }
  }

  async createNotificationListeners() {

    firebase.messaging().onMessage((message) => {
      // this.onMessageRecieve(message);
      this.getAllInboxData();
    });
  }

  componentWillMount = () => {
    this.getAllInboxData();
    this.createNotificationListeners();
  }

  getAllInboxData = async () => {
    const param = { 'platform': 'mobile' };
    let res_data = await Api.post('message/inbox/', param);

    allOffers = res_data.data;

    if (allOffers.length > 0) {
      allOffers.sort((a, b) => {
        if (!a.chat_latest)
          return 1;
        if (!b.chat_latest)
          return -1;
        if (b.chat_latest[b.chat_latest.length - 1].realdate > a.chat_latest[a.chat_latest.length - 1].realdate)
          return 1;
        else if (b.chat_latest[b.chat_latest.length - 1].realdate < a.chat_latest[a.chat_latest.length - 1].realdate)
          return -1;
        return 0;
      });

      let max_num_offers = allOffers.length;
      pagination.current_page = -1;
      pagination.max_num_page = max_num_offers / pagination.per_page_num;
      if (max_num_offers % pagination.per_page_num != 0)
        pagination.max_num_page++;
      if (max_num_offers > pagination.per_page_num)
        pagination.has_next_page = true;
      else
        pagination.has_next_page = false;

      this._loadMore(++pagination.current_page);
    }
    else {
      this.setState({ noDataVisivility: true, noDataMessage: "Empty Inbox Message" });
    }

    this.setState({ showSpinner: false, swipeUp: false });
  }

  _loadNewPage() {
    if (pagination.has_next_page) {
      pagination.current_page++;
      if ((pagination.current_page + 1) <= pagination.max_num_page)
        pagination.has_next_page = true;
      else
        pagination.has_next_page = false;
      this._loadMore(pagination.current_page);
    }
    else
      this.setState({ reCaller: false });
  }

  writeUserData(email, fname, lname) {
    firebase.database().ref('Users2/').push({
      email,
      fname,
      lname
    }).then((data) => {
      //success callback
    }).catch((error) => {
      //error callback
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      isSendOffersActive: true,
      offers: [],
      showSpinner: true,
      refreshing: false,
      noDataVisivility: false,
      noDataMessage: "",
      reCaller: false,
      swipeUp: false,
    }
  }

  _onRefresh = async () => {
    await this.setState({ swipeUp: true });
    this.getAllInboxData();

    setTimeout(async () => {
      this.setState({ showSpinner: true });
    }, 1000);
  }

  _loadMore = () => {
    currentOffers = allOffers.slice(0, (pagination.per_page_num - 1) * (++pagination.current_page));
    this.setState({ offers: currentOffers });
    this.setState({ reCaller: false });
  }

  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  render() {
    if (this.state.showSpinner) {
      return (<Loader />);
    }
    let { orderStore } = Store;
    return (
      <View style={{
        height: '100%',
        backgroundColor: 'white',
      }}>

        <ScrollView


          refreshControl={
            <RefreshControl
              refreshing={this.state.swipeUp}
              onRefresh={this._onRefresh}
            />
          }

          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            if (this.isCloseToBottom(nativeEvent)) {
              if (this.state.reCaller === false) {
                this._loadNewPage();
              }
              this.setState({ reCaller: true })
            }
          }}
          scrollEventThrottle={400}>

          <View style={styles.container}>



            <FlatList
              data={this.state.offers}
              horizontal={false}
              showsVerticalScrollIndicator={false}
              extraData={this.state.offers}
              renderItem={({ item, index }) =>
                <TouchableOpacity
                  onPress={() => {
                    const { navigate } = this.props.navigation;
                    const params = { adId: item.ad_id, senderId: item.message_sender_id, receiverId: item.message_receiver_id, type: item.message_type }
                    navigate('Chat', { data: params });
                  }}
                  style={[styles.listItemContainer]}>
                  <View style={[styles.listImageContainer, { flex: 0.7 }]}>
                    <Avatar
                      size='large'
                      rounded
                      source={{ uri: item.message_ad_img[0].thumb ? item.message_ad_img[0].thumb : item.message_ad_img }}
                      activeOpacity={0.7}
                      containerStyle={{ alignSelf: 'center', marginVertical: 20, marginHorizontal: 10 }}
                    />
                  </View>
                  <View style={[styles.listTextContainer]}>
                    <Text style={styles.listTitleText} numberOfLines={1}>
                      {item.message_author_name}
                    </Text>
                    <Text style={styles.listNameText} numberOfLines={1}>
                      {item.message_ad_title}
                    </Text>
                    <Text style={styles.listMessageText} numberOfLines={1}>
                      {item.chat_latest ? item.chat_latest[item.chat_latest.length - 1].text : ''}
                    </Text>
                  </View>

                  <View style={styles.timeView} numberOfLines={1}>
                    {!_.isUndefined(item.chat_latest[item.chat_latest.length - 1].date) && !_.isEmpty(item.chat_latest[item.chat_latest.length - 1].date) ?
                      <Text style={styles.listTimeText}>
                        {item.chat_latest[item.chat_latest.length - 1].date}
                      </Text> : null}
                  </View>
                </TouchableOpacity>
              }
              keyExtractor={item => item.ad_id + ''}
            >

            </FlatList>

            <NoDataFound
              noData={true}
              message={this.state.noDataMessage}
              visible={this.state.noDataVisivility}
            />
          </View>
          {this.state.refreshing ?
            <Progress.Circle
              size={20}
              style={{ alignSelf: 'center' }}
              color={orderStore.color}
              indeterminate={true} /> : null}
        </ScrollView>
      </View>);
  }

}








