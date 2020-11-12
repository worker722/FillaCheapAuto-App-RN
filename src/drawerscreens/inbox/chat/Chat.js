import React, { Component } from 'react';
import {
  Platform,
  AppState,
  Text,
  View,
  PermissionsAndroid,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { HeaderBackButton } from 'react-navigation-stack';
import Icon from 'react-native-vector-icons//FontAwesome5'
import ImagePicker from 'react-native-image-crop-picker';
import ActionSheet from 'react-native-actionsheet'
import styles from './Styles';
import Store from '../../../Stores';
import Toast from 'react-native-simple-toast';
import Api from '../../../network/Api';
import Visibility from '../../../components/Visibility';
import ChatMessage from '../../../components/ChatMessage';
import Appearences from '../../../config/Appearences';
// Optional flow type
import firebase from 'react-native-firebase';
import { Avatar, Image } from 'react-native-elements';
import * as Progress from 'react-native-progress';
import Loader from '../../../components/Loader';
import stores from '../../../Stores/orderStore';
import AudioRecord from 'react-native-audio-record';

export default class Chat extends Component {
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
        navigation.goBack(null);
        clearInterval(this.getDataInterval);
        clearInterval(this.recordAudioTimer);
        this.messageListener && this.messageListener();
        AppState.removeEventListener('change', this.handleAppStateChange);
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
    if (data.push_type == 'yes') {
      const paramdata = this.props.navigation.state.params.data;
      if (paramdata.receiverId == data.receiverId && paramdata.senderId == data.senderId) {

        if (this.removeBadge) {
          let { orderStore } = Store;
          orderStore.setNotificationCount(orderStore.notificationCount - 1);
        }

        this.setState({ messages: this.state.messages.concat(message) });
      }
    }
  }

  async componentDidMount() {
    // add this line
    await this.createNotificationListeners();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  async createNotificationListeners() {
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      this.onMessageRecieve(message);
    });
  }

  handleAppStateChange = (nextAppState) => { }

  componentWillUnmount() {
    clearInterval(this.getDataInterval);
    clearInterval(this.recordAudioTimer);
    this.messageListener && this.messageListener();
    AppState.removeEventListener('change', this.handleAppStateChange);
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
      chatImageName: "",
      chatAudioName: "",
      chatImage: null,
      chatAudio: null,
      hideChatImageButton: false,
      isRecording: false,
      recordTime: 0,
    }
    this.removeBadge = true;
  }

  componentWillMount = async () => {
    await this.getAllChatData();
    // this.getDataInterval = setInterval(() => {
    //   this.getAllChatData();
    // }, 10000);

    props.navigation.addListener("willBlur", (event) => {
      this.removeBadge = false;
    });
  }

  getAllChatData = async () => {
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

    if (this.state.showSpinner)
      return (<Loader />);

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
              placeholderStyle={{ backgroundColor: "transparent" }}
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
                renderItem={(item, index) => <ChatMessage messageItem={item} />}
                keyExtractor={(item, index) => index + ''}>
              </FlatList>
            </View>
          </ScrollView>
          <View style={styles.lastRowContainer}>
            <View style={styles.lastRow}>
              {!this.state.isRecording ?
                <>
                  {!this.state.hideChatImageButton ?
                    <TouchableOpacity onPress={() => this.ActionSheet.show()} style={{ width: "10%", height: 50, borderRadius: 100, marginRight: 3, alignItems: "center", justifyContent: "center" }}>
                      <Icon name="paperclip" size={20} color={stores.color} />
                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                      style={[styles.searchButton, { width: "10%", height: 50 }]}>
                      <Progress.Circle
                        size={Appearences.Fonts.headingFontSize}
                        indeterminate={true}
                        color={stores.color}
                      />
                    </TouchableOpacity>
                  }
                </>
                :
                <TouchableOpacity onPress={() => this.recordCancel()} style={{ width: "10%", height: 50, borderRadius: 100, marginRight: 3, alignItems: "center", justifyContent: "center" }}>
                  <Icon name="times" size={20} color={stores.color} />
                </TouchableOpacity>
              }

              {this.state.isRecording ?
                <>
                  <TouchableOpacity onPress={() => this.recordStop()} style={{ width: "10%", height: 50, borderRadius: 100, alignItems: "center", justifyContent: "center" }}>
                    <Icon name="stop" size={18} color={stores.color} />
                  </TouchableOpacity>
                  <Text style={{ width: "70%", height: "100%", textAlignVertical: "center", backgroundColor: "#fff", fontSize: 18, color: "#000", paddingLeft: 20 }}>{this.getTimeFromSec(this.state.recordTime)}</Text>
                </>
                :
                <>
                  <TouchableOpacity onPress={() => this.recordStart()} style={{ width: "10%", height: 50, borderRadius: 100, alignItems: "center", justifyContent: "center" }}>
                    <Icon name="microphone" size={20} color={stores.color} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.TextInput}
                    onChangeText={(text) => {
                      this.setState({ message: text });
                    }}
                    value={this.state.message}
                    underlineColorAndroid='transparent'
                    placeholderTextColor={Appearences.Colors.headingGrey}
                    placeholder={"Start typing..."}
                    textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                    multiline={true}
                  />
                  <Visibility
                    hide={this.state.hideArrowButton}
                    style={{ height: 50, width: "10%" }}>
                    <TouchableOpacity
                      onPress={this.postMessage}

                      style={[styles.searchButton]}>
                      <Icon name="location-arrow" size={20} color={stores.color} />
                    </TouchableOpacity>
                  </Visibility>

                  <Visibility
                    hide={!this.state.hideArrowButton}
                    style={{ height: '100%', width: '10%', }}>
                    <TouchableOpacity

                      style={styles.searchButton}>
                      <Progress.Circle
                        size={Appearences.Fonts.headingFontSize}
                        indeterminate={true}
                        color={stores.color}
                      />
                    </TouchableOpacity>
                  </Visibility>
                </>
              }
            </View>
          </View>
          {!this.state.isRecording &&
            <>
              {this.state.chatImageName != '' &&
                <View style={{ height: 50, width: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingHorizontal: 15 }}>
                  <Text numberOfLines={1} style={{ fontSize: 15, marginLeft: 20, flex: 1, marginRight: 40 }}>{this.state.chatImageName}</Text>
                  <TouchableOpacity onPress={() => this.setState({ chatImageName: "", chatImage: null, chatAudio: null, chatAudioName: '' })} style={{ width: 50, height: 50, justifyContent: "center", position: "absolute", right: 0 }}>
                    <Icon name="times" size={20} color={"#000"} />
                  </TouchableOpacity>
                </View>
              }

              {this.state.chatAudioName != '' &&
                <View style={{ height: 50, width: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingHorizontal: 15 }}>
                  <Text numberOfLines={1} style={{ fontSize: 15, marginLeft: 20, flex: 1, marginRight: 40 }}>{this.state.chatAudioName}</Text>
                  <TouchableOpacity onPress={() => this.setState({ chatImageName: "", chatImage: null, chatAudio: null, chatAudioName: '' })} style={{ width: 50, height: 50, justifyContent: "center", position: "absolute", right: 0 }}>
                    <Icon name="times" size={20} color={"#000"} />
                  </TouchableOpacity>
                </View>
              }
            </>
          }

          <ActionSheet
            ref={o => this.ActionSheet = o}
            title={'Select Photos'}
            options={['Select from Camera', 'Select from Library', 'Cancel']}
            cancelButtonIndex={2}
            destructiveButtonIndex={2}
            onPress={(index) => {
              if (index == 0) {
                ImagePicker.openCamera({
                  mediaType: 'photo',
                  width: 500,
                  height: 500,
                  includeExif: true
                }).then(images => {
                  this.setState({ hideChatImageButton: true })
                  this.selectChatImage(images);
                });
              }
              if (index == 1) {
                ImagePicker.openPicker({
                  multiple: true
                }).then(images => {
                  this.setState({ hideChatImageButton: true })
                  this.selectChatImage(images);
                });
              }
              // console.log('index',index)
            }}
          />
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

  selectChatImage = (image) => {
    let temp = image[0].path.split("/");
    this.setState({
      hideChatImageButton: false,
      chatImageName: temp[temp.length - 1],
      chatImage: image[0],
      chatAudio: null,
      chatAudioName: ''
    });
  }

  recordStart = async () => {

    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.warn("Permission OK");
        this.setState({ isRecording: true });
        clearInterval(this.recordAudioTimer);
        this.recordAudioTimer = setInterval(() => {
          let time = this.state.recordTime;
          if (!time) time = 0;
          time++;
          this.setState({ recordTime: time })
        }, 1000);
      } else {
        console.log('record error')
        return;
      }

      // init audio record
      const options = {
        sampleRate: 16000,  // default 44100
        channels: 1,        // 1 or 2, default 1
        bitsPerSample: 16,  // 8 or 16, default 16
        audioSource: 1,     // android only (see below)
        wavFile: `${(new Date).getTime()}.wav` // default 'audio.wav'
      };

      AudioRecord.init(options);
      AudioRecord.start();
    } catch (error) {
      console.log("recore error:", error);
    }
  }

  recordStop = async () => {
    clearInterval(this.recordAudioTimer);
    const audioFile = await AudioRecord.stop();
    let tempName = audioFile.split("/");
    this.setState({
      hideChatImageButton: false,
      chatImageName: '',
      chatImage: null,
      chatAudio: `file://${audioFile}`,
      isRecording: false,
      chatAudioName: tempName[tempName.length - 1],
      recordTime: 0,
    });
  }

  recordCancel = () => {
    this.setState({ isRecording: false, chatAudio: null, chatAudioName: "", recordTime: 0 });
  }

  getTimeFromSec(sec) {
    let time = '00:00';
    if (!sec) return time;
    if (sec < 10) time = `00:0${sec}`;
    else if (sec < 60) time = `00:${sec}`;
    else time = `${parseInt(sec / 60)}:${parseInt(sec % 60)}`;
    return time;
  }

  postMessage = async () => {
    if (this.state.message == "" && this.state.chatImageName == "" && this.chatAudioName == "")
      return;

    let { orderStore } = Store;
    this.setState({ hideArrowButton: true });

    let chatMessage = this.state.message;
    if (this.state.chatImageName != '') {
      let response = await Api.postChatAttachFile("profile/image", "chat_img", this.state.chatImage, 'chatImage', 'photo');
      chatMessage += orderStore.chat_image_split + response.data + "";
    }
    else if (this.state.chatAudioName != '') {
      let response = await Api.postChatAttachFile("profile/image", "chat_audio", this.state.chatAudio, 'chatAudio', 'audio');
      chatMessage += orderStore.chat_audio_split + response.data + "";
    }

    const data = this.props.navigation.state.params.data;
    const params = { ad_id: data.adId, sender_id: data.senderId, receiver_id: data.receiverId, type: data.type, message: chatMessage };
    orderStore.innerResponse = await Api.post('message/chat/post', params);
    if (orderStore.innerResponse.success === true)
      this.setState({ messages: orderStore.innerResponse.data.chat.reverse(), message: "", chatImageName: "", chatImage: null });
    else if (this.state.messages.length === 0) {
      this.setState({ visibilityHidden: false });
    }
    if (orderStore.innerResponse.message.length != 0)
      Toast.show(orderStore.innerResponse.message);
    this.setState({ hideArrowButton: false });
  }
}