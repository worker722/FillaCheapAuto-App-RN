import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';

import Appearences from '../config/Appearences'
import I18nManager from 'react-native';
import Visbility from './Visibility';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Store from '../Stores';
import ImageViewer from 'react-native-image-zoom-viewer';
import * as Animatable from 'react-native-animatable';

let fullImages = [];
let { orderStore } = Store;

export default class ProfileHeader extends Component<Props> {

  componentWillMount = () => {
    const data = orderStore.adDetail.data;
    //if(fullImages.length === 0 )
    fullImages = [];
    data.ad_detail.images.map((item, index) => {

      let imagesSource = {

        url: item.full,


      }
      fullImages.push(imagesSource);


    });
  }




  constructor(props) {
    super(props);

    this.state = {
      showSpinner: true,
      currentItem: 1,
      currentImage: 0,
      isImageViewVisle: false,
      sliderImageCurrentIndex: 0,
      activeSlide: 0
    }

  }

  _snapToItem = (item) => {
    this.setState({ currentItem: item + 1, sliderImageCurrentIndex: item, activeSlide: item });

  }

  onImageClick = async (index) => {
    this.setState({ currentImage: index, isImageViewVisle: true })
  }
  get pagination() {
    const { entries, activeSlide } = this.state;
    let { orderStore } = Store;
    const data = orderStore.adDetail.data;
    const adDetail = data.ad_detail;
    const sliderImages = adDetail.images;
    return (
      <Pagination
        dotsLength={sliderImages.length}
        activeDotIndex={activeSlide}
        containerStyle={{ position: 'absolute', bottom: 0, alignSelf: 'center' }}
        dotStyle={{
          width: 10,
          height: 10,

          borderRadius: 5,
          // marginHorizontal: 8,
          backgroundColor: 'rgba(255,255,255,1)'
        }}
        inactiveDotStyle={{
          // Define styles for inactive dots here
        }}
      // inactiveDotOpacity={0.4}
      // inactiveDotScale={0.6}
      />
    );
  }
  render() {
    let { orderStore } = Store;
    const data = orderStore.adDetail.data;
    const adDetail = data.ad_detail;
    const sliderImages = adDetail.images;
    var sliderWidth = Dimensions.get('window').width;
    sliderWidth = (sliderWidth / 100) * 100;
    return (

      <View>
        <Modal
          visible={this.state.isImageViewVisle}
          onRequestClose={() => { this.setState({ isImageViewVisle: false }) }}
          transparent={true}>

          <ImageViewer
            imageUrls={fullImages}
            index={this.state.currentImage}
            enableSwipeDown={true}
            onSwipeDown={() => { this.setState({ isImageViewVisle: false }) }}
            renderHeader={() => (
              <TouchableOpacity
                onPress={() => this.setState({ isImageViewVisle: false })}
                style={s.imageViewHeaderContainer}
              >
                <Image style={s.imageViewClose}
                  source={require('../../res/images/cross_white.png')} />
              </TouchableOpacity>
            )}
          />
        </Modal>

        {/* Slider Section Start */}
        <View style={s.container}>
          {/* <View style={s.left}>
            <Image
              source={{ uri: sliderImages[this.state.sliderImageCurrentIndex].thumb }}
              style={s.headerImageStyle}
            />
            <View style={s.leftSideAbsoluteContainer}>
              <TouchableOpacity
                onPress={() => {
                  if (this.state.sliderImageCurrentIndex - 1 >= 0) {
                    this.setState({ sliderImageCurrentIndex: this.state.sliderImageCurrentIndex - 1 });
                  }
                  this.carousel.snapToPrev();

                }}
                style={[s.arrowContainer, { backgroundColor: orderStore.color  }]}>
                <Image style={s.topSliderArrow}
                  source={require('../../res/images/left_arrow_white.png')}
                />
              </TouchableOpacity>
            </View>
          </View> */}

          <View style={s.middle}>
            <Carousel
              Carousel layout={'default'}
              data={sliderImages.slice()}
              vertical={false}
              ref={(c) => { this.carousel = c; }}
              onSnapToItem={this._snapToItem}
              renderItem={({ item, index }) =>

                <View

                >
                  <Image
                    source={{ uri: item.thumb }}
                    style={s.headerImageStyle}
                  />
                  <TouchableOpacity

                    onPress={() => { this.onImageClick(index) }}

                    style={s.middleSectionAbsoluteContainer}>
                    {adDetail.is_feature ?
                      <View style={s.featuredRow}>

                        <View style={[s.featuredContainer, { backgroundColor: orderStore.color }]}>
                          <Text style={[s.featuredText]}>{adDetail.is_feature_text}</Text>
                        </View>
                      </View>
                      : null}
                    <View style={[s.sliderRow, { position: 'absolute', bottom: 0 }]}>
                      <Image source={require('../../res/images/gallery.png')}
                        style={s.topSliderMiddleGalleryImage} />
                      <Text style={s.topSliderMiddleGalleryImageText}>
                        {data.ad_detail.images_count}
                      </Text>
                    </View>
                    {
                      <Visbility

                        hide={!data.is_feature}
                        style={[s.topSliderMiddleRighTextContainer, { backgroundColor: orderStore.color }]}>
                        <Text style={s.topSliderMiddleRightText}>
                          {data.is_feature_text}
                        </Text>
                      </Visbility>

                    }
                  </TouchableOpacity>
                </View>

              }
              sliderWidth={parseInt(sliderWidth)}
              itemWidth={parseInt(sliderWidth)}
              keyExtractor={item => item.img_id + ''} >
            </Carousel>
            {this.pagination}

          </View>

          {/* <View style={s.right}>
            <Image
              source={{ uri: sliderImages[this.state.sliderImageCurrentIndex].thumb }}
              style={s.headerImageStyle}
            />
            <View style={s.rightSideAbsoluteContainer}>
              <TouchableOpacity
                onPress={() => {
                  if (this.state.sliderImageCurrentIndex + 1 < sliderImages.length) {
                    this.setState({ sliderImageCurrentIndex: this.state.sliderImageCurrentIndex + 1 });
                  }
                  this.carousel.snapToNext();

                }}
                style={[s.arrowContainer, { backgroundColor: orderStore.color  }]}>
                <Image style={s.topSliderArrow}
                  source={require('../../res/images/right_arrow_white.png')}
                />
              </TouchableOpacity>
            </View>
          </View> */}
        </View>


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
    // marginTop: localProps.topMargin,
  },

  left: {
    width: '5%',
    height: '100%',
  },
  middle: {
    width: '100%',
    height: '100%',
  },

  right: {
    width: '5%',
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
    justifyContent: 'space-between',
    position: 'absolute',


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
  featuredRow: {
    width: '100%',
    height: 20,
    alignItems: 'flex-end',
  },
  featuredContainer: {
    // padding: 10,
    // paddingHorizontal:10,
    // paddingTop:10,
    // borderRadius: Appearences.Radius.radius,
    height:'102%',
    width:'15%',
    marginTop: 5, marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredText: {
    color: 'white',
    fontSize: Appearences.Fonts.paragraphFontSize,
  },

  sliderRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingEnd: 10,
    paddingStart: 10,
    paddingBottom: 10,

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

  },
  carInfoRowLeftDetail: {
    fontSize: Appearences.Fonts.mainHeadingFontSize,
    color: Appearences.Colors.black,
    marginTop: localProps.topMargin,
    fontWeight: Appearences.Fonts.headingFontWieght,

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
    backgroundColor: 'white',
  },
  triangleRowcontainerAbsolute: {
    position: 'absolute',
    marginTop: 300,
    alignSelf: 'center',
    backgroundColor: 'white',
    flex: 1,
    paddingStart: 15,
    paddingEnd: 15,
    width: '100%'
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

