import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  I18nManager,
  TextInput,
  Linking,
  Modal,
  Dimensions
} from 'react-native';
import { HeaderBackButton } from 'react-navigation-stack';
import Appearences from '../../../config/Appearences';
import PopularCarsStyle from '../../home/PopularCarsStyle';
import FeaturedGridStyle from '../../home/FeaturedGridStyle';
import styles from './Styles';
import Store from '../../../Stores';
import Toast from 'react-native-simple-toast';
import Api from '../../../network/Api';
import Loader from '../../../components/Loader';
import NoFeaturedAdsFound from '../../../components/NoDataFound';
import NoAdsFound from '../../../components/NoDataFound';
import stores from '../../../Stores/orderStore';
import { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import ModalBox from 'react-native-modalbox';
import { observer } from 'mobx-react';
import * as Progress from 'react-native-progress';
import ModalDropdown from 'react-native-modal-dropdown';
import SearchDetailRightIcon from '../../../components/SearchDetailRightIcon';
import * as Animatable from 'react-native-animatable';
import { NavigationActions } from 'react-navigation';


const sortOptions = [];
const sortKeys = [];
let instance = null;
const featuredItemWidth = Dimensions.get("screen").width * 47 / 100;
@observer
export default class SearchDetail extends Component<Props> {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <View style={{ backgroundColor: stores.color, height: Appearences.Registration.itemHeight + 10, flexDirection: "row" }}>
        <HeaderBackButton
          onPress={() => {
            navigation.goBack(null)
          }} tintColor={'#fff'} />
        <View style={[styles.headerSearchbarContainer]}>
          <TextInput
            style={[styles.TextInput, { borderTopLeftRadius: Appearences.Radius.radius, borderBottomLeftRadius: Appearences.Radius.radius }]}
            underlineColorAndroid='transparent'
            placeholderTextColor={Appearences.Colors.placeholderTextColor}
            placeholder={stores.home.placehldr}
            onChangeText={(text) => {
              instance.setState({ searchText: text });
            }}
            textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
          />

          <TouchableOpacity
            activeOpacity={1}
            onPress={async () => {
              let param = { ad_title: instance.state.searchText }
              instance.setState({ showSpinner: true });
              instance.searchFromText(param)
            }}
          >
            <View style={[styles.searchButton, { backgroundColor: stores.color }]}>
              <Image source={require('../../../../res/images/search_white.png')}
                style={styles.searchImage}
              />
            </View >
          </TouchableOpacity>

        </View>
        <SearchDetailRightIcon />
      </View>
    ),
  });
  adsDefaulValue = [];
  adsPaginationDefaultValue;

  searchFromText = async (params) => {


    let { orderStore } = Store;
    orderStore.innerResponse = await Api.post('ad_post/search', params);
    const data = orderStore.innerResponse.data;

    if (orderStore.innerResponse.success === true) {
      if (orderStore.innerResponse.data.featured_ads.ads.length === 0)
        this.setState({ noFeaturedAdsVisibility: true });
      else
        this.setState({ noFeaturedAdsVisibility: false });
      if (orderStore.innerResponse.data.ads.length === 0)
        this.setState({ noAdsVisibility: true });
      else
        this.setState({ noAdsVisibility: false });

      orderStore.profile = await Api.get('profile');

      this.setState({ listData: orderStore.innerResponse.data.ads, featuredGridData: orderStore.innerResponse.data.featured_ads.ads }, () => {
        this.setRandomFeaturedAds();
      });
    }

    this.setState({ showSpinner: false, reCaller: false, });

  }

  componentWillUnmount = async () => {
    clearInterval(this.state.renderInterval);
  }

  componentWillMount = async () => {
    let { orderStore } = Store;
    const params = this.props.navigation.state.params.params;
    orderStore.innerResponse = await Api.post('ad_post/search', params);
    const data = orderStore.innerResponse.data;
    const extra = orderStore.innerResponse.extra;
    if (orderStore.innerResponse.success === true) {
      if (orderStore.innerResponse.data.featured_ads.ads.length === 0) {
        this.setState({ noFeaturedAdsVisibility: true });
      }
      if (orderStore.innerResponse.data.ads.length === 0) {
        this.setState({ noAdsVisibility: true });
      }

      orderStore.profile = await Api.get('profile');
      this.adsDefaulValue = [...orderStore.innerResponse.data.ads];
      this.adsPaginationDefaultValue = orderStore.innerResponse.pagination;
      this.setState({ listData: orderStore.innerResponse.data.ads, featuredGridData: orderStore.innerResponse.data.featured_ads.ads, noAdsMessage: extra.no_ads_found, noFeaturedAdsMessage: extra.no_ads_found }, () => {
        this.setRandomFeaturedAds();
      });
      const sortOptionsArray = orderStore.innerResponse.topbar.sort_arr;
      for (var i = 0; i < sortOptionsArray.length; i++) {

        sortOptions.push(sortOptionsArray[i].value);
        sortKeys.push(sortOptionsArray[i].key);

      }
    }
    this.setState({ showSpinner: false });

  }
  _onSwipeUp = async () => {
    await this.setState({ swipeUp: true });

    setTimeout(async () => {
      this.setState({ showSpinner: true });
      let { orderStore } = Store;
      const params = this.props.navigation.state.params.params;
      orderStore.innerResponse = await Api.post('ad_post/search', params);

      const data = orderStore.innerResponse.data;

      if (orderStore.innerResponse.success === true) {
        if (orderStore.innerResponse.data.featured_ads.ads.length === 0) {
          this.setState({ noFeaturedAdsVisibility: true });
        }
        else {
          this.setState({ noFeaturedAdsVisibility: false });
        }
        if (orderStore.innerResponse.data.ads.length === 0) {
          this.setState({ noAdsVisibility: true });
        }
        else
          this.setState({ noAdsVisibility: false });

        orderStore.profile = await Api.get('profile');
        this.setState({ listData: orderStore.innerResponse.data.ads, featuredGridData: orderStore.innerResponse.data.featured_ads.ads });

      }

      this.setState({ showSpinner: false, swipeUp: false, reCaller: false, });

    }, 1000);
  }
  _onRefresh = () => {

    let { orderStore } = Store;
    let pagination = orderStore.innerResponse.pagination;
    if (pagination.has_next_page === true) {

      this.setState({ refreshing: true });
      this.loadMore(pagination.next_page);
    }
  }
  loadMore = async (nextPage) => {

    let { orderStore } = Store;
    let params = this.props.navigation.state.params.params;

    params.page_number = nextPage;
    let response = await Api.post('ad_post/search', params);

    if (response.success === true) {
      orderStore.innerResponse.pagination = response.pagination;
      orderStore.innerResponse.data.ads = [...orderStore.innerResponse.data.ads, ...response.data.ads];

      await this.setState({ listData: orderStore.innerResponse.data.ads });
    }
    if (response.message.length != 0)
      Toast.show(response.message);
    this.setState({ refreshing: false, reCaller: false, });
  }

  addFav = async (item) => {
    let { orderStore } = Store
    if (orderStore.name != "Guest") {

      const params = { ad_id: item.ad_id };
      let response = await Api.post('ad_post/favourite', params);
      if (response.success === true) {
        this.searchFromText(this.props.navigation.state.params.params);

      }

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
        this.searchFromText(this.props.navigation.state.params.params);
      }

      if (response.message.length != 0)
        Toast.show(response.message);
    }
    else {
      alert('Please login into account')
    }
  }


  constructor(props) {
    super(props);

    this.state = {
      showSpinner: true,
      refreshing: false,
      listData: [],
      featuredGridData: [],
      noFeaturedAdsMessage: "",
      noFeaturedAdsVisibility: false,
      noAdsMessage: "",
      noAdsVisibility: false,
      reCaller: false,
      swipeUp: false,
      searchText: '',
      showModal: false,
      sortList: [{ title: 'Newest To Oldest', checked: false },
      { title: 'Oldest To New', checked: false },
      { title: 'Alphabatically[a-z]', checked: false },
      { title: 'Alphabatically[z-a]', checked: false },],
      firstModalCurrentIndex: 0,
      showChatModel: false,
      similar_ad: null,
    }

    this.featuredAdsIndex = 2;
    const renderInterval = setInterval(() => {
      if (this.flFeaturedAdsRef != null) {
        if (this.featuredAdsIndex == 3)
          this.featuredAdsIndex = -1;
        this.featuredAdsIndex++;
        this.flFeaturedAdsRef.scrollToIndex({ animated: true, index: this.featuredAdsIndex });
      }
    }, 2000);
    this.setState({ renderInterval });

    instance = this;
  }

  getItemLayout = (data, index) => (
    { length: 5, offset: index * featuredItemWidth, index }
  )


  setRandomFeaturedAds = () => {
    let tempData = this.state.featuredGridData;

    var currentIndex = tempData.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = tempData[currentIndex];
      tempData[currentIndex] = tempData[randomIndex];
      tempData[randomIndex] = temporaryValue;
    }

    this.setState({ featuredGridData: tempData });
  }

  renderFeaturedAds = () => {
    let { orderStore } = Store;

    let featuredGridData = this.state.featuredGridData;
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

    if (true) {
      // if (orderStore.innerResponse.extra.is_show_featured === true) {
      return (
        <View style={[styles.container, { paddingBottom: 25, paddingTop: 15 }]}>



          <View style={styles.topSpace} />
          <Text style={[styles.subHeading, { color: 'white' }]}>{orderStore.innerResponse.data.featured_ads.text}</Text>
          <View style={styles.topSpace} />
          <View style={styles.featuredGrid}>


            <FlatList
              ref={(ref) => { this.flFeaturedAdsRef = ref; }}
              data={featuredGridData}
              getItemLayout={this.getItemLayout}
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
                              source={require('../../../../res/images/star_white.png')} />
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
                            source={require('../../../../res/images/play.png')} />
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
                            source={require('../../../../res/images/heart_filled.png')}
                            style={[FeaturedGridStyle.bottomImgStyl, { marginHorizontal: 5 }]}
                          />
                        </TouchableOpacity>
                      }
                      {
                        !item.added_fav &&
                        <TouchableOpacity onPress={() => this.addFav(item)}>
                          <Image
                            source={require('../../../../res/images/heart.png')}
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
                        source={require('../../../../res/images/calender_grey.png')}
                        style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                      />
                      <Text
                        style={PopularCarsStyle.modelTextStyle}>
                        {item.ad_date}
                      </Text>
                    </View>
                    <View numberOfLines={1} style={[PopularCarsStyle.textContainer1, { flexDirection: 'row', }]}>
                      <Image
                        source={require('../../../../res/images/location.png')}
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
                        source={require('../../../../res/images/message_grey.png')}
                        style={[FeaturedGridStyle.bottomImgStyl]}
                      />
                      <Text style={FeaturedGridStyle.featureAdsBtntxt}>Chat</Text>

                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[FeaturedGridStyle.featureAdsBtn, { borderBottomWidth: 2, borderBottomColor: orderStore.appColor }]}
                      onPress={() => this.onCallClick(item.ad_id)}>
                      <Image
                        source={require('../../../../res/images/contact.png')}
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


            <NoFeaturedAdsFound
              message={this.state.noFeaturedAdsMessage}
              visible={this.state.noFeaturedAdsVisibility}
            />



          </View>




        </View>);

      // }
    }

    else
      return null;
  }
  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  onPressFirstModal(index) {

    this.setState({
      firstModalCurrentIndex: index,
    });

  }
  componentDidUpdate = () => {
    let { orderStore } = Store;

    orderStore.setOnClickSearchListener(false);


  }
  sort = async (index) => {
    this.setState({ showSpinner: true });

    let { orderStore } = Store;

    const param = {
      sort: sortKeys[index]
    }
    orderStore.innerResponse = await Api.post('ad_post/search', param);
    const data = orderStore.innerResponse.data;
    const extra = orderStore.innerResponse.extra;
    if (orderStore.innerResponse.success === true) {
      if (orderStore.innerResponse.data.featured_ads.ads.length === 0) {
        this.setState({ noFeaturedAdsVisibility: true });
      }
      if (orderStore.innerResponse.data.ads.length === 0) {
        this.setState({ noAdsVisibility: true });
      }
      this.adsDefaulValue = [...orderStore.innerResponse.data.ads];
      this.adsPaginationDefaultValue = orderStore.innerResponse.pagination;
      this.setState({ listData: orderStore.innerResponse.data.ads, featuredGridData: orderStore.innerResponse.data.featured_ads.ads, noAdsMessage: extra.no_ads_found, noFeaturedAdsMessage: extra.no_ads_found });
    }
    this.setState({ showSpinner: false });

  }

  sendChatMessage = async () => {
    this.setState({ showMessageProgress: true });
    const params = { ad_id: this.state.similar_ad_id, message: this.state.popupMessage };

    const response = await Api.post('message/popup', params);
    if (response.success === true) { }
    Toast.show(response.message);
    this.setState({ showMessageProgress: false, showChatModel: false });
  }

  showChatModal = async (item) => {
    // let { orderStore } = Store;

    // const params = { ad_id: item.ad_id };
    // orderStore.adDetail = await Api.post('ad_post', params);

    this.setState({ showChatModel: true, similar_ad: item });
  }

  onCallClick = async (id) => {
    this.setState({ showSpinner: true });
    const params = { ad_id: id };

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
  }
  handleScroll = (event) => {
    if (event.contentOffset.y > 290)
      this.setState({ isAboslute: true });
    else
      this.setState({ isAboslute: false })
  }
  render() {
    let { orderStore } = Store;

    let listData = this.state.listData;
    let favouriteAds = []

    if (orderStore.profile.data) {
      favouriteAds = orderStore.profile.data.favourite_add.ads;
      for (let i in favouriteAds) {
        for (let j in listData) {
          if (listData[j].ad_id === favouriteAds[i].ad_id) {
            listData[j].added_fav = true
          }
        }
      }
    }
    if (orderStore.onClickSearch) {
      this.props.navigation.replace("Search");
    }
    if (this.state.showSpinner)
      return (
        <Loader />

      );

    return (
      <View style={{
        height: '100%',
        backgroundColor: Appearences.Colors.appBackgroundColor,
        paddingBottom: 5,
      }}>

        <ScrollView contentContainerStyle={{
          backgroundColor: Appearences.Colors.appBackgroundColor,
        }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.swipeUp}
              onRefresh={this._onSwipeUp}
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            if (this.isCloseToBottom(nativeEvent)) {
              if (this.state.reCaller === false) {
                this._onRefresh();
              }
              this.setState({ reCaller: true })

            }
            this.handleScroll(nativeEvent);
          }}
          scrollEventThrottle={400}>
          {this.renderFeaturedAds()}

          <View style={styles.container}>

            <View style={styles.topSpace} />
            <View style={styles.topSpace} />

            <View style={{ paddingStart: 20, paddingVertical: 8, borderRadius: 5, flexDirection: 'row', backgroundColor: '#fff', justifyContent: 'space-between', width: '100%' }}>
              {
                orderStore.innerResponse.topbar != undefined ?
                  orderStore.innerResponse.topbar.count_ads != undefined ? [
                    <Text>{orderStore.innerResponse.topbar.count_ads}</Text>

                  ] : [] : null
              }
              <View>
                {/* Model */}
                <TouchableOpacity onPress={() => {
                  this.subRef.show();
                }}
                  style={styles.row}
                >
                  <ModalDropdown
                    options={sortOptions}
                    ref={el => this.subRef = el}
                    style={styles.pickerContainer}
                    dropdownStyle={styles.dorpDownStyle}

                    dropdownTextHighlightStyle={styles.dropDownTextStyle}
                    textStyle={styles.dorpdownContainerTextStyle}
                    defaultValue={orderStore.innerResponse.topbar != undefined ? orderStore.innerResponse.topbar.sort_arr_key != undefined ? orderStore.innerResponse.topbar.sort_arr_key.value : "" : ""}
                    onSelect={(index, value) => {
                      this.sort(index)
                    }}
                    renderSeparator={() => { return (<View style={styles.dropdownSeperator} />); }}

                    renderRow={(option, index, isSelected) => {
                      return (<View style={styles.dorpDownRow}>
                        <Text style={styles.dropDownTextStyle}>{option}</Text>
                      </View>);
                    }} />
                  <View style={styles.dropdownArrowContainer}>
                    <Image
                      style={styles.popupViewImage}
                      source={require('../../../../res/images/right_arrow.png')}
                    />
                  </View>
                </TouchableOpacity>




              </View>

            </View>

            <View style={styles.topSpace} />

            <FlatList

              data={listData}
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
                              source={require('../../../../res/images/heart_filled.png')}
                              style={[FeaturedGridStyle.bottomImgStyl, { marginHorizontal: 5 }]}
                            />
                          </TouchableOpacity>
                        }
                        {
                          !item.added_fav &&
                          <TouchableOpacity onPress={() => this.addFav(item)}>
                            <Image
                              source={require('../../../../res/images/heart.png')}
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
                          source={require('../../../../res/images/calender_grey.png')}
                          style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                        />
                        <Text
                          style={PopularCarsStyle.modelTextStyle}>
                          {item.ad_date}
                        </Text>
                      </View>
                      <View numberOfLines={1} style={[PopularCarsStyle.textContainer1, { flexDirection: 'row', }]}>
                        <Image
                          source={require('../../../../res/images/location.png')}
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
                        source={require('../../../../res/images/message_grey.png')}
                        style={[FeaturedGridStyle.bottomImgStyl]}
                      />
                      <Text style={FeaturedGridStyle.featureAdsBtntxt}>Chat</Text>

                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[FeaturedGridStyle.featureAdsBtn, { borderBottomWidth: 2, borderBottomColor: orderStore.appColor }]}
                      onPress={() => this.onCallClick(item.ad_id)}>
                      <Image
                        source={require('../../../../res/images/contact.png')}
                        style={[FeaturedGridStyle.bottomImgStyl]}
                      />
                      <Text style={FeaturedGridStyle.featureAdsBtntxt}>Call</Text>

                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              }
              keyExtractor={item => item.ad_author_id + "" + item.ad_title}
            >
            </FlatList>
            <NoAdsFound
              message={this.state.noAdsMessage}
              visible={this.state.noAdsVisibility}
            />
          </View>

          {this.state.refreshing ?
            <View
              style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: 40, }}
            >
              <Progress.Circle
                size={20}
                style={{ alignSelf: 'center' }}
                color={orderStore.color}
                indeterminate={true} />
            </View> : null}

        </ScrollView>


        <ModalBox
          style={styles.modalBoxStyle}
          position={"bottom"}
          ref={"modal4"}>
          <View style={styles.modalContentContainer}>
            <ScrollView>
              <View style={styles.subHeadingContainer}>
                <Text style={[styles.subHeading, { color: '#999999' }]}>Filter By</Text>

              </View>
              <FlatList
                data={this.state.sortList}
                horizontal={false}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) =>

                  <TouchableOpacity

                    onPress={() => { this.onPressFirstModal(index); }}
                  >
                    <View style={styles.modalItemContainer}>

                      <Text style={[styles.flatListItemHeadingText, { alignSelf: 'center', color: '#999999' }]}>
                        {item.title}
                      </Text>

                      <RadioButton

                      >

                        <RadioButtonInput
                          obj={item}
                          index={index}
                          isSelected={this.state.firstModalCurrentIndex === index}
                          borderWidth={1}
                          buttonInnerColor={stores.color}
                          buttonOuterColor={this.state.firstModalCurrentIndex === index ? stores.color : Appearences.Colors.grey}
                          buttonSize={6}
                          buttonStyle={styles.radioButtonStyle}
                          buttonWrapStyle={styles.buttonWrapStyle} />

                      </RadioButton>




                    </View>

                  </TouchableOpacity>
                }
                keyExtractor={item => item.title}
              >
              </FlatList>


            </ScrollView>
          </View>


        </ModalBox>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.showChatModel}
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
                  <TouchableOpacity onPress={() => this.onCallClick(this.state.similar_ad.ad_id)} style={{ width: 20, height: 30 }}>
                    <Image
                      source={require('../../../../res/images/contact.png')}
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
                            this.setState({ showChatModel: false });
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

      </View>
    );
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









