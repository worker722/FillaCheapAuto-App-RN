import React, { Component } from 'react';
import {
  Platform,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Animated,
  BackHandler,
  RefreshControl,
  Linking,
  Modal,
} from 'react-native';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as Progress from 'react-native-progress';
import Appearences from '../../config/Appearences';
import styles from './Styles';
import FeaturedTypeStyle from './FeaturedTypeStyle';
import MakersTypeStyle from './MakersTypeStyle';
import FeaturedGridStyle from './FeaturedGridStyle';
import PopularCarsStyle from './PopularCarsStyle';
import ExploreCountryStyle from './ExploreCountryStyle';
import TopCars from './TopCars';
import Carousel from 'react-native-snap-carousel';
import Store from '../../Stores';
import LocalDb from '../../storage/LocalDb';
import store from '../../Stores/orderStore';
import Toast from 'react-native-simple-toast';
import Api from '../../network/Api';
import Loader from '../../components/Loader';
import * as Animatable from 'react-native-animatable';
let { height } = Dimensions.get('window');
import { I18nManager } from 'react-native'
import firebase from 'react-native-firebase';
import { observer } from 'mobx-react';
import DrawerButton from '../../config/DrawerButton';
import DrawerRightIcons from '../../config/DrawerRightIcons';
import { NavigationActions } from 'react-navigation';


const featuredItemWidth = Dimensions.get("screen").width * 47 / 100;

@observer
export default class Home extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('otherParam', store.screenTitles.home),
    headerStyle: {
      backgroundColor: store.color,
    },

    headerTitleStyle: {
      flex: 1,
      color: 'white',
      textAlign: "center",
      fontFamily: Appearences.Fonts.paragaphFont,
      fontSize: 13,
      fontWeight: "200",

    },
    headerLeft: <DrawerButton navigation={navigation} />,
    headerRight: <DrawerRightIcons />
  });

  componentDidMount = async () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    await this.createNotificationListeners();
  }

  async createNotificationListeners() {
    firebase.notifications().onNotificationDisplayed((notification: Notification) => {
      const { title, body } = notification;
    });

    /*
    * Triggered when a particular notification has been received in foreground
    * */
    firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
      let { orderStore } = Store;
      orderStore.setNotificationCount(orderStore.notificationCount + 1);
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    firebase.notifications().onNotificationOpened((notificationOpen) => {
      let { orderStore } = Store;
      const screenTitle = orderStore.screenTitles;
      this.nav('Inbox', screenTitle.inbox)
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      let { orderStore } = Store;
      const screenTitle = orderStore.screenTitles;
      this.nav('Inbox', screenTitle.inbox)
    }

    firebase.messaging().onMessage(async message => {
    });
  }

  nav = (route, title) => {
    firebase.analytics().setCurrentScreen(title);

    const navigateAction = NavigationActions.navigate({
      routeName: route
    });
    this.props.navigation.setParams({ otherParam: title });
    this.props.navigation.dispatch(navigateAction);
  }


  constructor(props) {
    super(props);

    this.springValue = new Animated.Value(100);
    this.featuredAdsIndex = 2;

    this.state = {
      cats: [],
      showSpinner: true,
      backClickCount: 0,
      refreshing: false,
      searchText: '',
      visibleChatModal: false,
      similar_ad: null,
      featuredShowNum: 5,
      multiPhones: [],
      visibleCallModal: false,
    };

    const renderInterval = setInterval(() => {
      if (this.flFeaturedAdsRef != null) {
        if (this.featuredAdsIndex == 3)
          this.featuredAdsIndex = -1;
        this.featuredAdsIndex++;
        this.flFeaturedAdsRef.scrollToIndex({ animated: true, index: this.featuredAdsIndex });
      }
    }, 2000);
    this.setState({ renderInterval });

    props.navigation.addListener("willFocus", (event) => {

      this.setState({
        cats: [],
        showSpinner: true,
        backClickCount: 0,
        refreshing: false,
        searchText: '',
        visibleChatModal: false,
        similar_ad: null,
      }, () => {
        this.componentWillMount();
      })
    });
  }

  _spring() {

    this.setState({ backClickCount: 1 }, () => {
      Animated.sequence([
        Animated.spring(
          this.springValue,
          {
            toValue: -.15 * height,
            friction: 5,
            duration: 300,
            useNativeDriver: true,
          }
        ),
        Animated.timing(
          this.springValue,
          {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
          }
        ),

      ]).start(() => {
        this.setState({ backClickCount: 0 });
      });
    });

  };

  componentWillUnmount = async () => {
    clearInterval(this.state.renderInterval);
    await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }
  handleBackButton = async () => {
    if (this.state.backClickCount == 0)
      Toast.show("Press back again to exit");
    this.state.backClickCount == 1 ? await BackHandler.exitApp() : this._spring();

    return true;
  };
  onTopCarsClick = async (item) => {

    const { navigate } = this.props.navigation;
    await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);

    navigate('ComparisonDetail', { car1: item[0].post_id, car2: item[1].post_id });


  };

  managePostions = (itemAtPosition) => {

    switch (itemAtPosition) {
      case 'body_type':
        return this.renderBodyType();
      case 'featured_ads':
        return this.renderFeaturedAdsGrid();
      case 'latest_ads':
        return this.renderLatestAds();
      case 'cat_icons':
        return this.renderFearuredMaker();
      case 'cat_locations':
        return this.renderExplore();
      case 'comparison':
        return this.renderComparison();
      case 'blogNews':
        return this.renderBlog();
      default:
        break;
    }
  }

  setRandomFeaturedAds = () => {
    let { orderStore } = Store;

    var currentIndex = orderStore.home.featured_ads.ads.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = orderStore.home.featured_ads.ads[currentIndex];
      orderStore.home.featured_ads.ads[currentIndex] = orderStore.home.featured_ads.ads[randomIndex];
      orderStore.home.featured_ads.ads[randomIndex] = temporaryValue;
    }

    console.log("featured length", orderStore.home.featured_ads.ads_count);

    if (orderStore.home.featured_ads.ads.length < 5)
      this.setState({ featuredShowNum: orderStore.home.featured_ads.ads.length })
  }

  start = async () => {
    let { orderStore } = Store;
    const response = await Api.get('home');
    if (response.success === true) {
      orderStore.home = response.data;
      this.jobsPositions = response.data.ads_position;

      this.setRandomFeaturedAds();

      if (orderStore.home.featured_ads.ads.length > 0) {
        this.featuredAdsIndex = 2;
        clearInterval(this.state.renderInterval);
        const renderInterval = setInterval(() => {
          if (this.flFeaturedAdsRef != null) {
            if (this.featuredAdsIndex == 3)
              this.featuredAdsIndex = -1;
            this.featuredAdsIndex++;
            this.flFeaturedAdsRef.scrollToIndex({ animated: true, index: this.featuredAdsIndex });
          }
        }, 2000);
        this.setState({ renderInterval });
      }

      orderStore.profile = await Api.get('profile');
    }
    if (response.message.length != 0)
      Toast.show(response.message);
    this.setState({ showSpinner: false });
  }

  componentWillMount = async () => {
    this.start();
    this.manageFcmToken();
    this.settings();
  }

  manageFcmToken = async () => {

    let { orderStore } = Store;
    const fcmToken = await firebase.messaging().getToken();

    if (fcmToken) {
      const userData = await LocalDb.getUserProfile();
      const params = { firebase_id: fcmToken, user_id: userData.id };

      const response = await Api.post('home', params);
      if (response.success === true)
        orderStore.fcmToken = fcmToken;
      else if (response.message.length != 0)
        Toast.show(response.message);
    }
  }

  settings = async () => {
    let { orderStore } = Store;
    const response = await Api.get("settings");
    if (response.success) {
      const data = response.data;
      data.menu.map((item, key) => {
        if (item.key == 'inbox_list')
          orderStore.setNotificationCount(item.message_count);
      })
    }
  }

  onPressViewAll = async () => {
    const params = { ad_title: "" }

    const { navigate } = this.props.navigation;
    await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
    let { orderStore } = Store;
    orderStore.setIsCallAdvance(false);
    navigate('SearchDetail', { params: params });
  }

  onFeaturedTypeClick = async (item) => {
    const params = { body_type: item.name }

    const { navigate } = this.props.navigation;
    await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
    let { orderStore } = Store;
    orderStore.setIsCallAdvance(false);
    navigate('SearchDetail', { params: params });
  };

  onFeaturedGridClick = async (item) => {
    const { navigate } = this.props.navigation;
    await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);

    navigate('AdDetailTabManager', { adId: item.ad_id });
  };

  renderFunction = (item, index) => {

  }

  renderBodyType = () => {
    let { orderStore } = Store;
    const data = orderStore.home;
    if (!data.body_type_is_show)
      return null;
    return (<View>




      <View style={styles.headingContainer}>
        <Text style={styles.bodyHeadingBlack}>{data.body_type_txt1}</Text>
        <Text style={styles.bodyHeadingAppColor}> {data.body_type_txt2}</Text>
      </View>
      <View style={styles.startPadding}>


      </View>
      <View style={styles.featuredTypeListContainer}>


        <FlatList
          data={data.body_type_icons}
          horizontal={true}
          showsHorizontalScrollIndicator={false}

          ref={(ref) => { this.flatListRef = ref; }}
          renderItem={({ item, index }) =>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.onFeaturedTypeClick(item)}
              style={FeaturedTypeStyle.container}>
              <Animatable.View
                duration={2000}
                animation="zoomIn"
                iterationCount={1}
                direction="alternate">
                <Image
                  style={FeaturedTypeStyle.image}
                  source={{ uri: item.img }} />
              </Animatable.View>
              <Text style={FeaturedTypeStyle.text}>
                {item.name}
              </Text>
            </TouchableOpacity>
          }
          keyExtractor={item => item.body_type_id + ''}
        >
        </FlatList>




      </View>


      {orderStore.isPublicProfile ? null :
        <TouchableOpacity style={styles.buttonRow}
          activeOpacity={1}

          onPress={async () => {
            await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);

            this.props.navigation.navigate("Sell");
          }}>
          <View
            style={[styles.button, { backgroundColor: orderStore.color }]}>
            <Text style={styles.buttonTextStyle}>{data.extra.ad_post}</Text>
          </View>
        </TouchableOpacity>

      }


    </View>);
  }

  showChatModal = async (item) => {
    this.setState({ visibleCallModal: false }, () => {
      this.setState({ visibleChatModal: true, similar_ad: item });
    })
  }

  sendChatMessage = async () => {

    this.setState({ showMessageProgress: true });
    const params = { ad_id: this.state.similar_ad.ad_id, message: this.state.popupMessage };

    const response = await Api.post('message/popup', params);
    if (response.success === true) { }
    Toast.show(response.message);
    this.setState({ showMessageProgress: false, visibleChatModal: false });
  }

  showCallModal = async (item) => {
    this.setState({ showSpinner: true, similar_ad: item });
    const params = { ad_id: item.ad_id };

    const adDetail = await Api.post('ad_post', params);
    const contact_info = adDetail.data.static_text.contact_info;
    this.setState({ showSpinner: false });

    let multiPhones = [];
    multiPhones.push(contact_info.phone.number);
    multiPhones.push(contact_info.phone2.number);
    multiPhones.push(contact_info.phone3.number);
    multiPhones.push(contact_info.phone4.number);
    multiPhones.push(contact_info.phone5.number);
    this.setState({
      multiPhones: multiPhones,
      visibleCallModal: true,
      visibleChatModal: false
    })
  }

  onCallClick = (number) => {
    let phoneNumber = 'telprompt:' + number;
    if (Platform.OS === 'android') {
      phoneNumber = 'tel:' + number;
    }

    Linking.openURL(phoneNumber);
    this.setState({ visibleCallModal: false })
  }

  getItemLayout = (data, index) => (
    { length: this.state.featuredShowNum, offset: index * featuredItemWidth, index }
  )

  renderFeaturedAdsGrid = () => {
    let { orderStore } = Store;
    if (!orderStore.home.is_show_featured)
      return null;
    const data = orderStore.home.featured_ads;

    let featuredGridData = data.ads;
    let favouriteAds = [];

    if (orderStore.profile.data) {
      favouriteAds = orderStore.profile.data.favourite_add.ads;
      for (let i in favouriteAds) {
        for (let j in featuredGridData) {
          if (featuredGridData[j].ad_id === favouriteAds[i].ad_id) {
            featuredGridData[j].added_fav = true
          }
        }
      }
    }

    return (

      <View>


        <View style={styles.headingWithButtonContainer}>
          <View style={styles.headingContainer}>
            <View>
              <View style={styles.textRowConrainer}>
                <Text style={styles.bodyHeadingBlack}>{data.text}</Text>
                <Text style={styles.bodyHeadingAppColor}> {data.text2}</Text>
              </View>

            </View>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.smallButtonContainer}
              onPress={() => { this.onPressViewAll() }}>
              <View style={[styles.smallButton, { backgroundColor: orderStore.color }]}>
                <Text style={styles.buttonTextStyle}>{data.view_all}</Text>
              </View>
            </TouchableOpacity>
          </View>



        </View>


        <View style={styles.featuredGrid}>


          <FlatList
            ref={(ref) => { this.flFeaturedAdsRef = ref; }}
            initialScrollIndex={0}
            getItemLayout={this.getItemLayout}
            initialNumToRender={5}
            data={featuredGridData}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) =>

              <TouchableOpacity
                activeOpacity={2}
                style={[FeaturedGridStyle.container, {
                  elevation: 5,
                  shadowColor: 'rgb(24, 81, 70)',
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 0.9,
                  shadowRadius: 3,
                }
                ]}
                onPress={() => this.onFeaturedGridClick(item)}
              >

                <View style={FeaturedGridStyle.imageContainer}>

                  <Image
                    style={FeaturedGridStyle.image}
                    source={{ uri: item.ad_images[0].thumb }} />
                  <View
                    style={FeaturedGridStyle.imageContainerOverlay}>
                    <View style={FeaturedGridStyle.topRowContainer}>
                      <View style={FeaturedGridStyle.topRightContent}>
                        <View
                          style={

                            {
                              width: 0,
                              height: 0,
                              backgroundColor: 'transparent',
                              borderStyle: 'solid',
                              borderRightWidth: 40,
                              borderTopWidth: 40,
                              borderRightColor: 'transparent',
                              borderTopColor: orderStore.color,
                              borderTopLeftRadius: Appearences.Radius.radius,
                              transform: [
                                { rotate: I18nManager.isRTL ? '360deg' : '90deg' },
                                { scaleX: I18nManager.isRTL ? -1 : 1 }
                              ]
                            }

                          } />

                        <View style={{ width: '100%', height: '100%', position: 'absolute', alignItems: 'flex-end' }}>
                          <Image
                            style={{ width: 10, height: 10, marginTop: 8, marginEnd: 8 }}
                            source={require('../../../res/images/star_white.png')} />
                        </View>

                      </View>
                    </View>
                    <View style={FeaturedGridStyle.bottomRowContainer}>
                      <View style={[FeaturedGridStyle.bottomLeftContent, { backgroundColor: orderStore.color }]}>
                        <Text style={[styles.buttonTextStyle, { fontSize: Appearences.Fonts.headingFontSize, fontWeight: Appearences.Fonts.headingFontWieght }]}>{item.ad_price.price}
                          <Text style={styles.buttonTextStyle}>{' (' + item.ad_price.price_type + ')'}</Text>
                        </Text>
                      </View>

                      <View style={[FeaturedGridStyle.bottomRightContent, { backgroundColor: orderStore.color }]}>
                        <Image
                          style={FeaturedGridStyle.bottomRightContentImage}
                          source={require('../../../res/images/play.png')} />
                      </View>
                    </View>
                  </View>

                </View>

                <View style={FeaturedGridStyle.textContainer}>
                  <Text
                    style={FeaturedGridStyle.petrolTextStyle}>
                    {item.ad_cats_name}
                  </Text>

                  <View style={[PopularCarsStyle.textContainer, { flexDirection: 'row', }]}>
                    <Text style={FeaturedGridStyle.brandTextStyle}>
                      {item.ad_title}
                    </Text>

                    {
                      item.added_fav &&
                      <TouchableOpacity onPress={() => this.deleteItem(item)}>
                        <Image
                          source={require('../../../res/images/heart_filled.png')}
                          style={[FeaturedGridStyle.bottomImgStyl, { marginHorizontal: 5 }]}
                        />
                      </TouchableOpacity>
                    }
                    {
                      !item.added_fav &&
                      <TouchableOpacity onPress={() => this.addFav(item)}>
                        <Image
                          source={require('../../../res/images/heart.png')}
                          style={[FeaturedGridStyle.bottomImgStyl, { marginHorizontal: 5 }]}
                        />
                      </TouchableOpacity>
                    }
                  </View>

                  <Text
                    style={PopularCarsStyle.modelTextStyle}>
                    {item.ad_desc}
                  </Text>
                  <Text
                    style={PopularCarsStyle.brandTextStyle}>
                    {item.ad_engine + ' | ' + item.ad_milage}
                  </Text>
                  {/* <Text
                      style={[PopularCarsStyle.priceTextStyle, { color: orderStore.color, fontSize: Appearences.Fonts.headingFontSize, fontWeight: Appearences.Fonts.headingFontWieght }]}>
                      {item.ad_price.price}
                      {item.ad_price.price_type.length != 0 ? <Text style={PopularCarsStyle.priceTextStyle}>{' (' + item.ad_price.price_type + ')'} </Text> : null}
                    </Text> */}
                  <View numberOfLines={1} style={[PopularCarsStyle.textContainer1, { flexDirection: 'row', flexWrap: 'wrap' }]}>
                    <Image
                      source={require('../../../res/images/calender_grey.png')}
                      style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                    />
                    <Text
                      style={PopularCarsStyle.modelTextStyle}>
                      {item.ad_date}
                    </Text>
                  </View>
                  <View numberOfLines={1} style={[PopularCarsStyle.textContainer1, { flexDirection: 'row', }]}>
                    <Image
                      source={require('../../../res/images/location.png')}
                      style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                    />
                    <Text
                      style={PopularCarsStyle.modelTextStyle}>
                      {item.ad_location.address}
                    </Text>


                  </View>
                </View>
                <View style={[FeaturedGridStyle.featureAdsBottom, {
                  marginBottom: -2
                }]}>
                  <TouchableOpacity
                    style={[FeaturedGridStyle.featureAdsBtn, { borderBottomWidth: 2, borderBottomColor: 'blue' }]}
                    onPress={() => this.showChatModal(item)}>
                    <Image
                      source={require('../../../res/images/message_grey.png')}
                      style={[FeaturedGridStyle.bottomImgStyl]}
                    />
                    <Text style={FeaturedGridStyle.featureAdsBtntxt}>Chat</Text>

                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[FeaturedGridStyle.featureAdsBtn, { borderBottomWidth: 2, borderBottomColor: orderStore.appColor }]}
                    onPress={() => this.showCallModal(item)}>
                    <Image
                      source={require('../../../res/images/contact.png')}
                      style={[FeaturedGridStyle.bottomImgStyl]}
                    />
                    <Text style={FeaturedGridStyle.featureAdsBtntxt}>Call</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>


            }
            keyExtractor={item => item.ad_id + ''}
          >
          </FlatList>






        </View>





      </View>

    );


  }
  addFav = async (item) => {
    let { orderStore } = Store
    if (orderStore.name != "Guest") {

      const params = { ad_id: item.ad_id };
      let response = await Api.post('ad_post/favourite', params);
      if (response.success === true)
        this.start();

      if (response.message.length != 0)
        Toast.show(response.message);
    }
    else {
      alert('Please login into account')
    }

  }
  deleteItem = async (item) => {
    let { orderStore } = Store
    if (orderStore.name != "Guest") {

      const params = { ad_id: item.ad_id }
      let response = await Api.post('ad/favourite/remove', params);
      if (response.success === true) {
        this.start()
      }

      if (response.message.length != 0)
        Toast.show(response.message);
    }
    else {
      alert('Please login into account')
    }
  }
  handleScroll = (event) => {
    if (event.nativeEvent.contentOffset.y > 290)
      this.setState({ isAboslute: true });
    else
      this.setState({ isAboslute: false })
  }

  renderFearuredMaker = () => {
    let { orderStore } = Store;
    const data = orderStore.home;
    if (!orderStore.home.featured_makes_is_show)
      return null;
    return (

      <View>


        <View style={styles.headingContainer}>
          <Text style={styles.bodyHeadingBlack}>{data.featured_makes_txt1}</Text>
          <Text style={styles.bodyHeadingAppColor}> {data.featured_makes_txt2}</Text>
        </View>



        <View style={styles.featuredMakersListContainer}>
          <FlatList
            data={data.featured_makes}
            renderItem={({ item, key }) => (
              <TouchableOpacity
                activeOpacity={1}
                onPress={async () => {

                  const params = { ad_cats1: item.cat_id }

                  const { navigate } = this.props.navigation;
                  await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
                  let { orderStore } = Store;
                  orderStore.setIsCallAdvance(false);
                  navigate('SearchDetail', { params: params });

                }}
                key={key}
                style={data.featured_makes_column === "3" ? MakersTypeStyle.containerThreeRows : MakersTypeStyle.container}>
                <Animatable.View
                  duration={2000}
                  animation="zoomIn"
                  iterationCount={1}
                  direction="alternate">
                  <Image
                    style={data.featured_makes_column === "3" ? MakersTypeStyle.imageThreeRows : MakersTypeStyle.image}
                    source={{ uri: item.img }}
                  />
                </Animatable.View>
                <Text
                  style={MakersTypeStyle.text}>
                  {item.name}
                </Text>
              </TouchableOpacity>

            )}
            //Setting the number of column
            numColumns={data.featured_makes_column === "3" ? 3 : 4}
            keyExtractor={(item, index) => index}
          />

        </View>

        {data.featured_makes_view_all.length === 0 || data.featured_makes_view_all.length === undefined || data.featured_makes_view_all.length === null ? "" :
          <TouchableOpacity
            activeOpacity={1}
            style={styles.buttonRow}
            onPress={async () => {
              let param = { ad_title: '' }
              const { navigate } = this.props.navigation;
              await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
              let { orderStore } = Store;
              orderStore.setIsCallAdvance(false);
              navigate('SearchDetail', { params: param });
            }}>
            <View
              style={[styles.button, { backgroundColor: orderStore.color }]}>
              <Text style={styles.buttonTextStyle}>{data.featured_makes_view_all}</Text>
            </View>
          </TouchableOpacity>
        }
      </View>

    );

  }

  renderLatestAds = () => {
    let { orderStore } = Store;
    let data = []
    let favouriteAds = []
    data = orderStore.home.latest_ads;

    if (orderStore.profile.data) {
      favouriteAds = orderStore.profile.data.favourite_add.ads;
      for (let i in favouriteAds) {
        for (let j in data.ads) {
          if (data.ads[j].ad_id === favouriteAds[i].ad_id) {
            data.ads[j].added_fav = true
          }
        }
      }
    }

    if (!orderStore.home.is_show_latest)
      return null;
    return (

      <View>



        <View style={styles.headingWithButtonContainer}>
          <View style={styles.headingContainer}>
            <View>
              <View style={styles.textRowConrainer}>
                <Text style={styles.bodyHeadingBlack}>{data.text}</Text>
                <Text style={styles.bodyHeadingAppColor}> {data.text2}</Text>
              </View>


            </View>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.smallButtonContainer}
              onPress={() => {
                this.onPressViewAll();
              }}>
              <View style={[styles.smallButton, { backgroundColor: orderStore.color }]}>
                <Text style={styles.buttonTextStyle}>{data.view_all}</Text>
              </View>
            </TouchableOpacity>
          </View>



        </View>


        <View style={[styles.popularCars, {}]}>




          <FlatList
            data={data.ads}
            horizontal={false}
            showsVerticalScrollIndicator={false}

            renderItem={({ item, index }) =>

              <TouchableOpacity
                activeOpacity={1}
                onPress={async () => {
                  const { navigate } = this.props.navigation;
                  await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton)
                  navigate('AdDetailTabManager', { adId: item.ad_id });
                }}
                style={[PopularCarsStyle.container, {
                  elevation: 5,
                  shadowColor: 'rgb(24, 81, 70)',
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 0.9,
                  shadowRadius: 3,
                  marginBottom: 10,

                }]}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={PopularCarsStyle.imageContainer}>
                    <Image
                      style={PopularCarsStyle.image}
                      source={{ uri: item.ad_images[0].thumb }} />
                    <View
                      style={PopularCarsStyle.imageContainerOverlay}>
                      <View style={PopularCarsStyle.topRowContainer}>
                        <View style={FeaturedGridStyle.topRightContent}>

                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={PopularCarsStyle.textContainer}>
                    <Text
                      style={PopularCarsStyle.modelTextStyle}>
                      {item.ad_cats_name}
                    </Text>
                    <View style={[PopularCarsStyle.textContainer, { flexDirection: 'row' }]}>
                      <Text
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        style={PopularCarsStyle.brandTitleStyle}>
                        {item.ad_title}
                      </Text>

                      {
                        item.added_fav &&
                        <TouchableOpacity onPress={() => this.deleteItem(item)}>
                          <Image
                            source={require('../../../res/images/heart_filled.png')}
                            style={[FeaturedGridStyle.bottomImgStyl, { marginHorizontal: 5 }]}
                          />
                        </TouchableOpacity>
                      }
                      {
                        !item.added_fav &&
                        <TouchableOpacity onPress={() => this.addFav(item)}>
                          <Image
                            source={require('../../../res/images/heart.png')}
                            style={[FeaturedGridStyle.bottomImgStyl, { marginHorizontal: 5 }]}
                          />
                        </TouchableOpacity>
                      }
                    </View>
                    <Text
                      style={PopularCarsStyle.modelTextStyle}>
                      {item.ad_desc}
                    </Text>
                    <Text
                      style={PopularCarsStyle.brandTextStyle}>
                      {item.ad_engine + ' | ' + item.ad_milage}
                    </Text>
                    <Text
                      style={[PopularCarsStyle.priceTextStyle, { color: orderStore.color, fontSize: Appearences.Fonts.headingFontSize, fontWeight: Appearences.Fonts.headingFontWieght }]}>
                      {item.ad_price.price}
                      {item.ad_price.price_type.length != 0 ? <Text style={PopularCarsStyle.priceTextStyle}>{' (' + item.ad_price.price_type + ')'} </Text> : null}
                    </Text>
                    <View numberOfLines={1} style={[PopularCarsStyle.textContainer1, { flexDirection: 'row', flexWrap: 'wrap' }]}>
                      <Image
                        source={require('../../../res/images/calender_grey.png')}
                        style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                      />
                      <Text
                        style={PopularCarsStyle.modelTextStyle}>
                        {item.ad_date}
                      </Text>
                    </View>
                    <View numberOfLines={1} style={[PopularCarsStyle.textContainer1, { flexDirection: 'row', }]}>
                      <Image
                        source={require('../../../res/images/location.png')}
                        style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                      />
                      <Text
                        style={PopularCarsStyle.modelTextStyle}>
                        {item.ad_location.address}
                      </Text>


                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', width: '100%', height: 30, alignItems: 'center', }}>
                  <TouchableOpacity
                    style={[FeaturedGridStyle.featureAdsBtn, { borderBottomWidth: 2, borderBottomColor: 'blue' }]}
                    onPress={() => this.showChatModal(item)}>
                    <Image
                      source={require('../../../res/images/message_grey.png')}
                      style={[FeaturedGridStyle.bottomImgStyl]}
                    />
                    <Text style={FeaturedGridStyle.featureAdsBtntxt}>Chat</Text>

                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[FeaturedGridStyle.featureAdsBtn, { borderBottomWidth: 2, borderBottomColor: orderStore.appColor }]}
                    onPress={() => this.showCallModal(item)}>
                    <Image
                      source={require('../../../res/images/contact.png')}
                      style={[FeaturedGridStyle.bottomImgStyl]}
                    />
                    <Text style={FeaturedGridStyle.featureAdsBtntxt}>Call</Text>

                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

            }
            keyExtractor={item => item.ad_id + ''}
          >
          </FlatList>



        </View>




      </View>

    );


  }
  renderExplore = () => {

    const horizontalMargin = 1;
    const slideWidth = 270;

    const sliderWidth = Dimensions.get('window').width;
    const itemWidth = slideWidth + horizontalMargin * 2;
    let { orderStore } = Store;
    const data = orderStore.home;

    if (!orderStore.home.locations_is_show)
      return null;
    return (

      <View>


        <View style={styles.headingWithButtonContainer}>
          <View style={styles.headingContainer}>
            <View>
              <View style={styles.textRowConrainer}>
                <Text style={styles.bodyHeadingBlack}>{data.locations_txt1}</Text>
                <Text style={styles.bodyHeadingAppColor}> {data.locations_txt2}</Text>
              </View>


            </View>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.smallButtonContainer}
              onPress={() => { this.onPressViewAll() }}>
              <View style={[styles.smallButton, { backgroundColor: orderStore.color }]}>
                <Text style={styles.buttonTextStyle}>{data.view_all}</Text>
              </View>
            </TouchableOpacity>
          </View>



        </View>





        <View style={styles.exploreCountry}>

          <Carousel
            layout={'default'}
            loop={true}
            data={data.locations.slice()}
            renderItem={({ item, index }) =>

              <TouchableOpacity
                onPress={async () => {
                  const params = { ad_country: item.loc_id }

                  const { navigate } = this.props.navigation;
                  await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
                  let { orderStore } = Store;
                  orderStore.setIsCallAdvance(false);
                  navigate('SearchDetail', { params: params });
                }}
                activeOpacity={1}
                style={ExploreCountryStyle.container}>



                <View style={ExploreCountryStyle.imageContainer}>

                  <Image
                    style={ExploreCountryStyle.image}
                    source={{ uri: item.img }} />
                  <View style={ExploreCountryStyle.imageContainer} />
                </View>

                <View style={ExploreCountryStyle.textContainer}>
                  <Text style={ExploreCountryStyle.cityTextStyle}>
                    {item.name}
                  </Text>
                  <Text style={ExploreCountryStyle.countryTextStyle}>
                    {item.count}
                  </Text>
                </View>

              </TouchableOpacity>

            }
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            keyExtractor={item => item.cat_id + ''} >
          </Carousel>

        </View>






      </View>


    );
  }
  renderComparison = () => {
    let { orderStore } = Store;
    const data = orderStore.home.comparisonData;

    if (!data.comp_is_show)
      return null;
    return (

      <View>



        <View style={styles.headingWithButtonContainer}>
          <View style={styles.headingContainer}>

            <View>
              <View style={styles.textRowConrainer}>
                <Text style={styles.bodyHeadingBlack}>{data.txt1}</Text>
                <Text style={styles.bodyHeadingAppColor}> {data.txt2}</Text>
              </View>


            </View>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.smallButtonContainer}
              onPress={() => { this.onPressViewAll() }}>
              <View style={[styles.smallButton, { backgroundColor: orderStore.color }]}>
                <Text style={styles.buttonTextStyle}>{data.view_all}</Text>
              </View>
            </TouchableOpacity>
          </View>



        </View>

        <View>


          <FlatList
            data={data.comparison}
            horizontal={false}
            showsHorizontalScrollIndicator={false}

            renderItem={({ item, index }) =>



              <TouchableOpacity
                activeOpacity={1}
                onPress={() => this.onTopCarsClick(item)}
                style={TopCars.listItemContainer}>


                <View style={TopCars.listContentContainer}>
                  <View style={TopCars.imageContaner}>
                    <Image
                      style={TopCars.image}
                      source={{ uri: item[0].image }}
                    />
                  </View>
                  <View style={TopCars.bottomRowContainer}>
                    <Text style={TopCars.heaedrText}>{item[0].title}</Text>
                    <View style={TopCars.ratingBarContainer}>
                      <StarRating
                        disabled={true}
                        maxStars={5}
                        rating={parseInt(item[0].rating)}
                        selectedStar={(rating) => this.onStarRatingPress(rating)}
                        starSize={14}
                        fullStarColor='#D4AF37'
                      />
                    </View>
                  </View>
                </View>

                <View style={TopCars.listMiddleContainer}>
                  <View style={TopCars.circle}>
                    <Text style={TopCars.vsText}>{data.vs_txt}</Text>
                  </View>
                </View>






                <View style={TopCars.listContentContainer}>
                  <View style={TopCars.imageContaner}>
                    <Image
                      style={TopCars.image}
                      source={{ uri: item[1].image }}
                    />
                  </View>
                  <View style={TopCars.bottomRowContainer}>
                    <Text style={TopCars.heaedrText}>{item[0].title}</Text>
                    <View style={TopCars.ratingBarContainer}>
                      <StarRating
                        disabled={true}
                        maxStars={5}
                        rating={parseInt(item[1].rating)}
                        selectedStar={(rating) => this.onStarRatingPress(rating)}
                        starSize={14}
                        fullStarColor='#D4AF37'
                      />
                    </View>
                  </View>
                </View>




              </TouchableOpacity>





            }
            keyExtractor={item => item[0].post_id + ""}
          >
          </FlatList>




        </View>




      </View>

    );

  }
  renderBlog = () => {
    let { orderStore } = Store;
    const data = orderStore.home.latest_blog;
    if (!orderStore.home.is_show_blog)
      return null;

    return (
      <View>
        <View style={styles.headingWithButtonContainer}>
          <View style={styles.headingContainer}>
            <View>
              <View style={styles.textRowConrainer}>
                <Text style={styles.bodyHeadingBlack}>{data.text}</Text>
                <Text style={styles.bodyHeadingAppColor}> </Text>
              </View>


            </View>
            <TouchableOpacity
              // activeOpacity={1}
              style={styles.smallButtonContainer}
              onPress={() => {
                orderStore.setOnBlogViewAll(true);
                // for (let i = 0; i < orderStore.drawerMenu.length; i++) {
                //   if (orderStore.drawerMenu[i].key == 'blog') {
                //     this.onItemSelected(orderStore.drawerMenu[i], orderStore.drawerMenu[i].key);
                //     this.onPressLink(orderStore.drawerMenu[i]);

                //   }
                // }

              }}>
              <View style={[styles.smallButton, { backgroundColor: orderStore.color }]}>
                <Text style={styles.buttonTextStyle}>{orderStore.home.view_all}</Text>
              </View>
            </TouchableOpacity>
          </View>



        </View>

        <View style={styles.listRowContainer}>
          <FlatList
            contentContainerStyle={{

            }}
            data={data.blogs}
            renderItem={({ item, key }) => (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.listItemContainer}
                onPress={async () => {
                  const { navigate } = this.props.navigation;
                  await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);

                  navigate('BlogDetail', { id: item.post_id });

                }}
                key={key}
              >
                <View style={styles.imageContainer}>
                  <Image
                    style={styles.image}
                    source={{ uri: item.image }}
                  />
                </View>
                <View style={styles.contentContainer}>
                  <Text style={[styles.paragraphText, { marginTop: 0 }]}>{item.date}</Text>
                  <Text style={styles.headingText}>{item.title}</Text>
                  {/* <Text style = {styles.paragraphText}>{item.details.length > 20 ? item.details.substring(0, 20)+" ..." : item.details}</Text>
              <View 
              style = {[styles.buttonContainer,{backgroundColor:orderStore.color}]}>
                <Text style = {styles.headingTextWhite}>{item.read_more}</Text>
              </View> */}
                </View>
              </TouchableOpacity>


            )}
            //Setting the number of column
            numColumns={2}
            keyExtractor={(item, index) => index}
          />
        </View>
      </View>
    )


  }
  _onRefresh = async () => {
    await this.setState({ refreshing: true });

    setTimeout(async () => {

      this.setState({ showSpinner: true });
      let { orderStore } = Store;
      const response = await Api.get('home');
      if (response.success === true) {
        orderStore.drawerMenu = response.data.menu.home_menu

        orderStore.home = response.data;
        this.jobsPositions = response.data.ads_position;

        this.setRandomFeaturedAds();
      }
      if (response.message.length != 0)
        Toast.show(response.message);
      this.setState({ showSpinner: false, refreshing: false });

    }, 1000);

  }

  render() {

    if (this.state.showSpinner)
      return (
        <Loader />

      );

    let { orderStore } = Store;
    const data = orderStore.home;


    return (
      <View style={{ width: '100%', height: '100%' }}>
        <ScrollView contentContainerStyle={{
          backgroundColor: Appearences.Colors.appBackgroundColor,
          paddingBottom: 15,
        }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
          onScroll={this.handleScroll}
        >
          <View>
            {/* Header Start */}
            <View style={styles.header}>

              <Image source={{ uri: data.img }}
                style={styles.headerImage}>
              </Image>

              <View style={[styles.headerImageOverlay, { paddingStart: 0, paddingEnd: 0 }]}>

                <View style={styles.headerInnerContainer}>

                  <Text style={styles.headerTitleText}>
                    {data.tagline}
                  </Text>

                  <View style={[styles.headerUnderline, { backgroundColor: orderStore.color }]} />

                  <Text style={styles.headerSubtitleText}>
                    {data.heading}
                  </Text>

                  <View style={[styles.headerSearchbarContainer, { marginTop: 8 }]}>

                    <TextInput
                      style={[styles.TextInput, { borderTopLeftRadius: Appearences.Radius.radius, borderBottomLeftRadius: Appearences.Radius.radius }]}
                      underlineColorAndroid='transparent'
                      placeholderTextColor={Appearences.Colors.placeholderTextColor}
                      placeholder={data.placehldr}
                      onChangeText={(text) => {
                        this.setState({ searchText: text });
                      }}
                      textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                    />

                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={async () => {
                        let param = { ad_title: this.state.searchText }
                        const { navigate } = this.props.navigation;
                        await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
                        let { orderStore } = Store;
                        orderStore.setIsCallAdvance(false);
                        navigate('SearchDetail', { params: param });

                      }}
                    >
                      <View style={[styles.searchButton, { backgroundColor: orderStore.color, borderTopEndRadius: Appearences.Radius.radius, borderBottomEndRadius: Appearences.Radius.radius }]}>
                        <Image source={require('../../../res/images/search_white.png')}
                          style={styles.searchImage}
                        />
                      </View >
                    </TouchableOpacity>

                  </View>

                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={async () => {
                      await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);

                      this.props.navigation.navigate("AdvancedSearch")
                    }}
                  >
                    <Text style={styles.advencedSearcTextStyle}>{data.advance_search}
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>

            </View>
            {/*Header End*/}
          </View>

          <View style={styles.container}>



            {/*Body Start*/}
            <View style={styles.body}>


              {
                data.ads_position != undefined ?
                  data.ads_position.map((item, key) => (
                    <View
                      style={{
                        marginTop: 5,
                        backgroundColor: Appearences.Colors.lightGrey,
                        paddingStart: 15,
                        paddingEnd: 15,
                      }}
                      key={key}>
                      {this.managePostions(item)}
                    </View>

                  )
                  )
                  : null
              }

























            </View>
            {/*Body End*/}

            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.visibleChatModal}
              onRequestClose={() => {
              }}>

              <View style={styles.modalContainer}>

                <View style={styles.modalContentContainer}>
                  {this.state.similar_ad != null ?
                    <View style={{ height: 70, width: "100%", flexDirection: "row" }}>
                      <View style={{ width: 70, height: 70, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                        <Image source={{ uri: this.state.similar_ad.ad_images[0].thumb }} style={{ width: 70, height: 70 }}></Image>
                      </View>
                      <View style={{ flex: 1, flexDirection: "column" }}>
                        <Text numberOfLines={1} style={{ textAlign: "left", textAlignVertical: "center", flex: 1, color: "#000" }}>{this.state.similar_ad.ad_title}</Text>
                        {/* <Text numberOfLines={1} style={{ textAlign: "left", textAlignVertical: "center", flex: 1 }}>{orderStore.adDetail.data.profile_detail.name}</Text> */}
                        <Text numberOfLines={1} style={{ textAlign: "left", textAlignVertical: "center", flex: 1, color: orderStore.color }}>{this.state.similar_ad.ad_price.price}({this.state.similar_ad.ad_price.price_type})</Text>
                      </View>
                      <TouchableOpacity onPress={() => this.showCallModal(this.state.similar_ad)} style={{ width: 20, height: 30 }}>
                        <Image
                          source={require('../../../res/images/contact.png')}
                          style={[FeaturedGridStyle.bottomImgStyl]}
                        />
                      </TouchableOpacity>
                    </View>
                    : null}
                  <ScrollView
                    keyboardShouldPersistTaps='always'
                  >

                    <View style={styles.modalFormContainer}>


                      <TextInput
                        placeholder="You message here"
                        multiline={true}
                        underlineColorAndroid="transparent"
                        placeholderTextColor={Appearences.Colors.grey}
                        textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                        style={styles.modalTextInputMultiLine}
                        onChangeText={(text) => {
                          this.setState({ popupMessage: text });

                        }}
                      >
                      </TextInput>
                      {

                        this.state.showMessageProgress ?
                          <View style={styles.messageModalProgressRow}>
                            <Progress.Circle
                              size={Appearences.Fonts.headingFontSize}
                              indeterminate={true}
                              color={orderStore.color}
                            />
                          </View>
                          :
                          <TouchableOpacity style={styles.messageModalButtonRow}>

                            <TouchableOpacity
                              onPress={() => {
                                this.setState({ visibleChatModal: false });
                              }}
                              style={[styles.messageMoalButton, { borderColor: Appearences.Colors.grey, borderWidth: 1 }]}>
                              <Text style={styles.buttonTextBlack}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => {
                                this.sendChatMessage();
                              }}
                              style={[styles.messageMoalButton, { backgroundColor: orderStore.color }]}>
                              <Text style={styles.buttonTextWhite}>Send</Text>
                            </TouchableOpacity>

                          </TouchableOpacity>

                      }


                    </View>



                  </ScrollView>
                </View>
              </View>

            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.visibleCallModal}
              onRequestClose={() => {
              }}>

              <View style={styles.modalContainer}>

                <View style={styles.modalContentContainer}>
                  <TouchableOpacity style={{ position: "absolute", top: 0, left: 0, padding: 3 }} onPress={() => this.setState({ visibleCallModal: false, similar_ad: null })}>
                    <Icon name={"times-circle"} size={25} color={orderStore.color}></Icon>
                  </TouchableOpacity>
                  {this.state.similar_ad != null ?
                    <View style={{ height: 70, width: "100%", flexDirection: "row", marginBottom: 50 }}>
                      <View style={{ width: 70, height: 70, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                        <Image source={{ uri: this.state.similar_ad.ad_images[0].thumb }} style={{ width: 70, height: 70 }}></Image>
                      </View>
                      <View style={{ flex: 1, flexDirection: "column" }}>
                        <Text numberOfLines={1} style={{ textAlign: "left", textAlignVertical: "center", flex: 1, color: "#000" }}>{this.state.similar_ad.ad_title}</Text>
                        {/* <Text numberOfLines={1} style={{ textAlign: "left", textAlignVertical: "center", flex: 1 }}>{orderStore.adDetail.data.profile_detail.name}</Text> */}
                        <Text numberOfLines={1} style={{ textAlign: "left", textAlignVertical: "center", flex: 1, color: orderStore.color }}>{this.state.similar_ad.ad_price.price}({this.state.similar_ad.ad_price.price_type})</Text>
                      </View>
                      <TouchableOpacity onPress={() => this.showChatModal(this.state.similar_ad)} style={{ width: 20, height: 30 }}>
                        <Image
                          source={require('../../../res/images/message_grey.png')}
                          style={[FeaturedGridStyle.bottomImgStyl]}
                        />
                      </TouchableOpacity>
                    </View>
                    : null}
                  {this.state.multiPhones.map((item, key) => (
                    <>
                      {item != '' &&
                        <TouchableOpacity
                          onPress={() => this.onCallClick(item)}
                          style={[styles.button, { backgroundColor: orderStore.color }]}>
                          <Text style={styles.buttonTextStyle}>{item}</Text>
                        </TouchableOpacity>
                      }
                    </>
                  ))}
                </View>
              </View>

            </Modal>

          </View>
        </ScrollView>
        {/* Absolute view start */}
        {this.state.isAboslute ?

          <Animatable.View
            animation={this.state.isAboslute ? "fadeInDown" : "fadeOut"} iterationCount={1} direction="normal"
            style={{
              position: 'absolute',
              backgroundColor: orderStore.color,
              flex: 1,
              paddingStart: 10,
              paddingEnd: 10,
              width: '100%',
              paddingBottom: 3,
              // elevation: 5,
              // shadowOpacity: 0.5,
            }}>
            {/* <View
  style={ {  paddingStart:15,
    paddingEnd:15,
    justifyContent:'center',
    width:'100%',
    flex:1,
    backgroundColor:'white',
    marginTop:localProps.topMargin,
    paddingBottom:15,
    paddingTop:15,marginTop: 0,
    backgroundColor: orderStore.color,
     }}
> */}


            <View style={[styles.headerSearchbarContainer, {}]}>

              <TextInput
                style={[styles.TextInput, { borderTopLeftRadius: Appearences.Radius.radius, borderBottomLeftRadius: Appearences.Radius.radius }]}
                underlineColorAndroid='transparent'
                placeholderTextColor={Appearences.Colors.placeholderTextColor}
                placeholder={data.placehldr}
                onChangeText={(text) => {
                  this.setState({ searchText: text });
                }}
                textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
              />

              <TouchableOpacity
                activeOpacity={1}
                onPress={async () => {
                  let param = { ad_title: this.state.searchText }
                  const { navigate } = this.props.navigation;
                  await BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
                  let { orderStore } = Store;
                  orderStore.setIsCallAdvance(false);
                  navigate('SearchDetail', { params: param });

                }}
              >
                <View style={[styles.searchButton, { backgroundColor: orderStore.color }]}>
                  <Image source={require('../../../res/images/search_white.png')}
                    style={styles.searchImage}
                  />
                </View >
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={async () => {
                  const { navigate } = this.props.navigation;
                  navigate('AdvancedSearch');

                }}
              >
                <View style={[styles.searchButton, { backgroundColor: orderStore.color, }]}>
                  <Image source={require('../../../res/images/filters.png')}
                    style={styles.searchImage}
                  />
                </View >
              </TouchableOpacity>

            </View>

            {/* </View> */}


          </Animatable.View>

          : null


        }


        {/* Absolute view end */}
      </View>
    );

  }

  onStarRatingPress(rating) {
  }
}
const localProps = {

  headerHeight: 200,
  topMargin: 5,
  sidePadding: 10,
  bodyTopMargin: 15,
  sliderArrowContainerWidth: 20,
  sliderArrowContainerHeight: 60,
  topSliderArrowDimens: 15,
};



