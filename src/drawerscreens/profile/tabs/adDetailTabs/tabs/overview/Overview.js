import React, { Component } from 'react';
import {
  Text,
  View,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,

  Linking,
  Platform,
  Dimensions,
  StyleSheet,
  I18nManager,
} from 'react-native';
import AdDetailHeader from '../../../../../../components/AdDetailHeader';
import styles from './Styles';
import Store from '../../../../../../Stores';
import Db from '../../../../../../storage/LocalDb';
import { Avatar } from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import DatePicker from 'react-native-datepicker'
import * as Progress from 'react-native-progress';
import Appearences from '../../../../../../config/Appearences';
import Api from '../../../../../../network/Api';
import Toast from 'react-native-simple-toast';
import FeaturedGridStyle from '../../../../../home/FeaturedGridStyle';
import PopularCarsStyle from '../../../../../home/PopularCarsStyle';
import { withNavigation } from 'react-navigation';
import HTML from 'react-native-render-html';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import MyWebView from 'react-native-webview-autoheight';
import * as Animatable from 'react-native-animatable';
import HTMLView from 'react-native-htmlview';
import { WebView } from 'react-native-webview';
import { observer } from 'mobx-react'
import { log } from 'react-native-reanimated';
import { object } from 'prop-types';

@observer class Overview extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      swipeUp: false,
      reRender: false,
      showFormModal: false,
      showCalculator: false,
      showMessageModal: false,
      name: '',
      email: '',
      phone: '',
      message: '',
      price: '',
      date: '',
      isOffer: false,
      showModalProgress: false,
      //Calculator Objects
      vehiclePrice: 0,
      interestRate: 0,
      period: 0,
      downPayment: 0,

      monthlyInstallment: 0,
      totalInterest: 0,
      amountToPay: 0,
      showCalculatedSection: false,
      //End

      popupMessage: '',
      showMessageProgress: false,
      clicktoViewPhoneNoText: '',
      isAboslute: false,
      showChatModel: false,
      similar_ad: null,
      dealer_ads: [],

      //custom
      ownAds: false,
    }
  }

  openMap = () => {
    let { orderStore } = Store;
    const data = orderStore.adDetail.data;
    const adDetail = data.ad_detail;

    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${adDetail.location.lat},${adDetail.location.long}`;
    const label = 'label';
    const url = Platform.select({
      ios: `${scheme}@${latLng}`,
      android: `${scheme}${latLng}`
    });
    Linking.openURL(url);
  }
  loadMore = async (nextPage) => {
    const profile = orderStore.publicProfile;
    const inventory = orderStore.publicProfile.inventory;
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
  onClickCalculate = () => {
    var vehicle_price;
    var interest_rate;
    var period_month;
    var down_payment;
    vehicle_price = parseFloat(this.state.vehiclePrice);
    interest_rate = parseFloat(this.state.interestRate);
    interest_rate = interest_rate / 1200;

    period_month = parseFloat(this.state.period);
    down_payment = parseFloat(this.state.downPayment);

    var monthly_payment = 0;
    var total_interest_payment = 0;
    var total_amount_to_pay = 0;
    //    var validation_errors = false;
    //      if (!validation_errors) {
    var interest_rate_unused = interest_rate;

    if (interest_rate == 0) {
      interest_rate_unused = 1;
    }

    monthly_payment = (vehicle_price - down_payment) * interest_rate_unused * Math.pow(1 + interest_rate, period_month);
    var monthly_payment_div = ((Math.pow(1 + interest_rate, period_month)) - 1);

    if (monthly_payment_div == 0) {
      monthly_payment_div = 1;
    }

    monthly_payment = monthly_payment / monthly_payment_div;
    monthly_payment = monthly_payment.toFixed(2);

    total_amount_to_pay = down_payment + (monthly_payment * period_month);
    total_amount_to_pay = total_amount_to_pay.toFixed(2);

    total_interest_payment = total_amount_to_pay - vehicle_price;
    total_interest_payment = total_interest_payment.toFixed(2);

    this.setState({ monthlyInstallment: monthly_payment, amountToPay: total_amount_to_pay, totalInterest: total_interest_payment, showCalculatedSection: true });

  }
  onRelatedAdsClick = (item) => {
    this.props.callBackFunc(item);
  }
  onClickReset = () => {
    this.setState({
      vehiclePrice: '',
      interestRate: '',
      period: '',
      downPayment: '',
      monthlyInstallment: '',
      totalInterest: '',
      amountToPay: '',
      showCalculatedSection: false,
    });
  }
  onOfferClick = async () => {
    let { orderStore } = Store;
    let data = orderStore.profile.data;
    this.setState({
      showFormModal: true,
      name: data.display_name.value,
      email: data.user_email,
      phone: data.phone.value,
      message: '',
      isOffer: true,
    });

  }
  onScheduleClick = async () => {
    let { orderStore } = Store;

    this.setState({
      showFormModal: true,
      name: '',
      email: '',
      phone: '',
      message: '',
      isOffer: false,
      showModalProgress: false,
    });

  }

  _onSwipeUp = async () => {
    await this.setState({ swipeUp: true });

    setTimeout(async () => {
      this.setState({ swipeUp: false, reRender: !this.state.reRender });

    }, 1000);
  }
  handleScroll = (event) => {
    // console.log(event.nativeEvent.contentOffset.y);
    if (event.nativeEvent.contentOffset.y > 290)
      this.setState({ isAboslute: true });
    else
      this.setState({ isAboslute: false })
  }
  onSubmitPopupForm = async () => {
    this.setState({ showModalProgress: true });
    var { orderStore } = Store;

    if (this.state.isOffer) {


      var formType = orderStore.adDetail.data.static_text.contact_info.offer.form_type.form_type;
      var adId = orderStore.adDetail.data.static_text.contact_info.offer.form_type.ad_id;
      var param = {
        name: this.state.name, email: this.state.email, phone: this.state.phone, price: this.state.price, message: this.state.message,
        form_type: formType, ad_id: adId,
      };

    }
    else {
      formType = orderStore.adDetail.data.static_text.contact_info.schedule.form_type.form_type;
      adId = orderStore.adDetail.data.static_text.contact_info.schedule.form_type.ad_id;

      param = {
        name: this.state.name, email: this.state.email, phone: this.state.phone, set_time: this.state.date, message: this.state.message,
        form_type: formType, ad_id: adId,
      };
    }
    const response = await Api.post('ad_post/popup/submit', param);
    // console.log("response---", response);
    // console.log("parammm", JSON.stringify(param));
    if (response.success) {



    }
    this.setState({ showModalProgress: false });
    Toast.show(response.message);






    //  const response = await Api.post('',params);
    //  if(response.success === true)
    //  {

    //  }
    // this.setState({showModalProgress:false});

  }

  componentWillReceiveProps(props) {
    let { orderStore } = Store;

    // console.log('prosp is', props)

    // console.log('adDetail is', orderStore.adDetail.fieldsData)

  }
  componentWillMount = async () => {

    let { orderStore } = Store;

    const profile = await Db.getUserProfile();
    if (profile != null && profile.id == orderStore.adDetail.data.profile_detail.id) {
      this.setState({ ownAds: true });
    }

    // console.log('adDetail is',orderStore.adDetail.fieldsData)
    this.setState({ clicktoViewPhoneNoText: orderStore.adDetail.data.static_text.contact_info.phone.text });
    this.getdata()
  }
  getdata = async () => {
    let { orderStore } = Store;
    orderStore.profile = await Api.get('profile');
    let params = { user_id: orderStore.adDetail.data.profile_detail.id, page_number: '' };
    let response = await Api.post('profile/public/inventory', params);

    if (response.success === true) {
      this.setState({ dealer_ads: response.data.ads })
    }
  }

  openURLx = (url) => {
    if (url.includes('https')) {
      Linking.openURL(url)
    } else {
      Linking.openURL('https://' + url)
    }

  }
  sendMessage = async () => {
    let { orderStore } = Store;

    this.setState({ showMessageProgress: true });
    const params = { ad_id: orderStore.adDetail.data.ad_detail.ad_id, message: this.state.popupMessage };

    const response = await Api.post('message/popup', params);
    if (response.success === true) { }
    Toast.show(response.message);
    this.setState({ showMessageProgress: false, showMessageModal: false });
  }

  showChatModal = async (item) => {
    // let { orderStore } = Store;

    // const params = { ad_id: item.ad_id };
    // orderStore.adDetail = await Api.post('ad_post', params);

    item = Object.assign(item, { ad_images: item.images });
    this.setState({ showChatModel: true, similar_ad: item });
  }

  sendChatMessage = async () => {
    this.setState({ showMessageProgress: true });
    const params = { ad_id: this.state.similar_ad.ad_id, message: this.state.popupMessage };

    const response = await Api.post('message/popup', params);
    if (response.success === true) { }
    Toast.show(response.message);
    this.setState({ showMessageProgress: false, showChatModel: false });
  }

  addFav = async (item) => {
    let { orderStore } = Store
    if (orderStore.name != "Guest") {

      const params = { ad_id: item.ad_id };
      let response = await Api.post('ad_post/favourite', params);
      if (response.success === true)
        this.getdata();

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
        this.getdata()
      }

      if (response.message.length != 0)
        Toast.show(response.message);
    }
    else {
      alert('Please login into account')
    }
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

  _onRefresh = async () => {
    let { orderStore } = Store;
    // console.log('this is called')
    this.setState({ refreshing: true });
    var adId = orderStore.adDetail.data.static_text.contact_info.offer.form_type.ad_id;


    const params = { ad_id: adId };
    // console.warn('ad id is',JSON.stringify(params));

    orderStore.adDetail = await Api.post('ad_post', params);
    // console.log('so res is',JSON.stringify(orderStore.adDetail))
    const data = orderStore.adDetail.data;
    const staticText = data.static_text;
    this.setState({ bidsVisible: data.bid_popup.is_show });
    orderStore.setDetailToolbarModel(staticText, data.report_popup.select);
    orderStore.detailToolbarModel.shareText = staticText.share_btn;
    if (orderStore.adDetail.success === true) {
      this.setState({ refreshing: false })
      // console.log('ad detail', JSON.stringify(data))
      let descriptionTitleClone = [...this.state.descriptionTitle];
      let mapTitleClone = [...this.state.mapTitle];

      descriptionTitleClone[0].title = staticText.description_title;
      mapTitleClone[0].title = data.ad_detail.location.title;
      const profile = await Db.getUserProfile();
      if (profile != null) {


        if (profile.id == data.profile_detail.id) {
          orderStore.setAdDetailComponentMounted(true);
        }
        else {
          orderStore.setAdDetailComponentMounted(false);
        }
      }
    }


    // setTimeout(async () => {

    //   this.setState({ refreshing: false, reRender: !this.state.reRender });

    // }, 1000);
  }
  render() {

    let { orderStore } = Store;
    const data = orderStore.adDetail.data;

    const adDetail = data.ad_detail;

    const videoId = adDetail.ad_video.video_id;
    const carFeatures = adDetail.car_features;
    // console.log("ad details are",JSON.stringify(adDetail))
    const contactInfo = data.static_text.contact_info;
    const profileDetail = data.profile_detail;

    //  const financeCalculator = data.static_text.finacne_calc;
    //  const financeFields = financeCalculator.fields;
    let tempRelactedAds = data.related_ads;
    let favouriteAds = []

    if (orderStore.profile.data) {
      favouriteAds = orderStore.profile.data.favourite_add.ads;
      for (let i in favouriteAds) {
        for (let j in tempRelactedAds.ads) {
          if (tempRelactedAds.ads[j].ad_id === favouriteAds[i].ad_id) {
            tempRelactedAds.ads[j].added_fav = true;
          }
        }
      }
    }

    const relatedAds = tempRelactedAds;
    const beforAd = data.banners.before;
    const afterAd = data.banners.after;
    const customStyle = "<style>* {width: 98%;}</style>";
    const popup = data.message_popup;
    let contactInfoForm = {};
    if (this.state.isOffer) {
      contactInfoForm = contactInfo.offer.popup;
    }
    if (!this.state.isOffer) {
      contactInfoForm = contactInfo.schedule.popup;
    }
    const contactInfoFormFields = contactInfoForm.fields;

    return (
      <View style={{
        height: '100%',
        backgroundColor: 'white',
        paddingBottom: 5,
      }}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.showMessageModal}
          onRequestClose={() => {
          }}>

          <View style={styles.modalContainer}>

            <View style={styles.modalContentContainer}>
              <ScrollView
                keyboardShouldPersistTaps='always'
              >

                <View style={styles.modalFormContainer}>


                  <TextInput
                    placeholder={popup.input_textarea}
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
                            this.setState({ showMessageModal: false });
                          }}
                          style={[styles.messageMoalButton, { borderColor: Appearences.Colors.grey, borderWidth: 1 }]}>
                          <Text style={styles.buttonTextBlack}>{popup.btn_cancel}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            this.sendMessage();
                          }}
                          style={[styles.messageMoalButton, { backgroundColor: orderStore.color }]}>
                          <Text style={styles.buttonTextWhite}>{popup.btn_send}</Text>
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
          visible={this.state.showFormModal}
          onRequestClose={() => {
          }}>

          <View style={styles.modalContainer}>

            <View style={styles.modalContentContainer}>
              <ScrollView
                keyboardShouldPersistTaps='always'
              >
                <View style={styles.modalHeaderContainer}>
                  <Text style={styles.modalHeaderText}>{contactInfoForm.title}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ showFormModal: false });
                    }}
                  >
                    <Image
                      style={styles.modalHeadingImage}
                      source={require('../../../../../../../res/images/cross_white.png')}
                    />
                  </TouchableOpacity>
                </View>


                <View style={{ marginTop: 5, }}>

                  <Text style={styles.modalHeadingText}>

                    {contactInfoFormFields[0].field_name}

                  </Text>

                  <TextInput
                    placeholder={''}
                    underlineColorAndroid="transparent"
                    textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                    onChangeText={(text) => {
                      this.setState({ name: text });
                    }}
                    style={styles.modalTextInput}>

                  </TextInput>

                  <Text style={styles.modalHeadingText}>

                    {contactInfoFormFields[1].field_name}

                  </Text>

                  <TextInput
                    placeholder={''}
                    underlineColorAndroid="transparent"
                    textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                    onChangeText={(text) => {
                      this.setState({ email: text });
                    }}
                    style={styles.modalTextInput}>

                  </TextInput>

                  <Text style={styles.modalHeadingText}>

                    {contactInfoFormFields[2].field_name}

                  </Text>

                  <TextInput
                    placeholder={''}
                    underlineColorAndroid="transparent"
                    keyboardType='phone-pad'
                    textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                    onChangeText={(text) => {
                      this.setState({ phone: text });
                    }}
                    style={styles.modalTextInput}>

                  </TextInput>

                  <Text style={styles.modalHeadingText}>

                    {contactInfoFormFields[3].field_name}

                  </Text>

                  {this.state.isOffer ?
                    <TextInput
                      placeholder={''}
                      underlineColorAndroid="transparent"
                      textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                      keyboardType="numeric"
                      returnKeyType="done"

                      onChangeText={(text) => {
                        this.setState({ price: text });
                      }}
                      style={styles.modalTextInput}>

                    </TextInput>
                    :
                    <DatePicker
                      style={[styles.modalTextInput, { justifyContent: 'center' }]}
                      date={this.state.date}
                      mode="date"
                      placeholder="select date"
                      format="YYYY-MM-DD"
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      customStyles={{ dateInput: { borderWidth: 0 } }}
                      onDateChange={(date) => {
                        this.setState({ date: date });
                      }}
                    />
                  }


                  <Text style={styles.modalHeadingText}>

                    {contactInfoFormFields[4].field_name}

                  </Text>

                  <TextInput
                    placeholder={''}
                    multiline={true}
                    underlineColorAndroid="transparent"
                    textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                    style={styles.modalTextInputMultiLine}
                    onChangeText={(text) => {
                      this.setState({ message: text });
                    }}
                  >

                  </TextInput>

                  {

                    this.state.showModalProgress ?
                      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 5 }}>
                        <Progress.Circle
                          size={Appearences.Fonts.headingFontSize}
                          indeterminate={true}
                          color={orderStore.color}
                        />
                      </View>
                      :
                      <TouchableOpacity
                        onPress={() => {
                          this.onSubmitPopupForm();
                        }}
                        style={[styles.modalButtonRow, { backgroundColor: orderStore.color }]}>
                        <Text style={styles.buttonTextWhite}>
                          {contactInfoForm.btn_submit}
                        </Text>
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
                      source={require('../../../../../../../res/images/contact.png')}
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
                    placeholder={popup.input_textarea}
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
                          <Text style={styles.buttonTextBlack}>{popup.btn_cancel}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            this.sendChatMessage();
                          }}
                          style={[styles.messageMoalButton, { backgroundColor: orderStore.color }]}>
                          <Text style={styles.buttonTextWhite}>{popup.btn_send}</Text>
                        </TouchableOpacity>

                      </TouchableOpacity>

                  }


                </View>



              </ScrollView>
            </View>
          </View>

        </Modal>

        <ScrollView
          key={this.state.reRender}
          contentContainerStyle={{ backgroundColor: Appearences.Colors.appBackgroundColor }}
          onScroll={this.handleScroll}
          keyboardShouldPersistTaps='always'


          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
        >
          <AdDetailHeader />

          {this.state.ownAds ?
            <View style={[styles.panel, { marginTop: 0, flexDirection: "row" }]}>
              <TouchableOpacity
                onPress={async () => {
                  const params = { ad_id: adDetail.ad_id, custom_type: "bump" };
                  let response = await Api.post('ad_post/featured', params);
                  console.log(response);
                }}
                style={[styles.buttonRow, { backgroundColor: orderStore.color, flex: 1, marginRight: 10 }]}>
                <Text style={styles.headingTextWhite}>Bump It Up</Text>
              </TouchableOpacity>
              {adDetail.is_feature ? <View style={{ flex: 1 }}></View> :
                <TouchableOpacity
                  onPress={async () => {
                    const params = { ad_id: adDetail.ad_id, custom_type: "feature" };
                    let response = await Api.post('ad_post/featured', params);
                    if (response.success)
                      this._onRefresh();
                  }}
                  style={[styles.buttonRow, { backgroundColor: orderStore.color, flex: 1 }]}>
                  <Text style={styles.headingTextWhite}>Featured Ads Make</Text>
                </TouchableOpacity>
              }

            </View>
            :
            <></>
          }


          <View
            style={s.triangleRowcontainer}>
            <View
              style={s.carInfoRow}>
              <View style={{ width: '60%' }}>
                <Text style={[s.carInfoRowLeftTitle, { color: orderStore.color }]}>{adDetail.ad_cat}</Text>
                <Text style={s.carInfoRowLeftDetail}>{adDetail.ad_title}</Text>
                <View style={s.row}>
                  <Text style={s.carInfoRowLeftDate}>{Appearences.Rtl.enabled ? "   |   " + adDetail.ad_date : adDetail.ad_date + "   |   "}</Text>
                  <Image style={s.eyeImage}
                    source={require('../../../../../../../res/images/eye.png')} />
                  <Text style={s.carInfoRowLeftDate}>{Appearences.Rtl.enabled ? adDetail.ad_view_count + "  " : "  " + adDetail.ad_view_count}</Text>
                </View>
              </View>
              <View style={s.carInfoRowRightContainer}>
                {adDetail.ad_price.price.length != undefined && adDetail.ad_price.price.length != 0 ? <View style={[s.triangle, { borderEndColor: orderStore.color }]} /> : null}
                {adDetail.ad_price.price.length != undefined && adDetail.ad_price.price.length != 0 ?
                  <View style={[s.carInfoRowRightTextContainer, { backgroundColor: orderStore.color }]}>
                    <Text style={s.carInfoRowRightContainerPrice}>
                      {adDetail.ad_price.price}
                    </Text>
                  </View> : null}
              </View>
            </View>
          </View>

          <View
            style={[styles.panel, { marginTop: 0 }]}
          >
            {contactInfo.phone.is_show ?
              <TouchableOpacity
                onPress={async () => {

                  let phoneNumber = '';
                  await this.setState({ clicktoViewPhoneNoText: contactInfo.phone.number })

                  if (Platform.OS === 'android') {
                    phoneNumber = 'tel:' + contactInfo.phone.number;
                  }
                  else {
                    phoneNumber = 'telprompt:' + contactInfo.phone.number;
                  }

                  Linking.openURL(phoneNumber);

                }}
                style={[styles.buttonRow, { backgroundColor: orderStore.color }]}>
                <Text style={styles.headingTextWhite}>{this.state.clicktoViewPhoneNoText}</Text>
              </TouchableOpacity>
              : null}

            {/* {financeCalculator.is_show ?
              <TouchableOpacity 
              onPress = { ()=>{

                this.setState({showCalculator:true});

              }}
              style = {[styles.buttonRow,{backgroundColor:orderStore.color}]}>
              <Text style = {styles.headingTextWhite}>{financeCalculator.title}</Text>
              </TouchableOpacity>
              :null} */}


            <View style={styles.functionsRowContainer}>
              {contactInfo.phone.is_show ?
                <TouchableOpacity
                  onPress={async () => {

                    let phoneNumber = '';
                    await this.setState({ clicktoViewPhoneNoText: contactInfo.phone.number })

                    if (Platform.OS === 'android') {
                      phoneNumber = 'tel:' + contactInfo.phone.number;
                    }
                    else {
                      phoneNumber = 'telprompt:' + contactInfo.phone.number;
                    }

                    Linking.openURL(phoneNumber);

                  }}
                  style={[styles.functionContainer, { borderBottomWidth: 2, borderBottomColor: 'green', marginRight: 5 }]}>
                  <Image
                    style={styles.functionImageAppColor}
                    source={require('../../../../../../../res/images/contact.png')}
                  />
                  <Text style={styles.paragraphTextGrey}>Call</Text>
                </TouchableOpacity>
                : null}
              {contactInfo.message.is_show ?
                <TouchableOpacity
                  onPress={() => this.showChatModal(adDetail)}
                  style={[styles.functionContainer, { borderBottomWidth: 2, borderBottomColor: 'blue' }]}>
                  <Image
                    style={styles.functionImageAppColor}
                    source={require('../../../../../../../res/images/message.png')}
                  />
                  <Text style={styles.paragraphTextGrey}>Chat</Text>
                </TouchableOpacity>
                : null}
              {contactInfo.offer.is_show ?
                <TouchableOpacity
                  onPress={() => {
                    this.onOfferClick();
                  }}
                  style={styles.functionContainer}>
                  <Image
                    style={styles.functionImageAppColor}
                    source={require('../../../../../../../res/images/pay.png')}
                  />
                  <Text style={styles.paragraphTextGrey}>{contactInfo.offer.text}</Text>
                </TouchableOpacity>
                : null}

              {contactInfo.schedule.is_show ?
                <TouchableOpacity
                  onPress={() => { this.onScheduleClick() }}
                  style={styles.functionContainer}>
                  <Image
                    style={styles.functionImageAppColor}
                    source={require('../../../../../../../res/images/steer.png')}
                  />
                  <Text style={[styles.paragraphTextGrey]}>{contactInfo.schedule.text}</Text>
                </TouchableOpacity>
                : null}
            </View>

          </View>

          {
            adDetail.fuel_economy_is_show ?
              <View style={styles.panelContainer}>
                <View style={styles.panelLeftContainer}>
                  <Text style={styles.panelNumericText}>{adDetail.fuel_economy.city}</Text>
                  <Text style={styles.textAppColorNoPadding}>{adDetail.fuel_economy.city_text}</Text>
                </View>
                <View style={[styles.panelSeperator, { backgroundColor: orderStore.appColor }]} />
                <View style={styles.panelMiddleContainer}>
                  <Text style={styles.fuelEconomyText}>{adDetail.fuel_economy.title}</Text>
                  <Image style={styles.meterImage}
                    source={require("../../../../../../../res/images/car_meter.png")}
                  />

                </View>
                <View style={[styles.panelSeperator, { backgroundColor: orderStore.appColor }]} />
                <View style={styles.panelRightContainer}>
                  <Text style={styles.panelNumericText}>{adDetail.fuel_economy.highway}</Text>
                  <Text style={styles.textAppColorNoPadding}>{adDetail.fuel_economy.highway_text}</Text>
                </View>
                <View style={styles.panelAbsoluteContainer}>
                  <View style={[styles.circle, { backgroundColor: orderStore.color, marginStart: 3 }]}>
                    <Image style={styles.circleImage}
                      source={require("../../../../../../../res/images/traffic_ligh.png")}
                    />
                  </View>
                  <View style={[styles.circle, { backgroundColor: orderStore.color, marginEnd: 3 }]}>
                    <Image style={styles.circleImage}
                      source={require("../../../../../../../res/images/highway.png")}
                    />
                  </View>
                </View>
              </View>


              : null
          }
          <View style={styles.panel}>

            <Text style={styles.subHeadingText}>{adDetail.fieldsData_feature_txt}</Text>
            {/* ///////////herer////////// */}

            <View style={styles.overViewRowContainer}>
              {
                adDetail.fieldsData.map((item, index) => {

                  return (

                    <View
                      key={index}
                      style={
                        index + 1 === adDetail.fieldsData.length ?
                          styles.overviewContentRownContainerNoBorder :
                          styles.overviewContentRownContainer
                      }>
                      <Text style={[styles.textGreyNoPadding, { paddingTop: 10, paddingBottom: 3, alignSelf: 'flex-start' }]}>{item.key}</Text>
                      {
                        item.value.includes('https://') || item.value.includes('www') ? [
                          <TouchableOpacity onPress={() => { this.openURLx(item.value) }}>
                            <Text style={[styles.textBlackWithNoSidePadding, { paddingTop: 0, paddingBottom: 0, alignSelf: 'flex-start' }]}>{item.value}</Text>

                          </TouchableOpacity>
                        ] : [
                            <Text style={[styles.textBlackWithNoSidePadding, { paddingTop: 0, paddingBottom: 0, alignSelf: 'flex-start' }]}>{item.value}</Text>
                          ]
                      }
                    </View>
                  );


                }

                )



              }

            </View>
            <View style={styles.seperator} />
            <View style={{ marginTop: 10, }} />
            <Text style={[styles.subHeadingText, { marginStart: 15, marginEnd: 15 }]}>{adDetail.fieldsData_location.key}</Text>
            <View style={styles.marginTop} />
            <Text style={[styles.headingTextBlack, { marginStart: 15, marginEnd: 15, }]}>{adDetail.fieldsData_location.value}</Text>

          </View>
          {/*Description Portion Start*/}


          {

            beforAd.length != 0 ?
              <View style={[styles.panel, { alignItems: 'center' }]}>




                {/* <WebView
                  source={{ html: customStyle + beforAd }}
                  startInLoadingState={true} /> */}
              </View>
              : null

          }

          <View
            style={styles.panel}>
            <Text style={styles.subHeadingText}>{data.static_text.description_title}</Text>
            <View style={styles.marginTop} />

            <HTML
              imagesMaxWidth={Dimensions.get('window').width}
              html={orderStore.adDetail.data.ad_detail.ad_desc}
              baseFontStyle={{ fontSize: Appearences.Fonts.headingFontSize, color: Appearences.Colors.black }}
            />


          </View>



          {

            afterAd.length != 0 ?
              <View style={[styles.panel, { alignItems: 'center', padding: 0 }]}>
                {/* <WebView
                  source={{ html: customStyle + afterAd }}
                  startInLoadingState={true} /> */}
              </View>
              : null
          }




          {/* Features  Start */}



          <View style={styles.panel}>
            <View
            >
              <Text style={styles.subHeadingText}>{adDetail.car_features_title}</Text>

              <View style={styles.marginTop} />
              <View style={styles.sidePadding}>
                <View
                  style={styles.featureSectionConatiner}
                >
                  {
                    carFeatures.map((item, index) => {
                      return (

                        <View
                          key={index + ''}
                          style={styles.faturedRowContainer}>

                          <View style={styles.featureSection}>
                            <Image style={styles.featureItemImage}
                              source={require('../../../../../../../res/images/tick.png')}
                            />
                            <Text style={styles.featureItemText}>
                              {item}
                            </Text>
                          </View>

                        </View>


                      );

                    })
                  }
                </View>


              </View>


            </View>

          </View>





          {/*Featues End*/}

          {/* Video Container Start */}
          {videoId.length === 0 ? null :
            <View style={styles.panel}>
              <Text style={styles.subHeadingText}>
                {data.section_title.video_title}</Text>
              <View style={[styles.videoContentContainer, { height: 180 }]}>
                {/* <WebView
                  useWebKit={false}
                  source={{ uri: 'https://www.youtube.com/embed/' + videoId + '?rel=0&autoplay=0&showinfo=0&controls=0' }}
                  style={styles.videoContent}
                  javaScriptEnabled={true}
                /> */}
              </View>
            </View>}
          {/* Vide Container End */}
          {/* Profile Row Start */}
          <View style={styles.panel}>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('DealerTabManager', { dealerId: profileDetail.id });
              }}
              style={styles.profileContainer}>
              <View style={styles.profileLeftContainer}>

                <View>
                  <Avatar
                    size='large'
                    rounded
                    source={{ uri: profileDetail.image }}
                    activeOpacity={0.7}
                  />
                </View>

                <View style={{ marginStart: 10, justifyContent: 'center' }}>
                  <Text style={[styles.headingTextBlack, { fontWeight: Appearences.Fonts.headingFontWieght }]}>{profileDetail.name}</Text>
                  <Text style={styles.paragraphTextGrey}>{profileDetail.last_login}</Text>
                  {
                    profileDetail.rating.is_show ?
                      <StarRating
                        disabled={true}
                        maxStars={5}
                        rating={parseInt(profileDetail.rating.number)}
                        starSize={12}
                        containerStyle={{ width: 15, marginTop: 5 }}
                        fullStarColor='#D4AF37'
                      /> : null
                  }

                </View>

              </View>
              <View style={styles.profileRightContainer}>
                {
                  orderStore.isDealer &&
                  <View

                    style={[styles.profileButtonContainer, { backgroundColor: 'green', marginBottom: 10 }]}>
                    <Text style={styles.paragraphTextWhite}>
                      Verified Dealer
                  </Text>
                  </View>

                }
                <View

                  style={[styles.profileButtonContainer, { backgroundColor: orderStore.color }]}>
                  <Text style={styles.paragraphTextWhite}>
                    {profileDetail.btn_text}
                  </Text>
                </View>


              </View>
            </TouchableOpacity>


          </View>
          {/* Profile Row End */}



          {/* dealer inventory */}

          <View style={{ paddingStart: 15, paddingEnd: 15, marginTop: 5 }}>
            <Text style={styles.subHeadingText}>Dealer Inventory</Text>
            <View style={styles.topMargin}>


              <FlatList
                data={this.state.dealer_ads}
                horizontal={true}
                showsHorizontalScrollIndicator={false}

                renderItem={({ item, index }) =>


                  <TouchableOpacity
                    key={index}
                    style={index != 0 ? FeaturedGridStyle.container : [FeaturedGridStyle.container, { marginHorizontal: 0 }]}
                    onPress={() => this.onRelatedAdsClick(item)}
                  >

                    <View style={FeaturedGridStyle.imageContainer}>

                      <Image
                        style={FeaturedGridStyle.image}
                        source={{ uri: item.ad_images[0].thumb }} />
                      <View
                        style={FeaturedGridStyle.imageContainerOverlay}>
                        <View style={FeaturedGridStyle.topRowContainer}>

                        </View>
                        <View style={FeaturedGridStyle.bottomRowContainer}>
                          {item.ad_price.price.length != 0 ?
                            <View style={[FeaturedGridStyle.bottomLeftContent, { backgroundColor: orderStore.color }]}>
                              <Text style={styles.buttonTextStyle}>{item.ad_price.price + ' (' + item.ad_price.price_type + ')'}</Text>
                            </View>
                            : null}

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
                              source={require('../../../../../../../res/images/heart_filled.png')}
                              style={[FeaturedGridStyle.bottomImgStyl, { marginHorizontal: 5 }]}
                            />
                          </TouchableOpacity>
                        }
                        {
                          !item.added_fav &&
                          <TouchableOpacity onPress={() => this.addFav(item)}>
                            <Image
                              source={require('../../../../../../../res/images/heart.png')}
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
                          source={require('../../../../../../../res/images/calender_grey.png')}
                          style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                        />
                        <Text
                          style={PopularCarsStyle.modelTextStyle}>
                          {item.ad_date}
                        </Text>
                      </View>
                      <View numberOfLines={1} style={[PopularCarsStyle.textContainer1, { flexDirection: 'row', }]}>
                        <Image
                          source={require('../../../../../../../res/images/location.png')}
                          style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                        />
                        <Text
                          style={PopularCarsStyle.modelTextStyle}>
                          {item.ad_location.address}
                        </Text>


                      </View>
                    </View>
                  </TouchableOpacity>



                }
                keyExtractor={item => item.ad_id + ''}
              >
              </FlatList>
            </View>
          </View>

          {/* Map Row Start */}
          <View style={styles.panel}>
            <Text style={styles.subHeadingText}>
              {data.section_title.map_title}
            </Text>
            <View style={[styles.videoContentContainer, { marginTop: 10, }]}>
              <MapView
                region={{
                  latitude: Number(adDetail.location.lat, 10),
                  longitude: Number(adDetail.location.long, 10),
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                style={styles.videoContent}
              >

                <Marker
                  title={adDetail.location.title}
                  coordinate={{
                    latitude: Number(adDetail.location.lat, 10),
                    longitude: Number(adDetail.location.long, 10)
                  }} />
              </MapView>

            </View>
          </View>

          {/* Map Row End */}


          {/*}Similar Ads Section Start--->{*/}
          {
            relatedAds.is_show ?
              <View style={{ paddingStart: 15, paddingEnd: 15, marginTop: 5 }}>
                <Text style={styles.subHeadingText}>{relatedAds.title}</Text>
                <View style={styles.topMargin}>

                  {/*}Related Ads Horizontal--->{*/}
                  {relatedAds.type != 'list' ?
                    <FlatList
                      data={relatedAds.ads}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}

                      renderItem={({ item, index }) =>


                        <TouchableOpacity
                          key={index}
                          style={index != 0 ? FeaturedGridStyle.container : [FeaturedGridStyle.container, { marginHorizontal: 0 }]}
                          onPress={() => this.onRelatedAdsClick(item)}
                        >

                          <View style={FeaturedGridStyle.imageContainer}>

                            <Image
                              style={FeaturedGridStyle.image}
                              source={{ uri: item.ad_images[0].thumb }} />
                            <View
                              style={FeaturedGridStyle.imageContainerOverlay}>
                              <View style={FeaturedGridStyle.topRowContainer}>

                              </View>
                              <View style={FeaturedGridStyle.bottomRowContainer}>
                                {item.ad_price.price.length != 0 ?
                                  <View style={[FeaturedGridStyle.bottomLeftContent, { backgroundColor: orderStore.color }]}>
                                    <Text style={styles.buttonTextStyle}>{item.ad_price.price + ' (' + item.ad_price.price_type + ')'}</Text>
                                  </View>
                                  : null}

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
                                    source={require('../../../../../../../res/images/heart_filled.png')}
                                    style={[FeaturedGridStyle.bottomImgStyl, { marginHorizontal: 5 }]}
                                  />
                                </TouchableOpacity>
                              }
                              {
                                !item.added_fav &&
                                <TouchableOpacity onPress={() => this.addFav()}>
                                  <Image
                                    source={require('../../../../../../../res/images/heart.png')}
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
                                source={require('../../../../../../../res/images/calender_grey.png')}
                                style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                              />
                              <Text
                                style={PopularCarsStyle.modelTextStyle}>
                                {item.ad_date}
                              </Text>
                            </View>
                            <View numberOfLines={1} style={[PopularCarsStyle.textContainer1, { flexDirection: 'row', }]}>
                              <Image
                                source={require('../../../../../../../res/images/location.png')}
                                style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                              />
                              <Text
                                style={PopularCarsStyle.modelTextStyle}>
                                {item.ad_location.address}
                              </Text>


                            </View>
                          </View>
                        </TouchableOpacity>



                      }
                      keyExtractor={item => item.ad_id + ''}
                    >
                    </FlatList>




                    : <FlatList
                      data={relatedAds.ads}
                      horizontal={false}
                      showsVerticalScrollIndicator={false}

                      renderItem={({ item, index }) =>
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            this.onRelatedAdsClick(item);
                          }}
                          style={PopularCarsStyle.container}>
                          <View style={{ flexDirection: 'row' }}>
                            <View style={PopularCarsStyle.imageContainer}>
                              <Image
                                style={PopularCarsStyle.image}
                                source={{ uri: item.ad_images[0].thumb }} />
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
                                      source={require('../../../../../../../res/images/heart_filled.png')}
                                      style={[FeaturedGridStyle.bottomImgStyl, { marginHorizontal: 5 }]}
                                    />
                                  </TouchableOpacity>
                                }
                                {
                                  !item.added_fav &&
                                  <TouchableOpacity onPress={() => this.addFav()}>
                                    <Image
                                      source={require('../../../../../../../res/images/heart.png')}
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
                                  source={require('../../../../../../../res/images/calender_grey.png')}
                                  style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                                />
                                <Text
                                  style={PopularCarsStyle.modelTextStyle}>
                                  {item.ad_date}
                                </Text>
                              </View>
                              <View numberOfLines={1} style={[PopularCarsStyle.textContainer1, { flexDirection: 'row', }]}>
                                <Image
                                  source={require('../../../../../../../res/images/location.png')}
                                  style={[FeaturedGridStyle.bottomImgStyl1, { marginHorizontal: 5 }]}
                                />
                                <Text
                                  style={PopularCarsStyle.modelTextStyle}>
                                  {item.ad_location.address}
                                </Text>


                              </View>
                            </View>

                          </View>
                          <View style={FeaturedGridStyle.featureAdsBottom}>
                            <TouchableOpacity
                              style={[FeaturedGridStyle.featureAdsBtn, { borderBottomWidth: 2, borderBottomColor: 'blue' }]}
                              onPress={() => this.showChatModal(item)}>
                              <Image
                                source={require('../../../../../../../res/images/message_grey.png')}
                                style={[FeaturedGridStyle.bottomImgStyl]}
                              />
                              <Text style={FeaturedGridStyle.featureAdsBtntxt}>Chat</Text>

                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[FeaturedGridStyle.featureAdsBtn, { borderBottomWidth: 2, borderBottomColor: 'green' }]}
                              onPress={() => this.onCallClick(item.ad_id)}>
                              <Image
                                source={require('../../../../../../../res/images/contact.png')}
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

                  }
                </View>

                {/*}Related Ads End--->{*/}
              </View> : null
          }
          {/*}Similar Ads Section End--->{*/}
          <View style={{ width: '100%', height: 'auto' }}>
            {/* <WebView
              useWebKit={false}
              source={{ uri: 'https://www.youtube.com/embed/' + videoId + '?rel=0&autoplay=0&showinfo=0&controls=0' }}
              style={styles.videoContent}
              javaScriptEnabled={true}
            /> */}
          </View>


        </ScrollView>









        {/* Absolute view start */}
        {this.state.isAboslute ?

          <Animatable.View
            animation={this.state.isAboslute ? "fadeInDown" : "fadeOut"} iterationCount={1} direction="normal"
            style={s.triangleRowcontainerAbsolute}>

            {/* <View
              style={s.carInfoRow}>
              <View style={{ width: '60%' }}>
                <Text style={s.carInfoRowLeftDetail}>{adDetail.ad_title}</Text>
                <View style={s.row}>
                  <Text style={s.carInfoRowLeftDate}>{Appearences.Rtl.enabled ? "   |   " + adDetail.ad_date : adDetail.ad_date + "   |   "}</Text>
                  <Image style={s.eyeImage}
                    source={require('../../../../../../../res/images/eye.png')} />
                  <Text style={s.carInfoRowLeftDate}>{Appearences.Rtl.enabled ? adDetail.ad_view_count + "  " : "  " + adDetail.ad_view_count}</Text>
                </View>
              </View>
              <View style={s.carInfoRowRightContainer}>
                {adDetail.ad_price.price.length != undefined && adDetail.ad_price.price.length != 0 ? <View style={[s.triangle, { borderEndColor: orderStore.color }]} /> : null}
                {adDetail.ad_price.price.length != undefined && adDetail.ad_price.price.length != 0 ?
                  <View style={[s.carInfoRowRightTextContainer, { backgroundColor: orderStore.color }]}>
                    <Text style={s.carInfoRowRightContainerPrice}>
                      {adDetail.ad_price.price}
                    </Text>
                  </View> : null}
              </View>
            </View> */}
            <View
              style={[styles.panel, { marginTop: 0 }]}
            >

              {/* {financeCalculator.is_show ?
              <TouchableOpacity 
              onPress = { ()=>{

                this.setState({showCalculator:true});

              }}
              style = {[styles.buttonRow,{backgroundColor:orderStore.color}]}>
              <Text style = {styles.headingTextWhite}>{financeCalculator.title}</Text>
              </TouchableOpacity>
              :null} */}


              <View style={[styles.functionsRowContainer, { marginTop: 0 }]}>
                {contactInfo.phone.is_show ?
                  <TouchableOpacity
                    onPress={async () => {

                      let phoneNumber = '';
                      await this.setState({ clicktoViewPhoneNoText: contactInfo.phone.number })

                      if (Platform.OS === 'android') {
                        phoneNumber = 'tel:' + contactInfo.phone.number;
                      }
                      else {
                        phoneNumber = 'telprompt:' + contactInfo.phone.number;
                      }

                      Linking.openURL(phoneNumber);

                    }}
                    style={[styles.functionContainer, {}]}>
                    <Image
                      style={styles.functionImageAppColor}
                      source={require('../../../../../../../res/images/contact.png')}
                    />
                    <Text style={styles.paragraphTextGrey}>Call</Text>
                  </TouchableOpacity>
                  : null}
                {contactInfo.message.is_show ?
                  <TouchableOpacity
                    onPress={() => this.showChatModal(adDetail)}
                    style={[styles.functionContainer, {}]}>
                    <Image
                      style={styles.functionImageAppColor}
                      source={require('../../../../../../../res/images/message.png')}
                    />
                    <Text style={styles.paragraphTextGrey}>Chat</Text>
                  </TouchableOpacity>
                  : null}
                {contactInfo.offer.is_show ?
                  <TouchableOpacity
                    onPress={() => {
                      this.onOfferClick();
                    }}
                    style={styles.functionContainer}>
                    <Image
                      style={styles.functionImageAppColor}
                      source={require('../../../../../../../res/images/pay.png')}
                    />
                    <Text style={styles.paragraphTextGrey}>{contactInfo.offer.text}</Text>
                  </TouchableOpacity>
                  : null}

                {contactInfo.schedule.is_show ?
                  <TouchableOpacity
                    onPress={() => { this.onScheduleClick() }}
                    style={styles.functionContainer}>
                    <Image
                      style={styles.functionImageAppColor}
                      source={require('../../../../../../../res/images/steer.png')}
                    />
                    <Text style={[styles.paragraphTextGrey]}>{contactInfo.schedule.text}</Text>
                  </TouchableOpacity>
                  : null}
              </View>

            </View>


          </Animatable.View>

          : null


        }


        {/* Absolute view end */}










      </View>);
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
const s = StyleSheet.create({
  showingOutOfRow: {
    paddingStart: localProps.sidePadding,
    paddingEnd: localProps.sidePadding,
    height: 35,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  container: {
    height: 200,
    width: '100%',
    flexDirection: 'row',
    marginTop: localProps.topMargin,
  },

  left: {
    width: '10%',
    height: '100%',
  },
  middle: {
    width: '80%',
    height: '100%',
  },

  right: {
    width: '10%',
    height: '100%',
  },
  headerImageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  leftSideAbsoluteContainer: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  middleSectionAbsoluteContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexDirection: 'row',
    position: 'absolute',
    paddingEnd: 10,
    paddingStart: 10,
    paddingBottom: 10,

  },

  rightSideAbsoluteContainer: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  arrowContainer: {

    width: localProps.sliderArrowContainerWidth,
    height: localProps.sliderArrowContainerHeight,
    alignItems: 'center',
    justifyContent: 'center',

  },

  topSliderArrow: {
    width: localProps.topSliderArrowDimens,
    height: localProps.topSliderArrowDimens,
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],

  },


  topSliderMiddleGalleryImage: {
    width: Appearences.Fonts.paragraphFontSize + 5,
    height: Appearences.Fonts.paragraphFontSize + 5,
    marginStart: 10,
  },
  topSliderMiddleGalleryImageText: {
    fontSize: Appearences.Fonts.paragraphFontSize,
    color: 'white',
    marginStart: 5,
  },
  topSliderMiddleRighTextContainer: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
    paddingBottom: 3,
    paddingStart: 5,
    paddingEnd: 5,
  },
  topSliderMiddleRightText: {

    color: 'white',
    fontSize: Appearences.Fonts.paragraphFontSize - 1,
  },
  sliderRow: {
    flexDirection: 'row',
  },
  showingOutOfRowImageStyle: {
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],

    width: 10,
    height: 10,
  },
  showingOutOfRowText: {
    fontFamily: Appearences.Fonts.headingFont,
    fontSize: Appearences.Fonts.headingFontSize,
    color: Appearences.Colors.black,
  },
  showingOutOfRowImageStyle: {
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],

    width: 10,
    height: 10,
  },
  carInfoRow: {

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: localProps.topMargin,
  },
  row: {
    flexDirection: 'row',
  },
  carInfoRowLeftTitle: {
    fontSize: Appearences.Fonts.headingFontSize,
    marginTop: localProps.topMargin,
    fontWeight: Appearences.Fonts.headingFontWieght,
    alignSelf: 'flex-start',
  },
  carInfoRowLeftDetail: {
    fontSize: Appearences.Fonts.mainHeadingFontSize,
    color: Appearences.Colors.black,
    marginTop: localProps.topMargin,
    fontWeight: Appearences.Fonts.headingFontWieght,
    alignSelf: 'flex-start',
  },
  carInfoRowLeftDate: {
    fontSize: Appearences.Fonts.headingFontSize,
    color: Appearences.Colors.grey,
    marginTop: localProps.topMargin,
    marginBottom: localProps.topMargin,

  },
  carInfoRowRightContainer: {
    flexDirection: 'row',
    alignItems: 'center'

  },
  triangle: {
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderTopWidth: Appearences.Fonts.trianagleHeight,
    borderEndWidth: 12,
    borderBottomWidth: Appearences.Fonts.trianagleHeight,
    borderBottomColor: 'transparent'
  },
  carInfoRowRightTextContainer: {
    height: Appearences.Fonts.trianagleHeight * 2,
    //paddingBottom:Appearences.Fonts.headingFontSize,
    paddingStart: 10,
    paddingEnd: 10,
    justifyContent: 'center',

  },
  carInfoRowRightContainerPrice: {
    color: 'white',
    fontSize: Appearences.Fonts.headingFontSize,
    fontFamily: Appearences.Fonts.headingFont,
  },
  triangleRowcontainer: {
    paddingStart: 15,
    paddingEnd: 15,
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
  },
  triangleRowcontainerAbsolute: {
    position: 'absolute',
    backgroundColor: 'white',
    flex: 1,
    paddingStart: 10,
    paddingEnd: 10,
    width: '100%',
    elevation: 5,
    shadowOpacity: 0.5,
    // paddingBottom: 5,
  },
  imageViewHeaderContainer: {
    alignSelf: 'flex-end',
    padding: 15,
    marginTop: 5,

  },
  imageViewClose: {
    width: 15,
    height: 15,

  },
  eyeImage: {
    width: 15,
    height: 15,
    alignSelf: 'center',
    tintColor: Appearences.Colors.grey,
  },
});
export default withNavigation(Overview)





