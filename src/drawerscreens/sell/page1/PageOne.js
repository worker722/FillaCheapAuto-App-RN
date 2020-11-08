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
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import Appearences from '../../../config/Appearences';
import styles from './Styles';
import Store from '../../../Stores';
import Toast from 'react-native-simple-toast';
import Api from '../../../network/Api';
import Spinner from 'react-native-loading-spinner-overlay';
import ModalDropdown from 'react-native-modal-dropdown';
import SearchableDropdown from '../../../../src/components/react-native-searchable-dropdown';
import s from '../page3/Styles';
import Visibility from '../../../components/Visibility';
import ImageViewer from 'react-native-image-zoom-viewer';
import ImagePicker from 'react-native-image-crop-picker';
import * as Progress from 'react-native-progress';
import ConfirmDialogue from '../../../components/ConfirmDialogue';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { observer } from 'mobx-react';
import ActionSheet from 'react-native-actionsheet'
import { log } from 'react-native-reanimated';

var imageId;

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);
// @observer
export default class PageOne extends Component<Props> {
  isCategoryRequired = false;
  isTitleRequired = false;
  categoryClear = true;
  carMakeClear = true;
  titleClear = true;

  constructor(props) {

    super(props);


    this.state = {
      showPriceOnly: true,
      showSpinner: false,
      showCategorySpinner: false,
      categoryId: "",
      carMakeId: "",
      showCategoryError: false,
      showCarMakeError: false,
      showImageError: false,
      images: [],

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
      showPriceTypeError: false,
      priceTypeId: "",

      pageOne: [],

      selectedTag: 'body',
      selectedStyles: [],
      selectedItems: [],




    };
    this.editor = null;

  }

  showActionSheet = () => {
    // console.log('xxxxx')
    this.ActionSheet.show()
  }

  componentDidMount = () => {
    let { orderStore } = Store;
    let priceType = orderStore.sell.extra.price_type_data;
    if (priceType[0].key != undefined) {
      this.setState({ priceTypeId: priceType[0].key, showPriceOnly: priceType[0].is_show });
    }
    const imagesArray = orderStore.sell.data.ad_images;
    if (imagesArray.length != 0) {
      var images = [];
      var fullImages = [];
      for (var i = 0; i < imagesArray.length; i++) {
        var model = {};
        var fullImage;
        model.thumb = imagesArray[i].thumb;
        model.id = imagesArray[i].img_id;
        images.push(model);
        fullImages.push({ url: imagesArray[i].thumb });
      }
      this.setState({ images: orderStore.sell.data.ad_images, fullImages: fullImages });

    }
    this.setState({ pageOne: orderStore.innerResponse.pageOne });
  }


  uploadMultipleImages = async (images) => {
    // console.log('images are',images)
    this.setState({ hideImageIndicator: false });
    let { orderStore } = Store;
    const response = await Api.postImageMulti("post_ad/image", "file", images, "ad_id", orderStore.sell.data.ad_id);
    if (response.success === true) {
      var images = [];
      var fullImages = [];
      for (var i = 0; i < response.data.ad_images.length; i++) {
        var model = {};
        model.thumb = response.data.ad_images[i].thumb;
        model.id = response.data.ad_images[i].img_id;
        images.push(model);
        fullImages.push({ url: response.data.ad_images[i].thumb });
      }
      // console.log('images ->', response.data.ad_images)
      // console.log('full images ->', fullImages)
      // console.log('full images ->',fullImages)
      this.setState({ images: response.data.ad_images, fullImages: fullImages, showImageError: false });
    }
    this.setState({ hideImageIndicator: true });
    if (response.message.length != 0)
      Toast.show(response.message);
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
      this.setState({ showCategorySpinner: false, subCategories: tempArray, showSubCategories: true, });

    }
    if (response.message.length != 0)
      setTimeout(() => {
        Toast.show(response.message);
      }, 1000)

    // console.log('show category spinner turning off')

    this.setState({ showCategorySpinner: false }, () => {
      this.setState({ showCategorySpinner: false })
    });

    // console.log('show category spinner turning ofxf')


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
      this.setState({ showCategorySpinner: false, subSubSubCategories: tempArray, showSubSubSubCategories: true, });

    }
    if (response.message.length != 0)
      setTimeout(() => {
        Toast.show(response.message);
      }, 1000)
    // console.log('show category spinner turning off')

    this.setState({ showCategorySpinner: false }, () => {
      this.setState({ showCategorySpinner: false })
    });
    // console.log('show category spinner turning ofxf')


  }
  renderItem = ({ item, index, move, moveEnd, isActive }) => {
    // console.log('****************** INSIDE RENDER *******************')
    // console.log('item', JSON.stringify(item))
    // console.log('index', index)
    // console.log('move', move)
    // console.log('moveEnd', moveEnd)
    // console.log('****************************************************')

    return (
      <DismissKeyboard>
        <TouchableOpacity style={styles.fileThumb}

          key={index}
          //onPress = {()=>{this.onImageClick(index)}}
          onLongPress={move}
          onPressOut={moveEnd}
        >
          <Image source={{ uri: item.thumb + '?date=' + (new Date()).getTime() }}
            style={styles.image}
            key={index}

          />
          <View style={styles.fileThumbAbsolute}>
            <TouchableOpacity
              onPress={() => {
                imageId = item.img_id;
                this.setState({ showConfirmDialogue: true })

              }
              }
              style={{ backgroundColor: 'white', width: 25, height: 25, alignItems: 'center', justifyContent: 'center' }}>
              <Image style={styles.fileThumbCrossImage}
                source={require('../../../../res/images/cross_red.png')}

              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </DismissKeyboard>
    );
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
      this.setState({ showCategorySpinner: false, subSubCategories: tempArray, showSubSubCategories: true, });

    }
    if (response.message.length != 0)
      setTimeout(() => {
        Toast.show(response.message);
      }, 1000)
    // console.log('show category spinner turning off')
    this.setState({ showCategorySpinner: false }, () => {
      this.setState({ showCategorySpinner: false })
    });
    // console.log('show category spinner turning ofxf')


  }



  onStyleKeyPress = (toolType) => {
    this.editor.applyToolbar(toolType);
  }

  onSelectedTagChanged = (tag) => {
    this.setState({
      selectedTag: tag
    })
  }

  onSelectedStyleChanged = (styles) => {
    this.setState({
      selectedStyles: styles,
    })
  }





  getPriceTypeField = () => {

    let { orderStore } = Store;
    let priceType = orderStore.sell.extra.price_type_data;
    let extra = orderStore.sell.extra;
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
              dropdownStyle={styles.dorpDownStyle}
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
  getCategories = (item) => {
    const { showCategoryError, categoryId } = this.state;
    this.isCategoryRequired = item.is_required;
    // Keyboard.dismiss()
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

    // if(this.state.showCategorySpinner){
    //  return( 
    // }
    // console.log('here state is', this.state)
    // console.log(item.values);
    return (

      <DismissKeyboard>



        <View>


          {/* Make */}
          <View style={[styles.headingTextContainer]}>
            <Text style={styles.subHeading}>{item.is_required ? item.title + " * " : item.title}</Text>


          </View>

          <SearchableDropdown
            selectedItems={this.state.selectedItems}
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
              console.log("remove category")
            }}
            itemStyle={styles.searchableDropdown}
            itemTextStyle={styles.dropDownTextStyle}
            itemsContainerStyle={{ maxHeight: 140, borderColor: Appearences.Colors.lightGrey, borderWidth: 1, borderRadius: 5 }}
            items={categories}
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
    // alert('hello');
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
            // defaultIndex={2}
            resetValue={false}
            textInputProps={
              {
                placeholder: "Search Car Make",
                underlineColorAndroid: 'transparent',
                textAlign: Appearences.Rtl.enabled ? 'right' : 'left',
                placeholderTextColor: Appearences.Registration.textColor,
                style: showCarMakeError ?? carMakeId === '' ? styles.TextInputError : styles.TextInput,
                onTextChange: text => text === '' ? this.setState({ showCarMakeError: true, carMakeId: '' }) : console.log(text)
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
    alert('getSubSubCategoriesView');
    var names = [];
    var ids = [];
    var hasSubs = [];
    var hasTemplate = [];
    var SubSubCategories = [];
    this.state.subSubCategories.map((item, index) => {
      names.push(item.name);
      ids.push(item.id);
      hasSubs.push(item.has_sub);
      hasTemplate.push(item.has_template);
      SubSubCategories.push({
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
        <View>
          <SearchableDropdown
            onItemSelect={(item, index) => {
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
            containerStyle={{ padding: 5 }}
            onRemoveItem={(item, index) => {
              const items = this.state.selectedItems.filter((sitem) => sitem.id !== item.id);
              this.setState({ selectedItems: items });
            }}
            itemStyle={styles.searchableDropdown}
            itemTextStyle={styles.dropDownTextStyle}
            itemsContainerStyle={{ maxHeight: 140, borderColor: Appearences.Colors.lightGrey, borderWidth: 1, borderRadius: 5 }}
            items={SubSubCategories}
            defaultIndex={2}
            resetValue={false}
            textInputProps={
              {
                placeholder: "Search sub car make",
                underlineColorAndroid: "transparent",
                style: styles.TextInput,
                onTextChange: text => console.log(text)
              }
            }
            listProps={
              {
                nestedScrollEnabled: true,
              }
            }
          />
        </View>
      </DismissKeyboard>
    );
  }
  getSubSubSubCategoriesView = () => {
    var names = [];
    var ids = [];
    var hasSubs = [];
    var hasTemplate = [];
    var SubSubSubCategories = [];
    this.state.subSubSubCategories.map((item, index) => {
      names.push(item.name);
      ids.push(item.id);
      hasSubs.push(item.has_sub);
      hasTemplate.push(item.has_template);
      SubSubSubCategories.push({
        names: item.name,
        ids: item.id,
        hasSubs: item.has_sub,
        hasTemplate: item.has_template,
      });
    });

    let { orderStore } = Store;
    return (
      <DismissKeyboard>
        <View>

          <SearchableDropdown
            onItemSelect={(item, index) => {
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
            containerStyle={{ padding: 5 }}
            onRemoveItem={(item, index) => {
              const items = this.state.selectedItems.filter((sitem) => sitem.id !== item.id);
              this.setState({ selectedItems: items });
            }}
            itemStyle={styles.searchableDropdown}
            itemTextStyle={styles.dropDownTextStyle}
            itemsContainerStyle={{ maxHeight: 140, borderColor: Appearences.Colors.lightGrey, borderWidth: 1, borderRadius: 5 }}
            items={SubSubSubCategories}
            defaultIndex={2}
            resetValue={false}
            textInputProps={
              {
                placeholder: "Search",
                underlineColorAndroid: "transparent",
                style: {
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                },
                onTextChange: text => console.log(text)
              }
            }
            listProps={
              {
                nestedScrollEnabled: true,
              }
            }
          />




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
    const params = { ad_id: orderStore.sell.data.ad_id, img_id: imageId };
    const response = await Api.post("post_ad/image/delete", params);
    if (response.success === true) {
      var fullImages = [];
      for (var i = 0; i < response.data.ad_images.length; i++) {
        var model = {};
        model.thumb = response.data.ad_images[i].thumb;
        model.id = response.data.ad_images[i].img_id;
        fullImages.push({ url: response.data.ad_images[i].thumb });
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
                    placeholderTextColor={Appearences.Registration.textColor}
                    placeholder={"eg, Toyota hilux 2002"}
                    keyboardType="numeric"
                    returnKeyType="done"

                    onChangeText={(message) => {
                      let stateClone = [...this.state.pageOne];
                      if (message.length != 0 && item.isRequired) {
                        stateClone[index].showError = false;
                      }
                      stateClone[index].value = message;
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
                textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                placeholderTextColor={Appearences.Registration.lightGrey}
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
        if (item.data.field_type_name === "ad_price_type")
          return this.getPriceTypeField();
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
                      // var selecStateClone = [...this.state.selectModel];
                      item.selectedValue = names[innerIndex];
                      item.selectedId = ids[innerIndex];
                      //     this.setState({selectModel:selecStateClone});


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
                      uncheckedColor={Appearences.Colors.black}
                      title={item.name}
                      key={key}
                      checked={item.is_checked}
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


    let data = orderStore.sell.data;
    let fields = [...data.fields];
    let extra = data.extra;
    let imageExtra = orderStore.sell.extra;

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
                  this.showActionSheet

                  // () => {

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
                    extraData={this.state}
                    renderItem={this.renderItem}
                    showsHorizontalScrollIndicator={false}
                    scrollPercent={5}
                    onMoveEnd={({ data }) => this.setState({ images: data })}
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

            // this.manageDynamicFieldsObject();

          }
          if (this.state.pageOne[i].data.field_type_name === "ad_price_type") {
            if (this.state.priceTypeId.length != 0) {
              var dynamicKey = {};
              dynamicKey["ad_price_type"] = this.state.priceTypeId;
              orderStore.postAdObject = Object.assign(orderStore.postAdObject, dynamicKey);
              this.setState({ showPriceTypeError: false });
            }
            else {
              this.setState({ showPriceTypeError: true });
            }
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






  componentDidUpdate = () => {
    let { orderStore } = Store;
    orderStore.setOnFirstPageChangeListener(false);

  }

}






