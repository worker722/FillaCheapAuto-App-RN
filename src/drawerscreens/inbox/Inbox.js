import React, { Component } from 'react';
import {
  AppState,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  Dimensions
} from 'react-native';
import _ from 'lodash';
import styles from './Styles';
import firebase from 'react-native-firebase';
import Store from '../../Stores';
import Api from '../../network/Api';
import { Avatar } from 'react-native-elements';
import NoDataFound from '../../components/NoDataFound';
import Loader from '../../components/Loader';
import * as Progress from 'react-native-progress';
import Appearences from '../../config/Appearences';
import stores from '../../Stores/orderStore';
import Icon from 'react-native-vector-icons/FontAwesome5';

let currentOffers = new Array();
let allOffers = new Array();
const screen_height = Dimensions.get("screen").height;

let pagination = { current_page: 0, max_num_page: 0, per_page_num: (Math.floor(screen_height / 100) + 1), has_next_page: true };

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

  async createNotificationListeners() {
    this.messageListener = firebase.messaging().onMessage(async message => {
      // clearInterval(this.getDataInterval);
      this.setState({ offers: [] }, () => {
        this.getAllInboxData();
        // this.getDataInterval = setInterval(() => {
        //   this.getAllInboxData();
        // }, 10000);
      })
    });
  }

  componentWillUnmount() {
    this.messageListener && this.messageListener();
    AppState.removeEventListener('change', this.handleAppStateChange);
    // clearInterval(this.getDataInterval);
  }

  componentDidMount = async () => {
    await this.createNotificationListeners();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState) => { }

  componentWillMount = async () => {
    await this.getAllInboxData();
    // this.getDataInterval = setInterval(() => {
    //   this.getAllInboxData();
    // }, 10000);
  }

  getAllInboxData = async () => {
    let { orderStore } = Store;
    if (orderStore.name == "Guest") {
      this.setState({ noDataVisivility: true, noDataMessage: "Empty Inbox Message" });
      this.setState({ showSpinner: false, swipeUp: false });
      return;
    }

    const param = { 'platform': 'mobile' };
    let res_data = await Api.post('message/inbox/', param);
    allOffers = res_data.data;

    if (allOffers.length > 0) {
      allOffers.sort((a, b) => {
        if (b.chat_latest[b.chat_latest.length - 1].realdate > a.chat_latest[a.chat_latest.length - 1].realdate)
          return 1;
        else if (b.chat_latest[b.chat_latest.length - 1].realdate < a.chat_latest[a.chat_latest.length - 1].realdate)
          return -1;
        return 0;
      });

      let max_num_offers = allOffers.length;
      if (pagination.current_page == 0)
        pagination.current_page = -1;
      pagination.max_num_page = max_num_offers / pagination.per_page_num;
      if (max_num_offers % pagination.per_page_num != 0)
        pagination.max_num_page++;
      if (max_num_offers > pagination.per_page_num)
        pagination.has_next_page = true;
      else
        pagination.has_next_page = false;

      await this._loadMore(++pagination.current_page);
    }
    else {
      this.setState({ noDataVisivility: true, noDataMessage: "Empty Inbox Message" });
    }
    this.setState({ showSpinner: false, swipeUp: false });
  }

  _loadNewPage = async () => {
    if (pagination.has_next_page) {
      pagination.current_page++;
      if ((pagination.current_page + 1) <= pagination.max_num_page)
        pagination.has_next_page = true;
      else
        pagination.has_next_page = false;
      await this._loadMore(pagination.current_page);
    }
    else
      this.setState({ reCaller: false });
  }

  _loadMore = async () => {
    currentOffers = allOffers.slice(0, (pagination.per_page_num - 1) * (++pagination.current_page));
    this.setState({ offers: currentOffers });
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

    props.navigation.addListener("willFocus", (event) => {
      this.componentWillMount();
    });
  }

  _onRefresh = async () => {
    this.setState({ showSpinner: true });
    await this.getAllInboxData();
  }

  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  renderItem = ({ index, item }) => {
    let { orderStore } = Store;
    let messageWithImage = item.chat_latest[item.chat_latest.length - 1].text.split(orderStore.chat_image_split);
    let messageWithAudio = item.chat_latest[item.chat_latest.length - 1].text.split(orderStore.chat_audio_split);
    return (
      <TouchableOpacity
        onPress={() => {
          if (!item.message_read_status)
            orderStore.setNotificationCount(orderStore.notificationCount - 1);

          const { navigate } = this.props.navigation;
          const params = { adId: item.ad_id, senderId: item.message_sender_id, receiverId: item.message_receiver_id, type: item.message_type }
          navigate('Chat', { data: params });
        }}
        style={[styles.listItemContainer]}>
        <View style={{ width: 10, height: 10, borderRadius: 100, backgroundColor: item.message_read_status ? "transparent" : Appearences.Colors.green }}></View>
        <View style={[styles.listImageContainer, { flex: 0.7 }]}>
          <Avatar
            size='large'
            rounded
            source={{ uri: item.message_ad_img[0].thumb ? item.message_ad_img[0].thumb : item.message_ad_img }}
            activeOpacity={0.7}
            placeholderStyle={{ backgroundColor: "transparent" }}
            containerStyle={{ alignSelf: 'center', marginVertical: 20, marginHorizontal: 10 }}
          />
        </View>
        <View style={[styles.listTextContainer]}>
          {item.message_read_status ?
            <Text style={styles.listTitleText} numberOfLines={1}>
              {item.message_author_name}
            </Text>
            :
            <Text style={[styles.listTitleText, { fontWeight: "bold", fontSize: 16 }]} numberOfLines={1}>
              {item.message_author_name}
            </Text>
          }

          <Text style={styles.listNameText} numberOfLines={1}>
            {item.message_ad_title}
          </Text>
          {messageWithImage.length > 1 &&
            <View style={{ width: "100%", flexDirection: "row", height: 30 }}>
              <Icon name={"image"} size={20} color={"#b9b9b9"} style={{ marginRight: 10 }}></Icon>
              <Text style={styles.listMessageText} numberOfLines={1}>Photo</Text>
            </View>
          }
          {messageWithAudio.length > 1 &&
            <View style={{ width: "100%", flexDirection: "row", height: 30 }}>
              <Icon name={"play"} size={18} color={"#b9b9b9"} style={{ marginRight: 10 }}></Icon>
              <Text style={styles.listMessageText} numberOfLines={1}>Audio</Text>
            </View>
          }
          {messageWithImage.length < 2 && messageWithAudio.length < 2 &&
            <Text style={styles.listMessageText} numberOfLines={1}>
              {item.chat_latest ? item.chat_latest[item.chat_latest.length - 1].text : ''}
            </Text>
          }

        </View>

        <View style={[styles.timeView]} numberOfLines={1}>
          {!_.isUndefined(item.chat_latest[item.chat_latest.length - 1].date) && !_.isEmpty(item.chat_latest[item.chat_latest.length - 1].date) ?
            <Text style={styles.listTimeText}>
              {item.chat_latest[item.chat_latest.length - 1].date}
            </Text> : null}
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    if (this.state.showSpinner)
      return (<Loader />);

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
              renderItem={this.renderItem}
              keyExtractor={item => item.ad_id + ''}
            />

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