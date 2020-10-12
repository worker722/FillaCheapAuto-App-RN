
import React, { Component } from 'react';
import Appearences from '../../config/Appearences';

import {
  StyleSheet,
} from 'react-native';
const localProps = {
  ratingHeaderDataDimens:7,
  topMargin:5,
  dataRowNumberFontSize:12,
  sidePadding:15,

}
const styles = StyleSheet.create({
    container:{
    //   paddingStart:localProps.sidePadding,
    //   paddingEnd:localProps.sidePadding,
    },


    // Header Section start

    headerContainer:{
        height:130,
       
    },
    headerBackground:{
        height:'70%',
    },

        headerAbsoluteContainer:{
            height:'100%',
            width:'100%',
            position:'absolute',
            justifyContent:'flex-end',
            
        },
        headerContentConatiner:{
          
           width:'100%',
           alignItems:'flex-end',    
           justifyContent:'center',
           flexDirection:'row',     
        },
        headerContentItemContainer:{
          alignItems:'center',
          justifyContent:'center',
          padding:15,
          borderRadius:10,
          borderWidth:1,
          borderColor:Appearences.Colors.lightGrey,
          backgroundColor:'white',
          margin:5,
          width:'40%',

        },
        headerContentItemContainerActive:{
            alignItems:'center',
            justifyContent:'center',
            padding:15,
            borderRadius:10,
            borderWidth:1,
            borderColor:Appearences.Colors.lightGrey,
          
            margin:5,
            width:'40%',
  
          },
      headerItem:{
        alignItems:'center',
        justifyContent:'center',
      },
        headerImage:{
            width:25,
            height:25,
        },
        headerText:{
             fontSize:Appearences.Fonts.headingFontSize,
            
             color:Appearences.Colors.grey,
             marginTop:localProps.topMargin,   

        },
        headerTextActive:{
            fontSize:Appearences.Fonts.headingFontSize,
            marginTop:localProps.topMargin,   

       },
    //Header Section end

        listItemContainer:{
            alignItems:'center',
            paddingHorizontal: 15,
            flexDirection:'row',
            borderWidth: 1,
            borderColor: Appearences.Colors.lightGrey,
        },
        listImageContainer:{                      
            alignItems:'center',
            justifyContent:'center',
            // width:100,
            height:100,
            backgroundColor:"white",
            // borderRadius:80,
            
        },
        listImage:{
            width:100,
            height:100,
            borderRadius: 50
        },
        listTextContainer:{
            flex: 1.8,
            height:70,
            flexWrap: 'wrap',
            // justifyContent:'center',
            marginStart:5,
            // backgroundColor: 'red'
        },
        listTitleText:{
            fontSize:Appearences.Fonts.headingFontSize,
            color:Appearences.Colors.black,
            alignSelf: 'flex-start',
        },
        listNameText:{
            fontSize:Appearences.Fonts.paragraphFontSize,
            color:Appearences.Colors.grey,
            alignSelf:'flex-start',
        },
        timeView: {
            flexDirection: 'row',
            flex: 0.7,
            height:70,
        }

    });
export default styles;
