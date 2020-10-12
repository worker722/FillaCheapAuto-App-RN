import React, { Component } from 'react';
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
  Text,
  TextInput,
} from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import Appearences from '../config/Appearences';
import Store from './../Stores';
import { observer } from 'mobx-react';
import { withNavigation } from 'react-navigation';
import Toast from 'react-native-simple-toast';
import styles from '../drawerscreens/profile/tabs/my/Styles';
import ConfirmDialogue from '../components/ConfirmDialogue';
import MenuConfirmDialogue from '../components/ConfirmDialogue';
@observer
class DetailToolbarMenu extends Component<Props>  {
  item; option; text; index;
  deleteIndex = 0;
  deleteItem;
  constructor(props) {
    super(props);
    this.state = {
      hidePostReportProgress: false,
      showEditOption: false,
      showEditOption1: false,
      showMenuConfirmDialogue:false
    }
  }


  render() {
    let { orderStore } = Store;
    const {fnc } = this.props
    // let statusText = orderStore.profile.extra_text.status_text;
    // const { ad_data } = this.props
    if (orderStore.adDetailComponentMounted) {

      this.setState({ showEditOption: true });
      orderStore.setAdDetailComponentMounted(false);

    }
    else {


    }
    // const staticText = orderStore.innerResponse.data.static_text;

    return (
      <View>

        <View style={Styles.twoButtonView}>


          {

            this.state.showEditOption ?
              // <TouchableOpacity
              //   onPress={() => {
              //     let { orderStore } = Store;
              //     this.props.navigation.replace('SellEdit', { adId: orderStore.adDetail.data.ad_detail.ad_id, isUpdate: true });
              //   }}
              // >
              //   <Image
              //     style={Styles.icons}
              //     source={require('../../res/images/edit_white.png')} />
              // </TouchableOpacity>
              <Menu>

                <MenuTrigger>
                  {/* <View style={{ paddingStart: 5, paddingEnd: 5, paddingTop: 5, paddingBottom: 20 }}> */}
                    <Image
                      source={require('../../res/images/edit_white.png')}
                      style={Styles.icons}
                    />
                  {/* </View> */}
                </MenuTrigger>

                <MenuOptions optionsContainerStyle={{width:100,marginTop:25}}>
                  <MenuOption onSelect={() => {
                     fnc('active',orderStore.adDetail.data.ad_detail.ad_id)
                     orderStore.setOnClickActiveListner(true,orderStore.adDetail.data.ad_detail,'Active');
                    // this.item = ad_data;
                    // this.option = statusText.status_dropdown_value[0];
                    // this.text = statusText.status_dropdown_value[0];
                    // this.index = index;
                    // this.setState({ showMenuConfirmDialogue: true });
                  }}>
                    <View style={styles.menuItemContainer}>
                      <Text style={styles.menuTextStyle}>
                       Active
                      </Text>

                    </View>
                  </MenuOption>

                  <MenuOption onSelect={() => {
                    fnc('expire')
                    orderStore.setOnClickActiveListner(true,orderStore.adDetail.data.ad_detail,'Expired');
                    // this.item = item;
                    // this.option = statusText.status_dropdown_value[1];
                    // this.text = statusText.status_dropdown_value[1];
                    // this.index = index;
                    // this.setState({ showMenuConfirmDialogue: true });
                  }}>
                    <View style={styles.menuItemContainer}>
                      <Text style={styles.menuTextStyle}>
                       Expired
                      </Text>

                    </View>
                  </MenuOption>

                  <MenuOption onSelect={() => {
                     fnc('sold')
                     orderStore.setOnClickActiveListner(true,orderStore.adDetail.data.ad_detail,'Sold');
                    // this.item = item;
                    // this.option = statusText.status_dropdown_value[2];
                    // this.text = statusText.status_dropdown_value[2];
                    // this.index = index;
                    // this.setState({ showMenuConfirmDialogue: true });
                  }}>
                    <View style={styles.menuItemContainer}>
                      <Text style={styles.menuTextStyle}>
                        Sold
                      </Text>

                    </View>
                  </MenuOption>


                  <MenuOption onSelect={async () => {
                    // await this.setState({ showConfirmDialogue: true });
                    // deleteIndex = index;
                    // deleteItem = item;
                    fnc('delete')
                    orderStore.setOnClickActiveListner(true,orderStore.adDetail.data.ad_detail,'Delete');
                  }}>
                    <View style={styles.menuItemContainer}>
                      <Text style={styles.menuTextStyle}>
                      Delete
                      </Text>

                    </View>
                  </MenuOption>


                  <MenuOption onSelect={() => {
                   
                    fnc('edit')
                    orderStore.setOnClickActiveListner(true,orderStore.adDetail.data.ad_detail,'Edit');
                  }}>
                    <View style={styles.menuItemContainer}>
                      <Text style={styles.menuTextStyle}>
                     Edit
                      </Text>

                    </View>
                  </MenuOption>
                </MenuOptions>
              </Menu>
              : null
          }

          <Menu>
            <MenuTrigger>
              <Image
                source={require('../../res/images/menu_white.png')}
                style={Styles.icons} />
            </MenuTrigger>

            <MenuOptions>
              <MenuOption onSelect={() => {
                // this.refs.reportModal.open();
                orderStore.setOnClickShareListener(true);
              }}>
                <View style={Styles.menuContainer}>
                  <Image
                    style={Styles.menuImage}
                    source={require('../../res/images/share_grey.png')} />
                  <Text style={Styles.menuTextStyle}>{orderStore.detailToolbarModel.shareText}</Text>
                </View>
                <View style={Styles.menuItemSperator} />
              </MenuOption>

              <MenuOption onSelect={() => {
                // this.refs.reportModal.open();
                orderStore.setOnClickFavouritetListener(true);
              }}>
                <View style={Styles.menuContainer}>
                  <Image
                    style={Styles.menuImage}
                    source={require('../../res/images/heart_red.png')} />
                  <Text style={Styles.menuTextStyle}>{orderStore.detailToolbarModel.favouriteText}</Text>
                </View>
                <View style={Styles.menuItemSperator} />
              </MenuOption>

              <MenuOption onSelect={() => {
                // this.refs.reportModal.open();
                orderStore.setOnClickReportListener(true);
              }}>
                <View style={Styles.menuContainer}>
                  <Image
                    style={Styles.menuImage}
                    source={require('../../res/images/caution_grey.png')} />
                  <Text style={Styles.menuTextStyle}>{orderStore.detailToolbarModel.reportText}</Text>
                </View>
              </MenuOption>



            </MenuOptions>
          </Menu>

        </View>
        </View>
    );


  }
  deleteItem = async (item, index) => {
    this.setState({ showSpinner: true });

    const params = { ad_id: item.ad_id, }
    let response = await Api.post('ad/delete', params);
    if (response.success === true) {
      navigation.goback();
      // let { orderStore } = Store;
      // let data = [...orderStore.profile.data.active_add.ads];
      // data.splice(index, 1);
      // orderStore.profile.data.active_add.ads = data;
      // this.setState({ listData: orderStore.profile.data.active_add.ads });

    }

    this.setState({ showConfirmDialogue: false });
    if (response.message.length != 0)
      Toast.show(response.message);
    this.recallService(1);
  }
  onOptionSelected = async (item, option, text, index) => {
    this.setState({ showSpinner: true, showMenuConfirmDialogue: false });

    let params = {
      ad_id: item.ad_id,
      ad_status: option,
    };
    let response = await Api.post('ad/update/status', params);
    if (response.success === true) {
      navigation.goback();
      // let stateClone = [...this.state.listData];
      // stateClone[index].ad_status.status = option;
      // stateClone[index].ad_status.status_text = text;
      // this.setState({ listData: stateClone, reCaller: false });
      // //this.recallService(1);
      // item.ad_status.status = option + '';
    }
    if (response.message.length != 0)
      Toast.show(response.message);
    this.setState({ showSpinner: false });
  }

}
const localProps = {
  ratingHeaderDataDimens: 7,
  topMargin: 5,
  dataRowNumberFontSize: 12,
  sidePadding: 15,

};
const Styles = StyleSheet.create({


  icons: {
    width: 20,
    height: 20,
    marginEnd: 10,
    padding: 10,

  },


  twoButtonView: {
    flexDirection: 'row',
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingStart: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
  menuTextStyle: {
    fontSize: Appearences.Fonts.headingFontSize,
    color: Appearences.Colors.grey,
    marginStart: 5,
  },

  menuItemSperator: {
    height: 1,
    width: '100%',
    backgroundColor: Appearences.Colors.lightGrey,
    marginTop: 5,
  },
  menuImage: {
    width: Appearences.Fonts.headingFontSize,
    height: Appearences.Fonts.headingFontSize,
  },

});
export default withNavigation(DetailToolbarMenu)
