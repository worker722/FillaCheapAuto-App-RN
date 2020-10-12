
import  { I18nManager } from 'react-native';
import Appearences from '../../../../config/Appearences';

import {
  StyleSheet,
} from 'react-native';
const localProps = {
  ratingHeaderDataDimens:7,
  topMargin:10,
  dataRowNumberFontSize:12,
  sidePadding:15,

}
const styles = StyleSheet.create({
  

     container:{
         paddingStart:localProps.sidePadding,
         paddingEnd:localProps.sidePadding,
         marginTop:localProps.topMargin,
     },
     panel:{
      paddingStart:15,
      paddingEnd:15,
      justifyContent:'center',
      width:'92%',
      alignSelf:'center',
      flex:1,
      backgroundColor:'white',
      marginTop:localProps.topMargin,
      paddingBottom:15,
      paddingTop:15,
    },
    locatonTextContainer:{
      flexDirection:'row',
      width:'100%',
      justifyContent:'space-between',
    },
    locationImage:{
      tintColor:Appearences.Colors.grey,
      width:12,
      height:12,
      marginEnd:3,
    },
    paragraphTextGrey:{
      color:Appearences.Colors.grey,
      fontSize:Appearences.Fonts.paragraphFontSize,
    },
     subHeading:{
      fontSize:Appearences.Fonts.subHeadingFontSize,
      color:Appearences.Colors.black,
      fontWeight:Appearences.Fonts.headingFontWieght,
      alignSelf:'flex-start',
    },
     flatListContainer:{
     
      flexDirection:'column',
      backgroundColor:'white',
      marginTop:5,
      borderRadius:Appearences.Radius.radius,
  },
     pageTitle:{
       fontSize:Appearences.Fonts.headingFontSize+2,
       color:Appearences.Colors.black,
       marginTop:localProps.topMargin,
     },
     lineSeperator:{
      width:'100%',
      height:1,
      backgroundColor:Appearences.Colors.lightGrey,
    },
    aboutImage:{
      width:15,
      height:15,
      resizeMode:'cover',
    },
    contactRowContainer:{
      width:'100%',
      paddingTop:15,
      paddingBottom:15,
      flexDirection:'row',
      alignItems:'center'
    },
     wideSeperator:{
       width:30,
       height:1,
       marginTop:localProps.topMargin,
       backgroundColor:'black',
     },
     paragraphTextBlack:{
      color:Appearences.Colors.black,
      fontSize:Appearences.Fonts.paragraphFontSize,
      marginTop:localProps.topMargin,
     },
     headingTextBlack:{
      color:Appearences.Colors.black,
      fontSize:Appearences.Fonts.headingFontSize,
      marginTop:localProps.topMargin,
     },
     paragraphTextBlackMarginStart:{
      color:Appearences.Colors.black,
      fontSize:Appearences.Fonts.paragraphFontSize,
      marginTop:localProps.topMargin,
      marginStart:15,
     },
     mapContainer:{
      height:200,
      justifyContent:'center',
      marginTop:localProps.topMargin,
    },
    videoContent:{
      
      flex:1,},
      mapOverlay:{
        height:200,
        width:'100%',
        position:'absolute',
        backgroundColor:'transparent',

      },
     narrowSeperator:{
       width:20,
       height:1,
       marginTop:2,
       backgroundColor:'black',

     },
     popularCars:{
      width:'100%',
      marginTop:localProps.topMargin,
      
    },

    imageContainer:{

      height:'100%',
      width:'40%',
      borderTopLeftRadius:Appearences.Radius.radius,
      borderBottomLeftRadius:Appearences.Radius.radius,
      overflow:'hidden',
  },

  image:{
      height:140,
      width:'100%',
      borderTopLeftRadius:Appearences.Radius.radius,
      borderBottomLeftRadius:Appearences.Radius.radius,
  },
  imageContainerOverlay:{
      flex:1,
      position:'absolute',
      
  },
  topRowContainer:{        
      width:'100%',
      flexDirection:'row',
      justifyContent:"flex-end",
     
  },
  topRightContent:{
     width:60,
     height:60,
    
     alignItems:'flex-end',
  },
  topRightContentImage:{
      transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
  },
  bottomRowContainer:{      
      alignItems:'flex-end',
      flexDirection:'row',
      height:'50%',
    },
  bottomLeftContent:{
      width:22,
      height:22,
      borderRadius: 100/2,
      alignItems:'center',
      justifyContent:'center',
      marginStart:10,
      marginBottom:15,
  },

  bottomLeftContentImage:{
      width:7,
      height:7,
  },


  textContainer:{
    flex:1,
     
      padding:15,
      
      justifyContent:'center',
      },
      brandTitleStyle:{
          color:Appearences.Colors.black,
          fontSize:Appearences.Fonts.headingFontSize,
          fontFamily:Appearences.Fonts.paragaphFont,
          fontWeight:Appearences.Fonts.headingFontWieght,
          alignSelf: 'flex-start',
      },
      brandTextStyle:{
          color:Appearences.Colors.grey,
          fontSize:Appearences.Fonts.paragraphFontSize,
          fontFamily:Appearences.Fonts.paragaphFont,
          marginTop:5,
          alignSelf: 'flex-start',
         
      },
      modelTextStyle:{
          color:Appearences.Colors.grey,
          fontSize:Appearences.Fonts.paragraphFontSize,
          marginTop:5,    
          alignSelf: 'flex-start',
      },
      priceTextStyle:{
          fontSize:Appearences.Fonts.headingFontSize,
          fontWeight:Appearences.Fonts.headingFontWieght,
          marginTop:5,
          alignSelf: 'flex-start',
          
      },

      featureAdsBottom: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
      },
      featureAdsBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: Appearences.Colors.lightGrey,
        // borderWidth: StyleSheet.hairlineWidth,
        margin: 1,
      },
      featureAdsBtntxt: {
        color: Appearences.Colors.green,
        fontSize: 16,
        fontFamily: Appearences.Fonts.paragaphFont,
        marginLeft: 10,
      },
      bottomImgStyl: {
        height: 20,
        width: 20,
      },
      // Modal Styling Start
    modalContainer:{
      flex:1,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'rgba(0, 0, 0, 0.5)',
    },
    modalContentContainer:{
      width:'80%',
      backgroundColor:'white',
      borderRadius:Appearences.Radius.radius,
      padding:25,
      justifyContent:'center'
    },
    modalHeaderContainer:{
      width:'100%',
      justifyContent:'space-between',
      
      flexDirection:'row',
      alignItems:'center',
      backgroundColor:'white',
    },
    modalHeaderText:{
      fontSize:Appearences.Fonts.subHeadingFontSize,
      color:Appearences.Colors.black,
      fontWeight:Appearences.Fonts.headingFontWieght,

    },
    modalHeadingImage:{
      width:15,
      height:15,
      tintColor:Appearences.Colors.black,
    },

    modalHeadingText:{
      marginTop:localProps.topMargin+5,
      fontSize:Appearences.Colors.headingFontSize,
      fontWeight:Appearences.Fonts.headingFontWieght,
    },
    modalTextInput:{
      width:'100%',
      height:Appearences.Registration.itemHeight,
      backgroundColor:Appearences.Registration.boxColor,
      marginTop:localProps.topMargin+5,
      fontSize:Appearences.Fonts.paragraphFontSize,
      paddingStart:localProps.sidePadding,
      borderRadius:5,
      color:Appearences.Colors.black,


    },



    modalTextInputMultiLine:{
        minHeight:100,
          width:"100%",
          backgroundColor:Appearences.Registration.boxColor,
          textAlignVertical: "top",
          borderRadius:5,
          color:Appearences.Colors.black,
        
          fontSize:Appearences.Fonts.headingFontSize,
          padding:15,
          marginTop:localProps.topMargin+5,
        },
    modalButtonRow:{
      marginTop:localProps.topMargin+5,
      height:Appearences.Registration.itemHeight-10,
      width:'100%',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:Appearences.Radius.radius,
    },
    messageModalButtonRow:{
      width:'100%',
      height:Appearences.Registration.itemHeight-10,
      marginTop:localProps.topMargin,
      flexDirection:'row',
      justifyContent:'space-between',
    },
    messageModalProgressRow:{
      width:'100%',
      height:Appearences.Registration.itemHeight,
      marginTop:localProps.topMargin,
      justifyContent:'center',
      alignItems:'center',
    },
    paragraphTextWhite:{
      fontSize:Appearences.Fonts.paragraphFontSize,
      color:'white',
      fontWeight:Appearences.Fonts.headingFontWieght,
    },
    messageMoalButton:{
      width:'49%',
      height:'100%',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:Appearences.Radius.radius,
      backgroundColor:'white',
    },
    buttonTextWhite:{
      fontSize:Appearences.Fonts.headingFontSize,
      color:'white',
      fontWeight:Appearences.Fonts.headingFontWieght,
    },
    buttonTextBlack:{
      fontSize:Appearences.Fonts.headingFontSize,
      color:Appearences.Colors.black,
      fontWeight:Appearences.Fonts.headingFontWieght,
    },



    });
export default styles;