import React, {Component} from 'react';
import Appearences from '../../config/Appearences';
import {I18nManager} from 'react-native';

import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    //  height:100,
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    // elevation   : Appearences.Shadow.elevation,
    //shadowOpacity: Appearences.Shadow.shadow,
    //  marginVertical:7,
    // marginHorizontal:5,
    marginTop: 5,
    // marginStart:-5,
    backgroundColor: 'white',
    borderRadius: Appearences.Radius.radius,
    
  },
  imageContainer: {
    flex: 1,
    // height: 100,
    width: '40%',
    borderTopLeftRadius: Appearences.Radius.radius,
    borderBottomLeftRadius: Appearences.Radius.radius,
    overflow: 'hidden',
    alignSelf: 'center',
  },

  image: {
    height: 140,
    width: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: Appearences.Radius.radius,
    borderBottomLeftRadius: Appearences.Radius.radius,
    alignSelf: 'center',
  },
  imageContainerOverlay: {
    flex: 1,
    position: 'absolute',
  },
  topRowContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  topRightContent: {
    width: 60,
    height: 60,

    alignItems: 'flex-end',
  },
  topRightContentImage: {
    transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
  },
  bottomRowContainer: {
    height: '50%',
    justifyContent: 'flex-end',
  },
  bottomLeftContent: {
    width: 22,
    height: 22,
    marginStart: 3,
    marginBottom: 5,
    borderRadius: 100 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 8,
    marginBottom: 8,
  },

  bottomLeftContentImage: {
    width: 7,
    height: 7,
  },

  textContainer: {
    flex: 1,
    padding: 15,
    marginBottom:-12,marginTop:-12,
    justifyContent: 'center',
  },
  textContainer1: {
    flex: 1,
    // paddingTop: 5,
    alignItems:'center',
  },
  brandTitleStyle: {
    fontSize: Appearences.Fonts.headingFontSize,
    fontWeight: Appearences.Fonts.headingFontWieght,
    color: Appearences.Colors.black,
    alignSelf: 'flex-start',
  },
  brandTextStyle: {
    color: Appearences.Colors.grey,
    fontSize: Appearences.Fonts.paragraphFontSize,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  modelTextStyle: {
    color: Appearences.Colors.grey,
    fontSize: Appearences.Fonts.paragraphFontSize,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  priceTextStyle: {
    fontSize: Appearences.Fonts.paragraphFontSize,
    fontFamily: Appearences.Fonts.paragaphFont,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  featureAdsBottom: {
    flexDirection: 'row',
    height: 30,
    alignItems: 'center',
  },
  featureAdsBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: Appearences.Colors.lightGrey,
    // borderWidth: StyleSheet.hairlineWidth,
    margin: 1,
  },
  featureAdsBtntxt: {
    color: Appearences.Colors.green,
    fontSize: Appearences.Fonts.paragraphFontSize,
    fontFamily: Appearences.Fonts.paragaphFont,
    marginLeft: 10,
  },
  bottomImgStyl: {
    height: 15,
    width: 15,
  },
});
export default styles;
