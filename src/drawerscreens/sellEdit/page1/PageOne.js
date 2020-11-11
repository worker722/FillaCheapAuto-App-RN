import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import Appearences from '../../../config/Appearences';
import styles from './Styles';
import Store from '../../../Stores';
import Toast from 'react-native-simple-toast';
import Api from '../../../network/Api';
// import Spinner from 'react-native-loading-spinner-overlay';
import ModalDropdown from 'react-native-modal-dropdown';
import SearchableDropdown from '../../../../src/components/react-native-searchable-dropdown';
import s from '../page3/Styles';
// import DatePicker from 'react-native-datepicker'
// import { observer } from 'mobx-react';
import Visibility from '../../../components/Visibility';
import ImageViewer from 'react-native-image-zoom-viewer';
import ImagePicker from 'react-native-image-crop-picker';
import * as Progress from 'react-native-progress';
import ConfirmDialogue from '../../../components/ConfirmDialogue';
import DraggableFlatList from 'react-native-draggable-flatlist'
import ActionSheet from 'react-native-actionsheet'
import { log } from 'react-native-reanimated';


var imageId;

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);
export default class PageOne extends Component<Props> {
  isCategoryRequired = false;
  isTitleRequired = false;

  categoryClear = true;
  showActionSheet = () => {
    this.ActionSheet.show()
  }
  getSubCategories = async (id) => {
    this.setState({ showCategorySpinner: true, subCategories: [] });
    const params = { subcat: id };
    const response = await Api.post("post_ad/subcats", params);

    if (response.extras.package_type != undefined && response.extras.package_type != 'undefined' && response.extras.package_type.length != 0) {
      const pkgType = response.extras.package_type;
      const obj = { isRedirect: pkgType.is_redirect, redirectUrl: pkgType.redirect_url, total: pkgType.cart_total, totalText: pkgType.cart_total_text };
      let { orderStore } = Store;
      orderStore.cart = obj;
    }


    var tempArray = [];
    if (response.success === true) {

      response.data.values.map((item, index) => {

        tempArray.push(item);

      });
      this.checkBoxTemp = [];
      this.setState({ subCategories: tempArray, showSubCategories: true, });

    }
    if (response.message.length != 0)
      Toast.show(response.message);
    this.setState({ showCategorySpinner: false });

  }





  componentDidMount = () => {
    let { orderStore } = Store;
    for (var i = 0; i < orderStore.innerResponse.pageOne.length; i++) {
      if (orderStore.innerResponse.pageOne[i].type == "select" && orderStore.innerResponse.pageOne[i].fieldTypeName == "ad_price_type") {
        if (orderStore.innerResponse.pageOne[i].values[0].id != undefined)
          this.setState({ priceTypeId: orderStore.innerResponse.pageOne[i].values[0].id, showPriceOnly: orderStore.innerResponse.pageOne[i].values[0].is_show });

      }

    }
    this.setState({ pageOne: orderStore.innerResponse.pageOne });

  }
  componentWillMount = async () => {
    let { orderStore } = Store;
    let response = orderStore.settings;
    var fullImages = [];
    for (var i = 0; i < response.data.ad_images.length; i++) {
      var model = {};
      model.thumb = response.data.ad_images[i].thumb;
      model.id = response.data.ad_images[i].img_id;
      fullImage = { url: response.data.ad_images[i].thumb };
      fullImages.push(fullImage);
    }
    for (var i = 0; i < orderStore.innerResponse.pageOne.length; i++) {
      if (orderStore.innerResponse.pageOne[i].fieldTypeName === "ad_cats1") {
        if (orderStore.innerResponse.pageOne[i].values != undefined && orderStore.innerResponse.pageOne[i].values.length != 0)
          this.setState({ categoryId: orderStore.innerResponse.pageOne[i].values[0].id });
        if (orderStore.innerResponse.pageOne[i].values[0].has_sub) {

          this.setState({ categoryId: orderStore.innerResponse.pageOne[i].values[0].id, showSubCategories: false, showSubSubCategories: false, showSubSubSubCategories: false, });

          this.getSubCategories(orderStore.innerResponse.pageOne[i].values[0].id);
        }
        if (orderStore.innerResponse.pageOne[i].values[0].has_template) {
          orderStore.optionSelectedModel.hasTemp = true;
          orderStore.optionSelectedModel.categoryId = orderStore.innerResponse.pageOne[i].values[0].id;
          orderStore.setOnDynamicOptionSeleted(true);

        }
        else {
          orderStore.optionSelectedModel.hasTemp = false;
          orderStore.setOnDynamicOptionSeleted(false);

        }
      }
    }

    this.setState({ images: response.data.ad_images, fullImages: fullImages });
  }




  uploadMultipleImages = async (images) => {
    this.setState({ hideImageIndicator: false });
    let { orderStore } = Store;
    const response = await Api.postImageMulti("post_ad/image", "file", images, "ad_id", orderStore.settings.data.ad_id);
    if (response.success === true) {
      var images = [];
      var fullImages = [];
      for (var i = 0; i < response.data.ad_images.length; i++) {
        var model = {};
        model.thumb = response.data.ad_images[i].thumb;
        model.id = response.data.ad_images[i].img_id;
        images.push(model);
        fullImage = { url: response.data.ad_images[i].thumb };
        fullImages.push(fullImage);
      }

      this.setState({ images: response.data.ad_images, fullImages: fullImages, showImageError: false });
    }
    this.setState({ hideImageIndicator: true });
    if (response.message.length != 0)
      Toast.show(response.message);
  }





  renderItem = ({ item, index, move, moveEnd, isActive }) => {
    return (
      <DismissKeyboard>
        <TouchableOpacity style={styles.fileThumb}
          key={index}
          //onPress = {()=>{this.onImageClick(index)}}

          onLongPress={move}
          onPressOut={moveEnd}
        >
          <Image source={{ uri: item.thumb + '?date=' + (new Date()).getTime() }}
            style={styles.image} />
          <View style={styles.fileThumbAbsolute}>
            <TouchableOpacity
              onPress={() => {
                imageId = item.img_id;
                this.setState({ showConfirmDialogue: true })

              }
              }
              style={{ backgroundColor: 'white', width: 25, height: 25, alignItems: 'center', justifyContent: 'center' }}>
              <Image
                style={styles.fileThumbCrossImage}
                source={require('../../../../res/images/cross_red.png')}

              />


            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      </DismissKeyboard>
    );
  }

  getSubSubSubCategories = async (id) => {
    this.setState({ showCategorySpinner: true, subSubSubCategories: [] });
    const params = { subcat: id };
    const response = await Api.post("post_ad/subcats", params);

    if (response.extras.package_type != undefined && response.extras.package_type != 'undefined' && response.extras.package_type.length != 0) {
      const pkgType = response.extras.package_type;
      const obj = { isRedirect: pkgType.is_redirect, redirectUrl: pkgType.redirect_url, total: pkgType.cart_total, totalText: pkgType.cart_total_text };
      let { orderStore } = Store;
      orderStore.cart = obj;
    }

    var tempArray = [];
    if (response.success === true) {

      response.data.values.map((item, index) => {

        tempArray.push(item);

      });
      this.checkBoxTemp = [];
      this.setState({ subSubSubCategories: tempArray, showSubSubSubCategories: true, });

    }
    if (response.message.length != 0)
      Toast.show(response.message);
    this.setState({ showCategorySpinner: false });

  }

  getSubSubCategories = async (id) => {
    this.setState({ showCategorySpinner: true, subSubCategories: [] });
    const params = { subcat: id };
    const response = await Api.post("post_ad/subcats", params);

    if (response.extras.package_type != undefined && response.extras.package_type != 'undefined' && response.extras.package_type.length != 0) {
      const pkgType = response.extras.package_type;
      const obj = { isRedirect: pkgType.is_redirect, redirectUrl: pkgType.redirect_url, total: pkgType.cart_total, totalText: pkgType.cart_total_text };
      let { orderStore } = Store;
      orderStore.cart = obj;
    }

    var tempArray = [];
    if (response.success === true) {

      response.data.values.map((item, index) => {

        tempArray.push(item);

      });
      this.checkBoxTemp = [];
      this.setState({ subSubCategories: tempArray, showSubSubCategories: true, });

    }
    if (response.message.length != 0)
      Toast.show(response.message);
    this.setState({ showCategorySpinner: false });

  }


  constructor(props) {

    super(props);


    this.state = {
      showSpinner: false,
      showCategorySpinner: false,
      carMakeId: "",
      categoryId: "",
      showCarMakeError: false,
      showCategoryError: false,
      titleText: "",
      showTitleError: false,
      showImageError: false,
      images: [],
      showPriceOnly: true,

      isImageViewVisle: false,
      hideImageIndicator: true,
      fullImages: [],
      currentImage: 0,
      showConfirmDialogue: false,


      subCategories: [],
      subSubCategories: [],
      subSubSubCategories: [],


      showSubCategories: false,
      showSubSubCategories: false,
      showSubSubSubCategories: false,

      pageOne: [],




      selectedTag: 'body',
      selectedStyles: [],
      selectedItems: [],

    };
    this.editor = null;

  }




  getCategories = (item) => {
    const { showCategoryError, categoryId } = this.state;
    this.isCategoryRequired = item.is_required;
    var valuesArray = [];
    var idsArray = [];
    var categories = [];

    for (var i = 0; i < item.values.length; i++) {
      if (item.values[i].id !== '') {
        valuesArray.push(item.values[i].name);
        idsArray.push(item.values[i].id);
        categories.push({
          names: item.values[i].name,
          name: item.values[i].name,
          ids: item.values[i].id,
          id: item.values[i].id,
          has_sub: item.values[i].has_sub,
          has_template: item.values[i].has_template
        });
      }

    }
    return (
      <DismissKeyboard>
        <View>
          {/* <Spinner
          visible={this.state.showCategorySpinner}
          textContent={''}
          animation='slide'
        /> */}


          {/* Make */}
          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}>{item.is_required ? item.title + " * " : item.title}</Text>
          </View>
          <SearchableDropdown
            // selectedItems={categories[0].name}
            onItemSelect={(item, index) => {
              const items = this.state.selectedItems;
              items.push(item)
              this.setState({ selectedItems: items });
              // const items = this.state.selectedItems;
              let { orderStore } = Store;


              // if (idsArray.length != 0)
              this.setState({ categoryId: item.id, showCategoryError: false });

              if (item.has_sub) {
                this.getSubCategories(item.id);
              }
              this.setState({ showSubCategories: false, showSubSubCategories: false, showSubSubSubCategories: false, });

              if (item.has_template) {
                orderStore.optionSelectedModel.hasTemp = true;
              }
              else
                orderStore.optionSelectedModel.hasTemp = false;
              orderStore.optionSelectedModel.categoryId = item.id;
              orderStore.setOnDynamicOptionSeleted(true);
            }}
            containerStyle={{ paddingTop: 10 }}
            onRemoveItem={(item, index) => {
              this.setState({ categoryId: '', showCategoryError: true });
              const items = this.state.selectedItems.filter((sitem) => sitem.id !== item.id);
              this.setState({ selectedItems: items });
            }}
            itemStyle={styles.searchableDropdown}
            itemTextStyle={styles.dropDownTextStyle}
            itemsContainerStyle={{ maxHeight: 140, borderColor: Appearences.Colors.lightGrey, borderWidth: 1, borderRadius: 5 }}
            items={categories}
            defaultIndex={0}
            resetValue={false}
            textInputProps={
              {
                placeholder: "Search Categories",
                underlineColorAndroid: 'transparent',
                textAlign: Appearences.Rtl.enabled ? 'right' : 'left',
                placeholderTextColor: Appearences.Registration.textColor,
                style: showCategoryError && categoryId === '' ? styles.TextInputError : styles.TextInput,
                onTextChange: text => text === '' ? this.setState({ showCategoryError: true, categoryId: '', showCarMakeError: true, carMakeId: '' }) : console.log(text)
              }
            }
            listProps={
              {
                nestedScrollEnabled: true,
              }
            }
          />
          {
            this.state.showCategorySpinner ?
              <ActivityIndicator
                size="small"
                style={{ position: 'absolute', zIndex: 10, alignSelf: 'center', right: '5%', bottom: '15%', }}
              /> : null
          }


        </View>
      </DismissKeyboard>
    );
  }

  getSubCategoriesView = () => {
    const { showCarMakeError, carMakeId } = this.state;
    var names = [];
    var ids = [];
    var hasSubs = [];
    var hasTemplate = [];
    var subCategories = [];
    this.state.subCategories.map((item, index) => {
      names.push(item.name);
      ids.push(item.id);
      hasSubs.push(item.has_sub);
      hasTemplate.push(item.has_template);
      subCategories.push({
        names: item.name,
        name: item.name,
        ids: item.id,
        id: item.id,
        hasSubs: item.has_sub,
        hasTemplate: item.has_template
      });
    });

    let { orderStore } = Store;
    return (
      <DismissKeyboard>
        <View >
          <SearchableDropdown
            onItemSelect={(item, index) => {
              // const items = this.state.selectedItems;
              let { orderStore } = Store;
              // if (ids[index].length != 0)
              this.setState({ categoryId: ids[index], carMakeId: ids[index], showCarMakeError: false });

              if (hasSubs[index]) {
                this.getSubSubCategories(ids[index]);
              }

              this.setState({ showSubSubCategories: false, showSubSubSubCategories: false });
              if (hasTemplate[index]) {
                orderStore.optionSelectedModel.hasTemp = true;

              }
              else
                orderStore.optionSelectedModel.hasTemp = false;
              orderStore.optionSelectedModel.categoryId = ids[index];
              orderStore.setOnDynamicOptionSeleted(true);
            }}
            containerStyle={{ paddingTop: 5 }}
            onRemoveItem={(item, index) => {
              this.setState({ showCarMakeError: true, carMakeId: '' });
              const items = this.state.selectedItems.filter((sitem) => sitem.id !== item.id);
              this.setState({ selectedItems: items });
            }}
            itemStyle={styles.searchableDropdown}
            itemTextStyle={styles.dropDownTextStyle}
            itemsContainerStyle={{ maxHeight: 140, borderColor: Appearences.Colors.lightGrey, borderWidth: 1, borderRadius: 5 }}
            items={subCategories}
            // defaultIndex={0}
            resetValue={false}
            textInputProps={
              {
                placeholder: "Search Car Make",
                underlineColorAndroid: 'transparent',
                textAlign: Appearences.Rtl.enabled ? 'right' : 'left',
                placeholderTextColor: Appearences.Registration.textColor,
                style: showCarMakeError ?? carMakeId === '' ? styles.TextInputError : styles.TextInput,
                onTextChange: text => console.log(text)
              }
            }
            listProps={
              {
                nestedScrollEnabled: true,
              }
            }
          />
          {
            this.state.showCategorySpinner ?
              <ActivityIndicator
                size="small"
                style={{ position: 'absolute', zIndex: 10, alignSelf: 'center', right: '10%', bottom: '25%', }}
              /> : null
          }



        </View>
      </DismissKeyboard>
    );
  }


  getSubSubCategoriesView = () => {
    var names = [];
    var ids = [];
    var hasSubs = [];
    var hasTemplate = [];
    this.state.subSubCategories.map((item, index) => {
      names.push(item.name);
      ids.push(item.id);
      hasSubs.push(item.has_sub);
      hasTemplate.push(item.has_template);

    });

    let { orderStore } = Store;
    return (
      <DismissKeyboard>
        <View>


          <TouchableOpacity onPress={() => {
            this.subSubRef.show();
          }}
            style={styles.row}
          >
            <ModalDropdown
              options={names}
              ref={el => this.subSubRef = el}
              style={styles.pickerContainer}
              dropdownStyle={styles.dorpDownStyle}
              dropdownTextHighlightStyle={styles.dropDownTextStyle}
              textStyle={styles.dorpdownContainerTextStyle}
              defaultValue={orderStore.settings.extra.select}
              onSelect={(index, value) => {
                let { orderStore } = Store;

                if (ids[index].length != 0)
                  this.setState({ categoryId: ids[index] });

                if (hasSubs[index]) {
                  this.getSubSubSubCategories(ids[index]);
                }

                this.setState({ showSubSubSubCategories: false });

                if (hasTemplate[index]) {
                  orderStore.optionSelectedModel.hasTemp = true;
                }
                else
                  orderStore.optionSelectedModel.hasTemp = false;
                orderStore.optionSelectedModel.categoryId = ids[index];
                orderStore.setOnDynamicOptionSeleted(true);

              }}
              renderSeparator={() => {
                return (<View style={{
                  width: 0,
                  height: 0,
                }} />);
              }}

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
      </DismissKeyboard>
    );
  }
  getSubSubSubCategoriesView = () => {
    var names = [];
    var ids = [];
    var hasSubs = [];
    var hasTemplate = [];
    this.state.subSubSubCategories.map((item, index) => {
      names.push(item.name);
      ids.push(item.id);
      hasSubs.push(item.has_sub);
      hasTemplate.push(item.has_template);

    });

    let { orderStore } = Store;
    return (
      <DismissKeyboard>
        <View>



          <TouchableOpacity onPress={() => {
            this.subSubSubRef.show();
          }}
            style={styles.row}
          >
            <ModalDropdown
              options={names}
              ref={el => this.subSubSubRef = el}
              style={styles.pickerContainer}
              dropdownStyle={styles.dorpDownStyle}
              dropdownTextHighlightStyle={styles.dropDownTextStyle}
              textStyle={styles.dorpdownContainerTextStyle}
              defaultValue={orderStore.settings.extra.select}
              onSelect={(index, value) => {
                let { orderStore } = Store;
                if (ids[index].length != 0)
                  this.setState({ categoryId: ids[index] });

                if (hasTemplate[index]) {
                  orderStore.optionSelectedModel.hasTemp = true;

                }
                else
                  orderStore.optionSelectedModel.hasTemp = false;
                orderStore.optionSelectedModel.categoryId = ids[index];
                orderStore.setOnDynamicOptionSeleted(true);

              }}
              renderSeparator={() => {
                return (<View style={{
                  width: 0,
                  height: 0,
                }} />);
              }}

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
      </DismissKeyboard>
    );
  }


  onImageClick = (index) => {
    this.setState({ currentImage: index, isImageViewVisle: true })
  }
  deleteImage = async () => {
    this.setState({ hideImageIndicator: false, showConfirmDialogue: false });

    let { orderStore } = Store;
    const params = { ad_id: orderStore.settings.data.ad_id, img_id: imageId };
    const response = await Api.post("post_ad/image/delete", params);
    if (response.success === true) {
      var fullImages = [];
      for (var i = 0; i < response.data.ad_images.length; i++) {
        var model = {};
        model.thumb = response.data.ad_images[i].thumb;
        model.id = response.data.ad_images[i].img_id;
        fullImage = { url: response.data.ad_images[i].thumb };
        fullImages.push(fullImage);
      }

      this.setState({ images: response.data.ad_images, fullImages: fullImages });
    }
    this.setState({ hideImageIndicator: true });
    if (response.message.length != 0)
      Toast.show(response.message);
  }




  getPageOne = (item, index) => {
    let { orderStore } = Store;
    switch (item.type) {

      case "textfield":
        if (item.fieldTypeName == 'ad_price') {
          if (this.state.showPriceOnly)
            return (
              <DismissKeyboard>
                <View>
                  <View style={styles.headingTextContainer}>
                    <Text style={styles.subHeading}>{item.isRequired ? item.title + " * " : item.title}</Text>
                  </View>
                  <TextInput style={item.showError ? styles.TextInputError : styles.TextInput}
                    underlineColorAndroid='transparent'
                    textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                    keyboardType="numeric"
                    returnKeyType="done"
                    placeholderTextColor={Appearences.Registration.textColor}
                    placeholder={"eg, Toyota hilux 2002"}
                    onChangeText={(message) => {
                      let stateClone = [...this.state.pageOne];
                      stateClone[index].value = message;
                      if (message.length != 0 && item.isRequired) {
                        stateClone[index].showError = false;
                      }
                      this.setState({ pageOne: stateClone })
                    }}
                  ></TextInput>
                </View>
              </DismissKeyboard>
            );
          else return null;

        }
        return (
          <DismissKeyboard>
            <View>
              <View style={styles.headingTextContainer}>
                <Text style={styles.subHeading}>{item.isRequired ? item.title + " * " : item.title}</Text>
              </View>
              <TextInput style={item.showError ? styles.TextInputError : styles.TextInput}
                underlineColorAndroid='transparent'
                value={this.state.pageOne[index].value}
                textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                placeholderTextColor={Appearences.Registration.textColor}
                placeholder={"eg, Toyota hilux 2002"}
                onChangeText={(message) => {
                  let stateClone = [...this.state.pageOne];
                  if (message.length != 0 && item.isRequired) {
                    stateClone[index].showError = false;
                  }
                  stateClone[index].value = message;
                  this.setState({ pageOne: stateClone })
                }}

              >
              </TextInput>
            </View>
          </DismissKeyboard>
        );




      // new code
      case "textarea":
        return (
          <DismissKeyboard>
            <View>
              <View style={styles.headingTextContainer}>
                <Text style={styles.subHeading}>{item.isRequired ? item.title + " * " : item.title}</Text>
              </View>
              <TextInput style={item.showError ? styles.TextInputMultilineError : styles.TextInputMultiline}
                underlineColorAndroid='transparent'
                multiline={true}
                numberOfLines={10}
                value={this.state.pageOne[index].value}
                textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                placeholderTextColor={Appearences.Registration.textColor}
                placeholder={"eg, Toyota hilux 2002"}
                onChangeText={(message) => {
                  let stateClone = [...this.state.pageOne];
                  if (message.length != 0 && item.isRequired) {
                    stateClone[index].showError = false;
                  }
                  stateClone[index].value = message;
                  this.setState({ pageOne: stateClone })
                }}

              >
              </TextInput>
            </View>
          </DismissKeyboard>
        );
      // new code


      case "select":
        if (item.data.field_type_name === "ad_price_type") {
          return this.getPriceTypeField(item.data);
        }
        if (item.data.field_type_name === "ad_cats1")
          return this.getCategories(item.data);
        else {
          const reference = index;
          const data = item;
          var names = [];
          var ids = [];

          data.values.map((item, index) => {
            names.push(item.name);
            if (item.value == undefined)
              ids.push("");
            else
              ids.push(item.value);

          });
          return (
            <DismissKeyboard>
              <View key={index}>

                <View style={styles.headingTextContainer}>
                  <Text style={styles.subHeading}>{item.isRequired ? data.title + " * " : data.title}</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  reference.show();
                }}
                  style={styles.row}
                >
                  <ModalDropdown
                    options={names}
                    ref={el => reference = el}
                    style={item.showError ? styles.pickerContainerError : styles.pickerContainer}
                    // dropdownStyle={{
                    //   width: '92%',
                    //   marginStart: -15,
                    //   height: ((names.length * 27) + 27),
                    //   elevation: 1,
                    //   shadowOpacity: 0.1,
                    // }}
                    dropdownStyle={{
                      width: '92%',
                      marginStart: -15,

                      // height: ((names.length * 27) + 27)>'80%'?'80%': ((names.length * 27) + 27),
                      // elevation: 1,
                      // shadowOpacity: 0.1,
                    }}

                    dropdownTextHighlightStyle={styles.dropDownTextStyle}
                    textStyle={styles.dorpdownContainerTextStyle}
                    defaultValue={item.selectedValue}
                    onSelect={(innerIndex, value) => {
                      item.selectedValue = names[innerIndex];
                      item.selectedId = ids[innerIndex];
                      if (item.selectedId.length != 0) {
                        var clone = [...this.state.pageOne];
                        clone[index].showError = false;
                        this.setState({ pageOne: selecStateClone });
                      }


                    }}
                    renderSeparator={() => {
                      return (<View style={{
                        width: 0,
                        height: 0,
                      }} />);
                    }}

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
            </DismissKeyboard>
          );
        }
      case "checkbox":
        const data = item;
        return (
          <DismissKeyboard>
            <View key={index}>

              <View style={styles.headingTextContainer}>
                <Text style={styles.subHeading}>{item.isRequired ? data.title + "*" : data.title}</Text>
              </View>
              <View style={item.showError ? s.featuresContainerError : s.featuresContainer}>
                {
                  data.values.map((item, key) => (

                    <CheckBox
                      checkedColor={orderStore.color}
                      uncheckedColor={Appearences.Colors.headingGrey}
                      title={item.name}
                      key={key}
                      checked={item.is_checked
                        //false

                        //false
                      }
                      containerStyle={s.checkBox}
                      size={Appearences.Fonts.paragraphFontSize}
                      textStyle={s.checkBoxText}
                      key={key}
                      onPress={() => {
                        let checkBoxClone = [...this.state.pageOne];
                        checkBoxClone[index].values[key].is_checked = !item.is_checked;
                        checkBoxClone[index].showError = false;
                        this.setState({ pageOne: checkBoxClone });

                      }}>
                    </CheckBox>

                  )
                  )}
              </View>

            </View>
          </DismissKeyboard>
        );


    }

  }

  render() {
    // console.warn("Cat id :" + this.state.categoryId);
    let { orderStore } = Store;

    if (orderStore.onFirstPageChange) {
      this.createData();
    }
    if (this.props.onNextClick) {
      if (orderStore.isFirstPageClear)
        this.props.callBackFunc();
    }


    // if (this.state.showSpinner)
    //   return (
    //     <Spinner
    //       visible={this.state.showSpinner}
    //       textContent={''}
    //       animation='slide'
    //     />

    //   );


    let data = orderStore.settings.data;
    let fields = [...data.fields];
    let extra = data.extra;
    let imageExtra = orderStore.settings.extra;

    return (
      <DismissKeyboard>
        <View style={{ height: '100%', backgroundColor: 'white' }}>

          <Modal visible={this.state.isImageViewVisle}
            onRequestClose={() => { this.setState({ isImageViewVisle: false }) }}
            transparent={true}>
            <ImageViewer
              imageUrls={this.state.fullImages}
              index={this.state.currentImage}
              enableSwipeDown={true}
              onSwipeDown={() => { this.setState({ isImageViewVisle: false }) }}
            />

          </Modal>

          <ScrollView
            keyboardShouldPersistTaps='always'
            contentContainerStyle={{
              backgroundColor: 'white',
              paddingBottom: 50,
            }}>
            <View style={styles.container}>



              {

                this.state.pageOne.map((item, key) => (
                  <View key={key}>
                    {this.getPageOne(item, key)}
                  </View>
                ))

              }

              {this.state.showSubCategories ? this.getSubCategoriesView() : null}
              {this.state.showSubSubCategories ? this.getSubSubCategoriesView() : null}
              {this.state.showSubSubSubCategories ? this.getSubSubSubCategoriesView() : null}



              <View style={styles.headingTextContainer}>
                <Text style={styles.subHeading}>{imageExtra.image_text + " * "}</Text>
              </View>


              <TouchableOpacity
                onPress={

                  // () => {
                  this.showActionSheet
                  // ImagePicker.openPicker({
                  //   multiple: true
                  // }).then(images => {
                  //   this.uploadMultipleImages(images);
                  // });
                  // }

                }
                style={this.state.showImageError ? styles.fileUploadContainerError : styles.fileUploadContainer}>
                <Visibility hide={!this.state.hideImageIndicator}>
                  {this.state.fullImages.length === 0 ? <Text style={styles.fileUploadText}>{ }</Text> : null}
                </Visibility>
                <Visibility
                  hide={this.state.hideImageIndicator}
                  style={styles.fileUploadLoaderAbsoluteContainer}
                >
                  <Progress.Circle
                    size={Appearences.Fonts.headingFontSize + 20}
                    indeterminate={true}
                    color={orderStore.color} />
                </Visibility>

                <View style={styles.fileListAbsoluteContainer}>

                  <DraggableFlatList
                    data={this.state.images}
                    horizontal={true}
                    renderItem={this.renderItem}
                    scrollPercent={5}
                    onMoveEnd={({ data }) => this.setState({ images: data })}
                    showsHorizontalScrollIndicator={false}

                    keyExtractor={item => item.img_id}
                  >
                  </DraggableFlatList>

                </View>

              </TouchableOpacity>

              <Text style={{ marginTop: 5, color: Appearences.Colors.headingGrey, fontSize: Appearences.Fonts.paragraphFontSize }}>{imageExtra.sort_image_msg}</Text>








            </View>
            <ConfirmDialogue
              visible={this.state.showConfirmDialogue}
              onConfirm={() => { this.deleteImage() }}
              onCancel={() => { this.setState({ showConfirmDialogue: false }) }}
            />
            <ActionSheet
              ref={o => this.ActionSheet = o}
              title={'Select Photos'}
              options={['Select from Camera', 'Select from Library', 'Cancel']}
              cancelButtonIndex={2}
              destructiveButtonIndex={2}
              onPress={(index) => {
                if (index == 0) {
                  ImagePicker.openCamera({
                    mediaType: 'photo',
                    width: 500,
                    height: 500,
                    includeExif: true
                  }).then(images => {
                    this.uploadMultipleImages(images);
                  });
                }
                if (index == 1) {
                  ImagePicker.openPicker({
                    multiple: true
                  }).then(images => {
                    this.uploadMultipleImages(images);
                  });
                }
                // console.log('index',index)
              }}
            />
          </ScrollView>


        </View>
      </DismissKeyboard>
    );



  }


  checkPageClear = () => {
    // console.warn(this.state.categoryId);
    let { orderStore } = Store;
    let areStaticFieldsClear = true;
    if (this.state.categoryId.length === 0) {
      this.setState({ showCategoryError: true });
      this.categoryClear = false;
    }
    else {
      this.setState({ showCategoryError: false });
      this.categoryClear = true;
    }
    if (this.state.carMakeId.length === 0) {
      this.setState({ showCarMakeError: true });
      this.carMakeClear = false;
    }
    else {
      this.setState({ showCarMakeError: false });
      this.carMakeClear = true;
    }
    for (var i = 0; i < this.state.pageOne.length; i++) {

      if (this.state.pageOne[i].showError) {
        areStaticFieldsClear = false;
        if (this.state.pageOne[i].fieldTypeName === "ad_cats1")
          continue;
        areStaticFieldsClear = false;
      }

    }

    if (this.categoryClear && this.carMakeClear && this.isImagesClear && areStaticFieldsClear) {
      orderStore.isFirstPageClear = true;
    }
    else {
      orderStore.isFirstPageClear = false;
      Toast.show("Please Fill All The Required Fields");
    }


  }
  createData = async () => {
    let pageOneClone = [...this.state.pageOne];
    let { orderStore } = Store;

    if (this.categoryClear) {
      const data = { ad_cats1: this.state.categoryId }
      orderStore.postAdObject = Object.assign(orderStore.postAdObject, data)

    }

    for (var i = 0; i < this.state.pageOne.length; i++) {

      const data = this.state.pageOne[i];
      switch (data.type) {

        case "checkbox":
          let values = [];
          let valuesClone = [...this.state.pageOne[i].values]
          for (var j = 0; j < valuesClone.length; j++) {
            if (valuesClone[j].is_checked)
              values.push(valuesClone[j].name);

          }
          if (values.length === 0 && this.state.pageOne[i].isRequired) {
            pageOneClone[i].showError = true;
            this.setState({ pageOne: pageOneClone });
          }

          else {
            pageOneClone[i].showError = false;
            this.setState({ pageOne: pageOneClone });
            let data = {};
            data[this.state.pageOne[i].fieldTypeName] = values;
            orderStore.postAdObject = Object.assign(orderStore.postAdObject, data);
          }
          break;


        case "select":
          if (this.state.pageOne[i].data.field_type_name === "ad_cats1") {


          }
          else {
            if (this.state.pageOne[i].selectedId.length != 0) {
              var dynamicKey = {};
              const data = this.state.pageOne[i];
              dynamicKey[data.fieldTypeName] = this.state.pageOne[i].selectedId;
              orderStore.postAdObject = Object.assign(orderStore.postAdObject, dynamicKey)
              pageOneClone[i].showError = false;
              this.setState({ pageOne: pageOneClone });
            }
            else {
              if (this.state.pageOne[i].isRequired) {
                pageOneClone[i].showError = true;
                this.setState({ pageOne: pageOneClone });
              }
            }
          }
          break;
        case "textfield":
          if (this.state.pageOne[i].value.length != 0) {
            var dynamicKey = {};
            dynamicKey[this.state.pageOne[i].fieldTypeName] = this.state.pageOne[i].value;
            orderStore.postAdObject = Object.assign(orderStore.postAdObject, dynamicKey);
            pageOneClone[i].showError = false;
            this.setState({ pageOne: pageOneClone });
          }
          else {
            if (this.state.pageOne[i].isRequired) {
              if (!this.state.showPriceOnly && pageOneClone[i].fieldTypeName === "ad_price")
                pageOneClone[i].showError = false;
              else
                pageOneClone[i].showError = true;
              this.setState({ pageOne: pageOneClone });
            }
          }

          break;

        // new code
        case "textarea":
          if (this.state.pageOne[i].value.length != 0) {
            var dynamicKey = {};
            dynamicKey[this.state.pageOne[i].fieldTypeName] = this.state.pageOne[i].value;
            orderStore.postAdObject = Object.assign(orderStore.postAdObject, dynamicKey);
            pageOneClone[i].showError = false;
            this.setState({ pageOne: pageOneClone });
          }
          else {
            if (this.state.pageOne[i].isRequired) {

              pageOneClone[i].showError = true;
              this.setState({ pageOne: pageOneClone });
            }
          }
          break;
        // new code

      }



    }
    if (this.state.images.length === 0) {
      this.setState({ showImageError: true });
      this.isImagesClear = false;

    }
    else if (this.state.images.length != 0) {
      this.setState({ showImageError: false });
      this.isImagesClear = true;
    }
    this.checkPageClear();
    // console.warn(JSON.stringify(orderStore.postAdObject));

  }
  getPriceTypeField = () => {

    let { orderStore } = Store;
    let priceType = orderStore.settings.extra.price_type_data;
    let extra = orderStore.settings.extra;
    var valuesArray = [];
    var idsArray = [];
    var isShow = [];
    for (var i = 0; i < priceType.length; i++) {

      valuesArray.push(priceType[i].val);
      idsArray.push(priceType[i].key);
      isShow.push(priceType[i].is_show);
    }

    return (
      <DismissKeyboard>
        <View>

          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}>{extra.price_type_title + " * "}</Text>
          </View>
          <TouchableOpacity onPress={() => {
            this.priceTypeRef.show();
          }}
            style={styles.row}
          >
            <ModalDropdown
              options={valuesArray}
              ref={el => this.priceTypeRef = el}
              style={this.state.showPriceTypeError ? styles.pickerContainerError : styles.pickerContainer}
              dropdownStyle={{
                width: '92%',
                marginStart: -15,
                height: ((valuesArray.length * 27) + 27),
                elevation: 1,
                shadowOpacity: 0.1,
              }}

              dropdownTextHighlightStyle={styles.dropDownTextStyle}
              textStyle={styles.dorpdownContainerTextStyle}
              defaultValue={valuesArray[0]}
              onSelect={(index, value) => {

                this.setState({ priceTypeId: idsArray[index], showPriceOnly: isShow[index] });
              }}
              renderSeparator={() => {
                return (<View style={{
                  width: 0,
                  height: 0,
                }} />);
              }}

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
      </DismissKeyboard>
    );

  }






  componentDidUpdate = () => {
    let { orderStore } = Store;
    orderStore.setOnFirstPageChangeListener(false);

  }

}






