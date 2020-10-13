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
  TouchableHighlight,
  FlatList,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { HeaderBackButton } from 'react-navigation-stack';

import styles from './Styles';
import Store from '../../../Stores';
import Toast from 'react-native-simple-toast';
import Api from '../../../network/Api';
import Visibility from '../../../components/Visibility';
import Appearences from '../../../config/Appearences'
// Optional flow type
import type { RemoteMessage } from 'react-native-firebase';
import firebase from 'react-native-firebase';
import { Avatar } from 'react-native-elements';
import * as Progress from 'react-native-progress';
import Loader from '../../../components/Loader';
import stores from '../../../Stores/orderStore';

export default class Chat extends Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('otherParam', stores.screenTitles.chats),
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
    headerRight: <View style={{ flex: 1 }} />,
    headerLeft: <HeaderBackButton
      onPress={() => {
        navigation.goBack(null)
      }} tintColor={'#fff'} />
  });

  onMessageRecieve = async (remoteMessage) => {
    const data = remoteMessage.data;
    const chat = JSON.parse(data.chat);
    const message = {

      type: chat.type,
      date: chat.date,
      img: chat.img,
      text: chat.text,
      ad_id: chat.ad_id,
    };

    this.setState({ messages: this.state.messages.concat(message) });
  }

  async componentDidMount() {
    //add this line
    this.createNotificationListeners();
  }
  async createNotificationListeners() {

    firebase.messaging().onMessage((message) => {
      //process data message
      this.onMessageRecieve(message);
    });
  }


  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      showSpinner: true,
      refreshing: false,
      visibilityHidden: true,
      isComment: true,
      message: '',
      hideArrowButton: false,
    }
  }
  componentWillMount = async () => {

    const data = this.props.navigation.state.params.data;
    let { orderStore } = Store;

    const params = { ad_id: data.adId, sender_id: data.senderId, receiver_id: data.receiverId, type: data.type };
    orderStore.innerResponse = await Api.post('message/chat/', params);
    if (orderStore.innerResponse.success === true) {
      this.setState({ messages: orderStore.innerResponse.data.chat.reverse() });
    }
    else if (this.state.messages.length === 0) {
      this.setState({ visibilityHidden: false });
    }
    if (orderStore.innerResponse.message.length != 0)
      Toast.show(orderStore.innerResponse.message);
    this.setState({ showSpinner: false });
  }

  onCallClick = async (item) => {
    this.setState({ showSpinner: true });
    const adData = this.props.navigation.state.params.data;
    const params = { ad_id: adData.adId };
    const adDetail = await Api.post('ad_post', params);
    this.setState({ showSpinner: false });

    const data = adDetail.data;
    const contactInfo = data.static_text.contact_info;
    let phoneNumber = '';

    if (Platform.OS === 'android') {
      phoneNumber = 'tel:' + contactInfo.phone.number;
    }
    else {
      phoneNumber = 'telprompt:' + contactInfo.phone.number;
    }

    Linking.openURL(phoneNumber);
  };
  onChatAvtarClick = () => {
    const data = this.props.navigation.state.params.data;
    const { navigate } = this.props.navigation;
    navigate('AdDetailTabManager', { adId: data.adId });
  };






  render() {


    if (this.state.showSpinner) {
      return (<Loader />);
    }
    let { orderStore } = Store;


    return (
      <View >
        <View style={{
          height: '100%',
          backgroundColor: Appearences.Colors.appBackgroundColor,
        }}>


          <Visibility
            hide={this.state.visibilityHidden}
            style={{ width: '100%', height: '100%', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
            <Text>{orderStore.innerResponse.message}</Text>
          </Visibility>


          <View style={styles.listItemContainer}>


            <Avatar
              size='medium'
              rounded
              source={{ uri: orderStore.innerResponse.data.ad_img[0].thumb }}
              onPress={this.onChatAvtarClick}
              activeOpacity={0.7}
              containerStyle={{ alignSelf: 'center', marginVertical: 20, marginHorizontal: 10 }}
            />



            <TouchableOpacity style={[styles.listTextContainer, { flex: 2 }]} onPress={this.onChatAvtarClick}>
              <Text style={styles.listTitleText}>
                {orderStore.innerResponse.data.ad_title}
              </Text>
              <Text style={styles.listNameText}>
                {orderStore.innerResponse.data.page_title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.featureAdsBtn}
              onPress={() => { this.onCallClick(orderStore.innerResponse) }}>
              <Image
                source={require('../../../../res/images/contact.png')}
                style={[styles.bottomImgStyl]}
              />
              <Text style={styles.featureAdsBtntxt}>Call</Text>

            </TouchableOpacity>
          </View>




          <ScrollView
            ref={ref => this.scrollView = ref}
            onContentSizeChange={(contentWidth, contentHeight) => {
              this.scrollView.scrollToEnd({ animated: true });
            }}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }


          >
            <View style={[styles.container]}>





              <FlatList
                data={this.state.messages}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                renderItem={this.renderComment}
                keyExtractor={this._keyExtractor}>
              </FlatList>




            </View>
          </ScrollView>
          <View style={styles.lastRowContainer}>
            <View style={styles.lastRow}>
              <TextInput
                style={styles.TextInput}
                onChangeText={(text) => {
                  this.setState({ message: text });
                }}
                value={this.state.message}
                underlineColorAndroid='transparent'
                placeholderTextColor={Appearences.Colors.headingGrey}
                textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                multiline={true}

              />
              <Visibility
                hide={this.state.hideArrowButton}
                style={{ height: '100%', width: '15%', }}>
                <TouchableOpacity
                  onPress={this.postMessage}
                  style={[styles.searchButton, { backgroundColor: stores.color }]}>
                  <Image source={require('../../../../res/images/chat_send.png')}
                    style={styles.searchImage} />
                </TouchableOpacity>
              </Visibility>

              <Visibility
                hide={!this.state.hideArrowButton}
                style={{ height: '100%', width: '15%', }}>
                <TouchableOpacity

                  style={styles.searchButton}>
                  <Progress.Circle
                    size={Appearences.Fonts.headingFontSize}
                    indeterminate={true}
                    color={stores.color}
                  />
                </TouchableOpacity>
              </Visibility>

            </View>
          </View>

        </View>

      </View>
    );



  }


  _onRefresh = () => {

    let { orderStore } = Store;
    let pagination;

    pagination = orderStore.innerResponse.data.pagination;

    if (pagination.has_next_page === true) {
      this.setState({ refreshing: true });
      this.loadMore(pagination.next_page);
    }
  }

  loadMore = async (nextPage) => {
    const data = this.props.navigation.state.params.data;

    const params = { ad_id: data.adId, sender_id: data.senderId, receiver_id: data.receiverId, type: data.type, page_number: nextPage };
    let { orderStore } = Store;


    let response;

    response = await Api.post('message/chat/', params);

    if (response.success === true) {


      orderStore.innerResponse.data.pagination = response.data.pagination;
      //orderStore.innerResponse.data.chat = [...response.data.chat.reverse(),...orderStore.innerResponse.data.chat.reverse()];
      orderStore.innerResponse.data.chat = [...orderStore.innerResponse.data.chat, ...response.data.chat];
      this.setState({ messages: orderStore.innerResponse.data.chat.reverse() });


    }
    if (response.message.length != 0)
      Toast.show(response.message);
    this.setState({ refreshing: false });
  }

  postMessage = async () => {
    this.setState({ hideArrowButton: true });
    const data = this.props.navigation.state.params.data;
    let { orderStore } = Store;
    const params = { ad_id: data.adId, sender_id: data.senderId, receiver_id: data.receiverId, type: data.type, message: this.state.message };
    orderStore.innerResponse = await Api.post('message/chat/post', params);
    if (orderStore.innerResponse.success === true)
      this.setState({ messages: orderStore.innerResponse.data.chat.reverse(), message: "" });
    else if (this.state.messages.length === 0) {
      this.setState({ visibilityHidden: false });
    }
    if (orderStore.innerResponse.message.length != 0)
      Toast.show(orderStore.innerResponse.message);
    this.setState({ hideArrowButton: false });
  }

  _keyExtractor = (item, index) => index + '';


  renderComment = ({ index, item }) => {

    if (item.type === 'reply') {
      return (
        <View
          style={styles.commentRowContainer}>
          <View>
            <View style={styles.listImageContainer}>

              <Avatar
                size='medium'
                rounded
                source={{ uri: item.img }}
                onPress={() => console.log("Works!")}
                activeOpacity={0.7}
                containerStyle={{ alignSelf: 'center', marginVertical: 20, marginHorizontal: 10 }}
              />



            </View>
            <Text style={[styles.timeText, { color: stores.color }]}>
              {item.date}
            </Text>
          </View>

          <View style={styles.triangle} />
          <View style={styles.talkBubble}>
            <View style={styles.talkBubbleSquare}>
              <Text style={styles.comment}>{item.text}</Text>
            </View>
          </View>



        </View>);

    }

    else {
      return (
        <View
          style={styles.replyRowContainer}>



          <View style={styles.talkBubble}>
            <View style={styles.replyTalkBubbleSquare}>
              <Text style={styles.comment}>{item.text}</Text>
            </View>
          </View>
          <View style={styles.triangleReply} />

          <View>
            <View style={styles.listImageContainer}>
              <Avatar
                size='medium'
                rounded
                source={{ uri: item.img }}
                onPress={() => console.log("Works!")}
                activeOpacity={0.7}
                containerStyle={{ alignSelf: 'center', marginVertical: 20, marginHorizontal: 10 }}
              />

            </View>
            <Text style={[styles.timeText, { color: stores.color }]}>
              {item.date}
            </Text>
          </View>


        </View>
      );
    }

  }
}







