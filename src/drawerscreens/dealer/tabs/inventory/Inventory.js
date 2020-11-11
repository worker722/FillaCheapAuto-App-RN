import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  RefreshControl,
  Linking,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import Store from '../../../../Stores';
import styles from './Styles';
import DealerHeader from '../../../../components/DealerHeader';
import * as Progress from 'react-native-progress';
import Appearences from '../../../../config/Appearences';
import Api from '../../../../network/Api';
import { withNavigation } from 'react-navigation';
import { I18nManager } from 'react-native'
import FeaturedGridStyle from '../../../home/FeaturedGridStyle';
import PopularCarsStyle from '../../../home/PopularCarsStyle';
class Inventory extends Component<Props> {
  defaultData = [];
  paginationDefault;

  constructor(props) {
    let { orderStore } = Store;
    super(props);

    this.state = {
      serviceRating: 3,
      buyingRating: 4,
      vehicleRating: 5,
      reviewTitle: '',
      reviewText: '',
      latitude: '0',
      longitude: '0',
      switchValue: true,
      listData: [],

      refreshing: false,
      reCaller: false,
      swipeUp: false,
      reRender: false,
      showChatModel: false,
      similar_ad: null,
    }
  }

  componentWillMount = async () => {
    let { orderStore } = Store;
    orderStore.profile = await Api.get('profile');
    //console.log('orderStore')
    //console.log(orderStore)
    this.defaultData = [...orderStore.publicProfile.inventory.lists.ads];
    this.paginationDefault = orderStore.publicProfile.inventory.lists.pagination;
    this.setState({ listData: orderStore.publicProfile.inventory.lists.ads });
  }
  addFav = async () => {
    let { orderStore } = Store
    if (orderStore.name != "Guest") {

      const params = { ad_id: item.ad_id };
      let response = await Api.post('ad_post/favourite', params);
      if (response.success === true)
        this.componentWillMount();

      if (response.message.length != 0)
        Toast.show(response.message);
    }
    else {
      alert('Please login into account')
    }

  }
  deleteItem = async (item) => {
    // this.setState({ showSpinner: true });

    let { orderStore } = Store
    if (orderStore.name != "Guest") {

      const params = { ad_id: item.ad_id }
      let response = await Api.post('ad/favourite/remove', params);
      if (response.success === true) {
        this.componentWillMount()
      }

      if (response.message.length != 0)
        Toast.show(response.message);
    }
    else {
      alert('Please login into account')
    }
  }
  setLatLong = () => {
    let { orderStore } = Store;
    const profile = orderStore.publicProfile;
    const latLong = profile.lat_long;
    this.setState({ latitude: latLong.lat, longitude: latLong.long });

    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latLong.lat},${latLong.long}`;
    let label = ""
    if (profile.list.text[0].val != "") {
      label = profile.list.text[0].val;

    } else {
      label = profile.list.text[0].key;

    }
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });


    Linking.openURL(url);

  }

  _onSwipeUp = async () => {
    await this.setState({ swipeUp: true });

    setTimeout(async () => {
      let { orderStore } = Store;
      orderStore.profile = await Api.get('profile');
      orderStore.publicProfile.inventory.lists.ads = [...this.defaultData];
      orderStore.publicProfile.inventory.lists.pagination = this.paginationDefault;
      this.setState({ listData: this.defaultData, swipeUp: false, reCaller: false, refreshing: false, reRender: !this.state.reRender });

    }, 1000);
  }
  _onRefresh = () => {

    let { orderStore } = Store;
    let pagination = orderStore.publicProfile.inventory.lists.pagination;
    if (pagination.has_next_page === true) {
      this.setState({ refreshing: true });
      this.loadMore(pagination.next_page);
    }

  }
  loadMore = async (nextPage) => {

    let { orderStore } = Store;

    let params = { user_id: orderStore.publicProfile.id, page_number: nextPage };
    // let params = { dealer_id: orderStore.publicProfile.id, page_number: nextPage  };
    // console.log('inventory params', JSON.stringify(params))
    let response = await Api.post('profile/public/inventory', params);
    if (response.success === true) {
      // console.log('inventory result', JSON.stringify(orderStore.publicProfile.inventory))
      orderStore.publicProfile.inventory.lists.pagination = response.data.pagination;
      orderStore.publicProfile.inventory.lists.ads = [...orderStore.publicProfile.inventory.lists.ads, ...response.data.ads];
      this.setState({ listData: orderStore.publicProfile.inventory.lists.ads });

    }
    if (response.message.length != 0)
      Toast.show(response.message);
    this.setState({ refreshing: false, reCaller: false });
  }

  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  showChatModal = async (item) => {
    // let { orderStore } = Store;

    // const params = { ad_id: item.ad_id };
    // orderStore.adDetail = await Api.post('ad_post', params);
    // item = Object.assign(item, { ad_images: item.images });
    this.setState({ showChatModel: true, similar_ad: item });
  }

  sendChatMessage = async () => {
    this.setState({ showMessageProgress: true });
    //console.log(this.state.similar_ad_id);
    const params = { ad_id: this.state.similar.ad_id, message: this.state.popupMessage };

    const response = await Api.post('message/popup', params);
    if (response.success === true) { }
    Toast.show(response.message);
    this.setState({ showMessageProgress: false, showChatModel: false });
  }

  onCallClick = async (id) => {
    const params = { ad_id: id };

    const adDetail = await Api.post('ad_post', params);
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

  render() {
    const { orderStore } = Store;

    const profile = orderStore.publicProfile;
    let tempIntentoryData = orderStore.publicProfile.inventory;
    let favouriteAds = []
    const latLong = profile.lat_long;

    if (orderStore.profile.data) {
      favouriteAds = orderStore.profile.data.favourite_add.ads;
      console.log(favouriteAds.length)
      for (let i in favouriteAds) {
        for (let j in tempIntentoryData) {
          if (tempIntentoryData[j].ad_id === favouriteAds[i].ad_id) {
            tempIntentoryData[j].added_fav = true;
          }
        }
      }
    }

    const inventory = tempIntentoryData;

    return (
      <View style={{
        height: '100%',
        backgroundColor: Appearences.Colors.appBackgroundColor,
        paddingBottom: 5,
      }}>

        <ScrollView

          key={this.state.reRender}
          contentContainerStyle={{ backgroundColor: Appearences.Colors.appBackgroundColor }}
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
          }}
          scrollEventThrottle={400}>

          <DealerHeader />

          {/* {item.is_show ? */}
          {/* <View style={styles.container}>

            <FlatList
              data={profile.list.text}
              horizontal={false}
              showsVerticalScrollIndicator={false}

              renderItem={({ item, index }) =>

                <View>
                  <View style={styles.contactRowContainer}>
                    <Image style={styles.aboutImage} source={item.key === 'Address' ? require('../../../../../res/images/placeholder.png') : item.key === 'Contact Number' ? require('../../../../../res/images/placeholder.png') : item.key === 'Website' ? require('../../../../../res/images/world.png') : null} />
                    <Text style={styles.paragraphTextBlackMarginStart}>{item.val}</Text>
                  </View>
                  <View style={styles.lineSeperator} />

                </View>

              }
              keyExtractor={item => item.val + ''}
            >
            </FlatList>
          </View> */}
          {
            profile.list.text[0].is_show || profile.list.text[1].is_show || profile.list.text[2].is_show ? [
              <View style={[styles.panel, { borderRadius: 5 }]}>


                <View style={styles.locatonTextContainer}>
                  <Text style={styles.subHeading}>
                    {profile.list.title}
                  </Text>

                </View>
                <FlatList
                  data={profile.list.text}
                  horizontal={false}
                  showsVerticalScrollIndicator={false}

                  renderItem={({ item, index }) =>
                    item.is_show ?
                      <View>
                        <View style={[styles.contactRowContainer, { alignContent: 'center', alignItems: 'center', alignSelf: 'center' }]}>
                          <Image style={[styles.aboutImage, { marginTop: 5 }]} source={item.key === 'Address' ? require('../../../../../res/images/placeholder.png') : item.key === 'Contact Number' ? require('../../../../../res/images/phone.png') : item.key === 'Website' ? require('../../../../../res/images/world.png') : null} />
                          <Text style={styles.paragraphTextBlackMarginStart}>{item.val}</Text>
                        </View>
                        {
                          index + 1 == profile.list.text.length ? [] : [
                            <View style={styles.lineSeperator} />

                          ]
                        }

                      </View> : null

                  }
                  keyExtractor={item => item.val + ''}
                >
                </FlatList>
                {/* <Text style={styles.headingTextBlack}>
                {profile.intro.desc}
              </Text> */}


              </View>
            ] : [

              ]
          }

          {/* : null} */}
          {latLong.is_show ?
            <View style={[styles.panel, { borderRadius: 5 }]}>


              <View style={styles.locatonTextContainer}>
                <Text style={styles.subHeading}>
                  {profile.intro.desc_title}
                </Text>
                {/* <TouchableOpacity
                  onPress={() => { this.setLatLong() }}
                  style={{ flexDirection: 'row' }}>
                  <Image
                    style={styles.locationImage}
                    source={require('../../../../../res/images/placeholder.png')}
                  />
                  <Text style={styles.paragraphTextGrey}>
                    {latLong.text}
                  </Text>
                </TouchableOpacity> */}
              </View>
              <Text style={styles.headingTextBlack}>
                {profile.intro.desc}
              </Text>


            </View>

            : null}





          <View style={styles.container}>

            {
              inventory.lists.ads == undefined ? [
                <Text style={[styles.subHeading, { marginTop: 5 }]}>
                  {inventory.no_inventory_msg}
                </Text>
              ] : [
                  inventory.lists.ads.length == 0 ? [
                    <Text style={[styles.subHeading, { marginTop: 5 }]}>
                      {inventory.no_inventory_msg}
                    </Text>

                  ] : [
                      <Text style={[styles.subHeading, { marginTop: 5 }]}>
                        {inventory.title}
                      </Text>
                    ]


                ]
            }



            <View style={styles.popularCars}>




              <FlatList
                data={inventory.lists.ads}
                horizontal={false}
                showsVerticalScrollIndicator={false}

                renderItem={({ item, index }) =>

                  <TouchableOpacity
                    onPress={async () => {
                      const { navigate, push } = this.props.navigation;
                      push('AdDetailTabManager', { adId: item.ad_id });
                    }}
                    style={styles.flatListContainer}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={styles.imageContainer}>
                        <Image
                          style={[styles.image, { alignSelf: 'center', marginTop: 30 }]}
                          source={{ uri: item.ad_images[0].thumb }} />
                      </View>
                      <View style={FeaturedGridStyle.textContainer}>
                        <Text
                          style={FeaturedGridStyle.petrolTextStyle}>
                          {item.ad_cats_name}
                        </Text>

                        <View style={[PopularCarsStyle.textContainer, { flexDirection: 'row', marginBottom: -12 }]}>
                          <Text style={FeaturedGridStyle.brandTextStyle}>
                            {item.ad_title}
                          </Text>

                          {
                            item.added_fav &&
                            <TouchableOpacity onPress={() => this.deleteItem(item)}>
                              <Image
                                source={require('../../../../../res/images/heart_filled.png')}
                                style={[FeaturedGridStyle.bottomImgStyl, { marginHorizontal: 5 }]}
                              />
                            </TouchableOpacity>
                          }
                          {
                            !item.added_fav &&
                            <TouchableOpacity onPress={() => this.addFav(item)}>
                              <Image
                                source={require('../../../../../res/images/heart.png')}
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
                            source={require('../../../../../res/images/calender_grey.png')}
                            style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                          />
                          <Text
                            style={PopularCarsStyle.modelTextStyle}>
                            {item.ad_date}
                          </Text>
                        </View>
                        <View numberOfLines={1} style={[PopularCarsStyle.textContainer1, { flexDirection: 'row', }]}>
                          <Image
                            source={require('../../../../../res/images/location.png')}
                            style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                          />
                          <Text
                            style={PopularCarsStyle.modelTextStyle}>
                            {item.ad_location.address}
                          </Text>
                        </View>
                      </View>
                      {/* <View style={styles.textContainer}>
                      <Text
                        style={styles.modelTextStyle}>
                         {item.ad_cats_name}
                      </Text>
                      <Text
                        style={styles.brandTitleStyle}>
                        {item.ad_title}
                      </Text>
                      <Text
                        style={styles.modelTextStyle}>
                        {item.ad_desc}
                      </Text>
                      <Text
                        style={styles.brandTextStyle}>
                        {item.ad_engine + ' | ' + item.ad_milage}
                      </Text>
                      <Text
                        style={[styles.priceTextStyle, { color: orderStore.color }]}>
                        {item.ad_price.price}
                      </Text>
                    </View> */}

                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', height: 30, alignItems: 'center' }}>
                      <TouchableOpacity
                        style={[styles.featureAdsBtn, { borderBottomWidth: 2, borderBottomColor: 'blue' }]}
                        onPress={() => this.showChatModal(item)}>
                        <Image
                          source={require('../../../../../res/images/message_grey.png')}
                          style={[styles.bottomImgStyl]}
                        />
                        <Text style={[styles.featureAdsBtntxt, {}]}>Chat</Text>

                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.featureAdsBtn, { borderBottomWidth: 2, borderBottomColor: orderStore.appColor }]}
                        onPress={() => this.onCallClick(item.ad_id)}>
                        <Image
                          source={require('../../../../../res/images/contact.png')}
                          style={[styles.bottomImgStyl]}
                        />
                        <Text style={[styles.featureAdsBtntxt, {}]}>Call</Text>

                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>

                }
                keyExtractor={item => item.ad_id + ''}
              >
              </FlatList>


            </View>
          </View>





          {this.state.refreshing ?
            <Progress.Circle
              size={20}
              style={{ alignSelf: 'center', marginTop: 15, paddingBottom: 15 }}
              color={orderStore.color}
              indeterminate={true} /> : null}

        </ScrollView>
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
                      source={require('../../../../../res/images/contact.png')}
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
export default withNavigation(Inventory)







