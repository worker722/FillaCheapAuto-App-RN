import { I18nManager } from 'react-native'
import React, { Component } from 'react';
import Appearences from '../../config/Appearences';
import { width } from 'react-native-dimension';

import {
  StyleSheet,
} from 'react-native';

const localProps = {
  Border: {
    width: .5,
    radius: 2,
  },
  headerHeight: 230,
  topMargin: 5,
  sidePadding: 15,
  bodyTopMargin: 15,
};
styles = StyleSheet.create({

  container: {
    //paddingStart:localProps.sidePadding,
    //paddingEnd:localProps.sidePadding,
    flex: 1,

  },
  header: {
    width: '100%',
    height: localProps.headerHeight,
    justifyContent: 'center',

  },
  headerImage: {
    flex: 1,
    width: '100%',
    height: localProps.headerHeight,
  },
  headerImageOverlay: {
    flex: 1,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // backgroundColor:'red',
    width: '100%',
    height: localProps.headerHeight,


    justifyContent: 'center',
  },
  headerInnerContainer: {

    height: localProps.headerHeight - 60,
    width: '100%',

    justifyContent: 'flex-end',
    paddingStart: localProps.sidePadding,
    paddingEnd: localProps.sidePadding,

  },
  headerTitleText: {
    color: 'white',
    fontSize: Appearences.Fonts.mainHeadingFontSize,
    alignSelf: 'flex-start',
    fontWeight: Appearences.Fonts.headingFontWieght,


  },
  headerUnderline: {
    height: 1,
    width: 30,
    marginTop: localProps.topMargin,
  },
  headerSubtitleText: {
    color: 'white',
    fontSize: Appearences.Fonts.paragraphFontSize,
    marginTop: localProps.topMargin,
    alignSelf: 'flex-start',
  },
  headerSearchbarContainer: {
    width: '100%',
    height: Appearences.Registration.itemHeight - 10,
    flexDirection: 'row',
    marginTop: localProps.topMargin,

  },
  TextInput: {
    flex: 1.5,
    height: Appearences.Registration.itemHeight - 10,
    backgroundColor: 'white',
    paddingStart: localProps.sidePadding,
    paddingEnd: localProps.sidePadding,
    paddingBottom: 0,
    paddingTop: 0,
    fontSize: Appearences.Fonts.paragraphFontSize,

  },
  searchButton: {
    flex: 1,
    paddingStart: localProps.sidePadding,
    paddingEnd: localProps.sidePadding,
    height: Appearences.Registration.itemHeight,
    alignItems: "center",
    justifyContent: "center",

  },
  searchImage: {
    width: 15,
    height: 15,
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
  },
  advencedSearcTextStyle: {
    alignSelf: 'flex-end',
    color: 'white',
    fontSize: Appearences.Fonts.paragraphFontSize,
    marginTop: localProps.topMargin,
    textDecorationLine: 'underline',
  },
  body: {
    flex: 1,

  },
  headingWithButtonContainer: {
    width: '100%',
    justifyContent: 'space-between',
  },
  smallButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  textRowConrainer: {
    flexDirection: 'row',
  },
  smallButton: {
    borderRadius: 3,
    paddingTop: 5,
    paddingBottom: 5,
    paddingStart: 10,
    paddingEnd: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingContainer: {

    marginTop: localProps.bodyTopMargin,

    flexDirection: 'row',

  },

  bodyHeadingAppColor: {
    fontWeight: Appearences.Fonts.headingFontWieght,
    fontSize: Appearences.Fonts.subHeadingFontSize,
    color: Appearences.Colors.black,
  },
  headingButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bodyHeadingSeperatorContainer: {
    width: '100%',
    height: 1,

    marginTop: localProps.topMargin,
  },

  bodyHeadingPrimarySeperator: {
    backgroundColor: Appearences.Colors.black,
    width: 40,
    height: 1,

  },
  bodyHeadingSecondarySeperator: {
    backgroundColor: Appearences.Colors.black,
    width: 30,
    height: 1,
    marginTop: 2,
  },
  featuredTypeListContainer: {

    flexDirection: 'row',
    //height:100,
    marginTop: localProps.bodyTopMargin,
    marginStart: -5,

  },
  leftArrow: {
    height: 100,
    width: 20,
    justifyContent: 'center',

  },
  rightArrow: {
    height: 100,
    width: 20,

    justifyContent: 'center',

  },
  leftArrowContainer: {
    width: '100%',
    height: 100,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'flex-start',

  },
  rightArrowContainer: {
    width: '100%',
    height: 100,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  arowDimens: {
    width: 15,
    height: 12,
  },
  buttonRow: {

    width: "100%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: localProps.bodyTopMargin,

  },
  button: {
    width: '100%',
    borderRadius: Appearences.Radius.radius,
    height: Appearences.Buttons.height,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',

    alignSelf: 'center',
  },

  buttonTextStyle: {
    color: 'white',
    fontSize: Appearences.Fonts.paragraphFontSize,


  },
  featuredMakersListContainer: {

    marginTop: localProps.bodyTopMargin,
    marginStart: -5,
    marginEnd: -5,
  },

  bodyHeadingBlack: {
    color: 'black',
    fontWeight: Appearences.Fonts.headingFontWieght,
    fontSize: Appearences.Fonts.subHeadingFontSize,

  },
  featuredGrid: {

    flexDirection: 'row',

    marginTop: localProps.bodyTopMargin,
    marginStart: -5,
    backgroundColor: Appearences.Colors.lightGrey,
  },
  popularCars: {
    marginTop: localProps.topMargin,
    width: '100%',
  },

  exploreCountry: {
    width: '100%',
    marginStart: -5,
    marginTop: localProps.bodyTopMargin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCars: {
    width: '100%',


    alignItems: 'center',
    justifyContent: 'center',
    marginTop: localProps.bodyTopMargin,

  },





  // blog start
  listRowContainer: {
    marginStart: -5,
    marginEnd: -5,
    marginTop: localProps.topMargin,
  },

  listItemContainer: {
    width: '48%',
    //flex:1, 
    //height:250,
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: 'white',
    //elevation   : Appearences.Shadow.elevation,
    //shadowOpacity: Appearences.Shadow.shadow,
    borderRadius: Appearences.Radius.radius,

  },
  imageContainer: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: Appearences.Radius.radius,
    borderTopRightRadius: Appearences.Radius.radius,
    overflow: 'hidden',

  },
  image: {
    width: '100%',
    flex: 1,
    resizeMode: 'cover',
    borderTopLeftRadius: Appearences.Radius.radius,
    borderTopRightRadius: Appearences.Radius.radius,

  },
  contentContainer: {

    padding: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  buttonContainer: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: localProps.topMargin,
  },
  paragraphText: {
    color: Appearences.Colors.grey,
    fontSize: Appearences.Fonts.paragraphFontSize,
    marginTop: localProps.topMargin,
  },
  headingText: {
    color: Appearences.Colors.black,
    fontSize: Appearences.Fonts.headingFontSize,
    marginTop: localProps.topMargin,
    fontWeight: Appearences.Fonts.headingFontWieght,
  },
  headingTextWhite: {
    color: 'white',
    fontSize: Appearences.Fonts.headingFontSize,
  },

  // blog end
  // Modal Styling Start
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: Appearences.Radius.radius,
    padding: 25,
    justifyContent: 'center'
  },
  modalHeaderContainer: {
    width: '100%',
    justifyContent: 'space-between',

    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalHeaderText: {
    fontSize: Appearences.Fonts.subHeadingFontSize,
    color: Appearences.Colors.black,
    fontWeight: Appearences.Fonts.headingFontWieght,

  },
  modalHeadingImage: {
    width: 15,
    height: 15,
    tintColor: Appearences.Colors.black,
  },

  modalHeadingText: {
    marginTop: localProps.topMargin + 5,
    fontSize: Appearences.Colors.headingFontSize,
    fontWeight: Appearences.Fonts.headingFontWieght,
  },
  modalTextInput: {
    width: '100%',
    height: Appearences.Registration.itemHeight,
    backgroundColor: Appearences.Registration.boxColor,
    marginTop: localProps.topMargin + 5,
    fontSize: Appearences.Fonts.paragraphFontSize,
    paddingStart: localProps.sidePadding,
    borderRadius: 5,
    color: Appearences.Colors.black,


  },



  modalTextInputMultiLine: {
    minHeight: 100,
    width: "100%",
    backgroundColor: Appearences.Registration.boxColor,
    textAlignVertical: "top",
    borderRadius: 5,
    color: Appearences.Colors.black,

    fontSize: Appearences.Fonts.headingFontSize,
    padding: 15,
    marginTop: localProps.topMargin + 5,
  },
  modalButtonRow: {
    marginTop: localProps.topMargin + 5,
    height: Appearences.Registration.itemHeight - 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Appearences.Radius.radius,
  },
  messageModalButtonRow: {
    width: '100%',
    height: Appearences.Registration.itemHeight - 10,
    marginTop: localProps.topMargin,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageModalProgressRow: {
    width: '100%',
    height: Appearences.Registration.itemHeight,
    marginTop: localProps.topMargin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paragraphTextWhite: {
    fontSize: Appearences.Fonts.paragraphFontSize,
    color: 'white',
    fontWeight: Appearences.Fonts.headingFontWieght,
  },
  messageMoalButton: {
    width: '49%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Appearences.Radius.radius,
    backgroundColor: 'white',
  },
  buttonTextWhite: {
    fontSize: Appearences.Fonts.headingFontSize,
    color: 'white',
    fontWeight: Appearences.Fonts.headingFontWieght,
  },
  buttonTextBlack: {
    fontSize: Appearences.Fonts.headingFontSize,
    color: Appearences.Colors.black,
    fontWeight: Appearences.Fonts.headingFontWieght,
  },



});
export default styles;