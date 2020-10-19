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
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import _ from 'lodash'
import Appearences from '../../../config/Appearences';
import styles from './Styles';
import Store from '../../../Stores';
import ModalDropdown from 'react-native-modal-dropdown';
import SearchableDropdown from '../../../../src/components/react-native-searchable-dropdown';
import Spinner from 'react-native-loading-spinner-overlay';
import Api from '../../../network/Api';
import DatePicker from 'react-native-datepicker'
import s from '../page3/Styles';
import { CheckBox } from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import { observer } from 'mobx-react';

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);
// @observer
export default class PageTwo extends Component<Props> {
  isCategoryRequired = false;

  categoryClear = true;

  textFieldClear = true;
  selectClear = true;
  dateClear = true;
  webClear = true;
  checkClear = true;
  areStaticFieldsClear = false;
  constructor() {
    super();


    this.state = {
      subCategories: [],
      subSubCategories: [],
      subSubSubCategories: [],
      showSubCategories: false,
      showSubSubCategories: false,
      showSubSubSubCategories: false,
      categoryId: "",
      showCategoryError: false,
      conditionTypeId: "",
      warrantyTypleId: "",
      adTypeId: "",
      adYearId: "",
      bodyTypeId: "",
      transmissionTypeId: "",
      engineCapacityId: "",
      engineTypeId: "",
      assemblyId: "",
      colorId: "",
      insauranceId: "",
      priceTypeId: "",
      showPriceOnly: true,
      showPriceTypeError: false,
      pageTwo: [],
      textFieldModel: [],
      webModel: [],
      selectModel: [],
      checkboxModel: [],
      dateModel: [],
      showCategorySpinner: false,
      selectedTag: 'body',
      selectedStyles: [],
    }
    this.editor = null;
  }
  componentDidMount = async () => {
    let { orderStore } = Store;
    let priceType = orderStore.sell.extra.price_type_data;
    if (priceType[0].key != undefined) {
      this.setState({ priceTypeId: priceType[0].key, showPriceOnly: priceType[0].is_show });
    }

    this.setState({ pageTwo: orderStore.innerResponse.pageTwo });
    //console.log(JSON.stringify(orderStore.innerResponse.pageTwo));
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
    var priceArr = [];
    for (var i = 0; i < priceType.length; i++) {

      valuesArray.push(priceType[i].val);
      idsArray.push(priceType[i].key);
      isShow.push(priceType[i].is_show);
      priceArr.push({
        val: priceType[i].val,
        key: priceType[i].key,
        is_show: priceType[i].is_show,
        name: priceType[i].val,
        id: priceType[i].key,
        ids: priceType[i].key,
      })
    }

    return (
      <DismissKeyboard>
        <View>

          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}>{extra.price_type_title + " * "}</Text>
          </View>
          {/* <TouchableOpacity onPress={() => {
            this.priceTypeRef.show();
          }}
            style={styles.row}
          >
            <ModalDropdown
              options={valuesArray}
              ref={el => this.priceTypeRef = el}
              style={this.state.showPriceTypeError ? styles.pickerContainerError : styles.pickerContainer}
              // dropdownStyle={{
              //   width: '92%',
              //   marginStart: -15,
              //   height: ((valuesArray.length * 27) + 27),
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
              defaultValue={valuesArray[0]}
              onSelect={(index, value) => {
                if (idsArray[index].length != 0) {
                  this.setState({ showPriceTypeError: false });
                }
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
          </TouchableOpacity> */}
          <SearchableDropdown
            // ref={el => this.priceTypeRef = el}
            onItemSelect={(item, index) => {
              if (idsArray[index].length != 0) {
                this.setState({ showPriceTypeError: false });
              }
              this.setState({ priceTypeId: idsArray[index], showPriceOnly: isShow[index] });
            }}
            containerStyle={styles.row}
            onRemoveItem={(item, index) => {
              const items = this.state.selectedItems.filter((sitem) => sitem.id !== item.id);
              this.setState({ selectedItems: items });
            }}
            itemStyle={styles.searchableDropdown}
            itemTextStyle={styles.dropDownTextStyle}
            itemsContainerStyle={{ maxHeight: 140, borderColor: Appearences.Colors.lightGrey, borderWidth: 1, borderRadius: 5 }}
            items={priceArr}
            defaultIndex={0}
            resetValue={false}
            textInputProps={
              {
                placeholder: "Search For Price Type",
                underlineColorAndroid: 'transparent',
                textAlign: Appearences.Rtl.enabled ? 'right' : 'left',
                placeholderTextColor: Appearences.Registration.textColor,
                style: this.state.showPriceTypeError ? styles.pickerContainerError : styles.pickerContainer,
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






  componentDidUpdate = () => {

    let { orderStore } = Store;
    orderStore.setOnSecondChangeListener(false);

  }


  getPageTwo = (item, index) => {
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
                    keyboardType={'numeric'}
                    returnKeyType="done"
                    placeholderTextColor={Appearences.Registration.textColor}
                    onChangeText={(message) => {
                      let stateClone = [...this.state.pageTwo];
                      if (message.length != 0) {
                        stateClone[index].showError = false;
                      }
                      stateClone[index].value = message;
                      this.setState({ pageTwo: stateClone });
                    }}></TextInput>
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
                keyboardType={item.fieldTypeName === 'ad_mileage' || item.fieldTypeName === 'ad_avg_hwy' || item.fieldTypeName === 'ad_avg_city' ? 'numeric' : 'default'}
                textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                returnKeyType="done"
                placeholderTextColor={Appearences.Registration.textColor}
                onChangeText={(message) => {
                  let stateClone = [...this.state.pageTwo];
                  if (message.length != 0) {
                    stateClone[index].showError = false;
                  }
                  stateClone[index].value = message;
                  this.setState({ pageTwo: stateClone });
                }}></TextInput>
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
                onChangeText={(message) => {
                  let stateClone = [...this.state.pageTwo];
                  if (message.length != 0 && item.isRequired) {
                    stateClone[index].showError = false;
                  }
                  stateClone[index].value = message;
                  this.setState({ pageTwo: stateClone })
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
          let ref = index;
          const data = item;
          var names = [];
          var ids = [];
          var namesSearch = [];

          data.values.map((item, index) => {
            names.push(item.name);
            if (item.value == undefined)
              ids.push("");
            else
              ids.push(item.value);
            namesSearch.push({
              ids: item.value == undefined ? '' : item.value,
              names: item.name,
              name: item.name,
              id: item.value == undefined ? '' : item.value,
              index
            })
          });
          // console.log('==========> item inside',item, '    ', item.showError)

          return (
            <DismissKeyboard>
              <View key={index}>

                <View style={styles.headingTextContainer}>
                  <Text style={styles.subHeading}>{item.isRequired ? data.title + " * " : data.title}</Text>
                </View>
                {/* { item.title === 'Condition' || item.title === 'Ad Type' ? <TouchableOpacity onPress={() => {
                  ref.show();
                }}
                  style={styles.row}
                >


                  <ModalDropdown
                    options={names}
                    ref={el => ref = el}
                    style={item.showError ? styles.pickerContainerError : styles.pickerContainer}
                    scrollEnabled={true}
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
                      if (ids[innerIndex].length != 0) {
                        var selecStateClone = [...this.state.pageTwo];
                        selecStateClone[index].showError = false;
                        this.setState({ pageTwo: selecStateClone });
                      }
                      //     


                    }}
                    renderSeparator={() => {
                      return (<View style={{
                        width: 0,
                        height: 0,
                      }} />);
                    }}
                    keyboardShouldPersistTaps={'always'}
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
                </TouchableOpacity> : */}

                <SearchableDropdown
                  items={namesSearch}
                  onItemSelect={(value, index) => {
                    item.selectedValue = names[value.index];
                    item.selectedId = ids[value.index];
                    if (ids[value.index].length != 0) {
                      var selecStateClone = [...this.state.pageTwo];
                      if (selecStateClone[index]) {
                        selecStateClone[index].showError = false;
                      }
                      this.setState({ pageTwo: selecStateClone });
                    }
                  }}
                  containerStyle={{ paddingTop: 10 }}
                  onRemoveItem={(item, index) => {
                    // this.setState({ categoryId: '', showCategoryError: true });
                    // const items = this.state.selectedItems.filter((sitem) => sitem.id !== item.id);
                    // this.setState({ selectedItems: items });
                  }}
                  itemStyle={styles.searchableDropdown}
                  itemTextStyle={styles.dropDownTextStyle}
                  itemsContainerStyle={{ maxHeight: 140, borderColor: Appearences.Colors.lightGrey, borderWidth: 1, borderRadius: 5 }}
                  resetValue={false}
                  textInputProps={
                    {
                      placeholder: `Search ${item.title}`,
                      underlineColorAndroid: 'transparent',
                      textAlign: Appearences.Rtl.enabled ? 'right' : 'left',
                      placeholderTextColor: Appearences.Registration.textColor,
                      style: item.showError ? styles.pickerContainerError : styles.pickerContainer,
                      onTextChange: text => console.log(text)
                    }
                  }
                  listProps={
                    {
                      nestedScrollEnabled: true,
                    }
                  }
                />
                {/* } */}


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
                <Text style={styles.subHeading}>{item.isRequired ? data.title + " * " : data.title}</Text>
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
                        let checkBoxClone = [...this.state.pageTwo];
                        checkBoxClone[index].showError = false;
                        checkBoxClone[index].values[key].is_checked = !item.is_checked;
                        this.setState({ pageTwo: checkBoxClone });

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



  getDynamicFields = async (categoryId) => {

    let textFieldsTemp = [];
    let selectTemp = [];
    let checkboxTemp = [];
    let dateTemp = [];
    let webTemp = [];
    this.setState({ showCategorySpinner: true });
    let { orderStore } = Store;
    const params = { ad_id: orderStore.sell.data.ad_id, cat_id: categoryId };

    const response = await Api.post("post_ad/dynamic_fields", params);

    if (response.success === true) {
      for (var i = 0; i < response.data.length; i++) {
        if (response.data[i].field_type === "checkbox") {
          let model = { title: "", isRequired: false, fieldTypeName: "", values: [], showError: false, selectedValues: [] }
          model.title = response.data[i].title;
          model.isRequired = response.data[i].is_required;
          model.fieldTypeName = response.data[i].field_type_name;


          for (var j = 0; j < response.data[i].values.length; j++) {

            var valueModel = { name: "", isChecked: false }
            valueModel.name = response.data[i].values[j].name;
            valueModel.isChecked = response.data[i].values[j].is_checked;
            model.values.push(valueModel);
          }
          checkboxTemp.push(model);

        }
        if (response.data[i].field_type === "textfield") {
          let model = { title: "", isRequired: false, fieldTypeName: "", value: "", showError: false };
          model.title = response.data[i].title;
          model.isRequired = response.data[i].is_required;
          model.fieldTypeName = response.data[i].field_type_name;
          textFieldsTemp.push(model);

        }
        if (response.data[i].field_type === "select") {
          let model = { title: "", isRequired: false, fieldTypeName: "", values: [], showError: false, selectedValue: "", selectedId: "" }
          model.title = response.data[i].title;
          model.isRequired = response.data[i].is_required;
          model.fieldTypeName = response.data[i].field_type_name;


          for (var j = 0; j < response.data[i].values.length; j++) {
            if (response.data[i].values[j].value === undefined) {
              var valueModel = { id: "", name: "" }
              valueModel.id = response.data[i].values[j].id;
              valueModel.name = response.data[i].values[j].name;
              if (response.data[i].field_type_name === "ad_price_type") {
                valueModel.isShow = response.data[i].values[j].is_show;
              }
              model.values.push(valueModel);
            }
            else {
              var valueModel = { id: "", name: "" }
              valueModel.id = response.data[i].values[j].value;
              valueModel.name = response.data[i].values[j].name;
              model.values.push(valueModel);
            }
          }
          selectTemp.push(model);
        }
        if (response.data[i].field_type === "date") {
          let model = { title: "", isRequired: false, fieldTypeName: "", value: "", showError: false };
          model.title = response.data[i].title;
          model.isRequired = response.data[i].is_required;
          model.fieldTypeName = response.data[i].field_type_name;
          dateTemp.push(model);

        }
        if (response.data[i].field_type === "link") {
          let model = { title: "", isRequired: false, fieldTypeName: "", value: "", showError: false };
          model.title = response.data[i].title;
          model.isRequired = response.data[i].is_required;
          model.fieldTypeName = response.data[i].field_type_name;
          webTemp.push(model);

        }

      }
      this.setState({
        showCategorySpinner: false, textFieldModel: textFieldsTemp,
        selectModel: selectTemp, checkboxModel: checkboxTemp,
        dateModel: dateTemp, webModel: webTemp,
      });
    }
    await this.checkPageClear('getDynamicFields');

    await this.manageDynamicFieldsObject();


  }

  getCategories = (item) => {
    this.isCategoryRequired = item.is_required;
    var valuesArray = [];
    var idsArray = [];
    for (var i = 0; i < item.values.length; i++) {
      valuesArray.push(item.values[i].name);
      idsArray.push(item.values[i].id);

    }

    return (
      <DismissKeyboard>
        <View>
          <Spinner
            visible={this.state.showCategorySpinner}
            textContent={''}
            animation='slide'
          />


          {/* Make */}
          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}>{this.isCategoryRequired ? item.title + " * " : item.title}</Text>
          </View>
          <TouchableOpacity onPress={() => {
            this.makeDropdownRef.show();
          }}
            style={styles.row}
          >
            <ModalDropdown
              options={valuesArray}
              ref={el => this.makeDropdownRef = el}
              style={this.state.showCategoryError ? styles.pickerContainerError : styles.pickerContainer}
              dropdownStyle={styles.dorpDownStyle}
              dropdownTextHighlightStyle={styles.dropDownTextStyle}
              textStyle={styles.dorpdownContainerTextStyle}
              defaultValue={valuesArray[0]}
              onSelect={(index, value) => {
                if (idsArray[index].length != 0)
                  this.setState({ categoryId: idsArray[index], showCategoryError: false });

                if (item.values[index].has_sub) {

                  this.getSubCategories(idsArray[index]);
                }
                this.checkBoxTemp = [];
                this.setState({ showSubCategories: false, showSubSubCategories: false, showSubSubSubCategories: false, });

                if (item.values[index].has_template) {
                  this.getDynamicFields(idsArray[index]);

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



  getSubCategoriesView = () => {
    var names = [];
    var ids = [];
    var hasSubs = [];
    var hasTemplate = [];
    this.state.subCategories.map((item, index) => {
      names.push(item.name);
      ids.push(item.id);
      hasSubs.push(item.has_sub);
      hasTemplate.push(item.has_template);
    });

    let { orderStore } = Store;
    return (
      <DismissKeyboard>
        <View >
          {/* Model */}

          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}></Text>
          </View>
          <TouchableOpacity onPress={() => {
            this.subRef.show();
          }}
            style={styles.row}
          >
            <ModalDropdown
              options={names}
              ref={el => this.subRef = el}
              style={styles.pickerContainer}
              dropdownStyle={styles.dorpDownStyle}
              dropdownTextHighlightStyle={styles.dropDownTextStyle}
              textStyle={styles.dorpdownContainerTextStyle}
              defaultValue={orderStore.sell.extra.select}
              onSelect={(index, value) => {
                if (ids[index].length != 0)
                  this.setState({ categoryId: ids[index] });


                if (hasSubs[index]) {
                  this.getSubSubCategories(ids[index]);
                }

                this.setState({ showSubSubCategories: false, showSubSubSubCategories: false });
                if (hasTemplate[index]) {
                  this.getDynamicFields(ids[index]);
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

          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}></Text>
          </View>
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
              defaultValue={orderStore.sell.extra.select}
              onSelect={(index, value) => {
                if (ids[index].length != 0)
                  this.setState({ categoryId: ids[index] });

                if (hasSubs[index]) {
                  this.getSubSubSubCategories(ids[index]);
                }

                this.setState({ showSubSubSubCategories: false });

                if (hasTemplate[index]) {
                  this.getDynamicFields(ids[index]);
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


          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}></Text>
          </View>
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
              defaultValue={orderStore.sell.extra.select}
              onSelect={(index, value) => {
                if (ids[index].length != 0)
                  this.setState({ categoryId: ids[index] });

                if (hasTemplate[index]) {
                  this.getDynamicFields(ids[index]);
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

  getTextFields = (item, index) => {
    if (item.fieldTypeName == 'ad_price') {

      if (this.state.showPriceOnly)
        return (
          <DismissKeyboard>
            <View>
              <View style={styles.headingTextContainer}>
                <Text style={styles.subHeading}>{this.state.textFieldModel[index].isRequired ? item.title + " * " : item.title}</Text>
              </View>
              <TextInput style={this.state.textFieldModel[index].showError ? styles.TextInputError : styles.TextInput}
                underlineColorAndroid='transparent'
                textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
                keyboardType="numeric"
                returnKeyType="done"

                placeholderTextColor={Appearences.Registration.textColor}
                onChangeText={(message) => {
                  let stateClone = [...this.state.textFieldModel];
                  if (message.length != 0) {
                    stateClone[index].showError = false;
                  }
                  stateClone[index].value = message;
                  this.setState({ textFieldModel: stateClone });
                }}></TextInput>
            </View>
          </DismissKeyboard>
        );
      else return null;

    }

    return (
      <DismissKeyboard>
        <View>
          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}>{this.state.textFieldModel[index].isRequired ? item.title + " * " : item.title}</Text>
          </View>
          <TextInput style={this.state.textFieldModel[index].showError ? styles.TextInputError : styles.TextInput}
            underlineColorAndroid='transparent'
            textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
            keyboardType={item.fieldTypeName === 'ad_mileage' || item.fieldTypeName === 'ad_avg_hwy' || item.fieldTypeName === 'ad_avg_city' ? 'numeric' : 'default'}
            returnKeyType="done"

            placeholderTextColor={Appearences.Registration.textColor}
            onChangeText={(message) => {
              let stateClone = [...this.state.textFieldModel];
              if (message.length != 0) {
                stateClone[index].showError = false;
              }
              stateClone[index].value = message;
              this.setState({ textFieldModel: stateClone });
            }}
          >
          </TextInput>

        </View>
      </DismissKeyboard>
    );

  }

  getWebLinks = (item, index) => {

    return (
      <DismissKeyboard>
        <View>
          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}>{this.state.webModel[index].isRequired ? item.title + " * " : item.title}</Text>
          </View>
          <TextInput style={this.state.webModel[index].showError ? styles.TextInputError : styles.TextInput}
            underlineColorAndroid='transparent'
            textAlign={Appearences.Rtl.enabled ? 'right' : 'left'}
            placeholderTextColor={Appearences.Registration.textColor}
            onChangeText={(message) => {
              let stateClone = [...this.state.webModel];
              if (message.length != 0) {
                stateClone[index].showError = false;
              }
              stateClone[index].value = message;
              this.setState({ webModel: stateClone });
            }}>

          </TextInput>

        </View>
      </DismissKeyboard>
    );

  }

  getSelectMenu = (data, index, ref) => {
    var names = [];
    var ids = [];
    data.values.map((item, index) => {
      names.push(item.name);
      ids.push(item.id);

    });

    let { orderStore } = Store;
    return (
      <DismissKeyboard>
        <View key={index}>

          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}>{this.state.selectModel[index].isRequired ? data.title + " * " : data.title}</Text>
          </View>
          <TouchableOpacity onPress={() => {
            ref.show();
          }}
            style={styles.row}
          >
            <ModalDropdown
              options={names}
              ref={el => ref = el}
              style={this.state.selectModel[index].showError ? styles.pickerContainerError : styles.pickerContainer}
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
              defaultValue={orderStore.sell.extra.select}
              onSelect={(innerIndex, value) => {
                var selecStateClone = [...this.state.selectModel];
                selecStateClone[index].selectedValue = names[innerIndex];
                selecStateClone[index].selectedId = ids[innerIndex];
                if (ids[innerIndex].length != 0) {
                  selecStateClone[index].showError = false;

                }
                if (data.fieldTypeName === "ad_price_type") {
                  this.setState({ showPriceOnly: data.values[innerIndex].isShow });
                }
                this.setState({ selectModel: selecStateClone });


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


  getCheckBox = (data, index) => {
    let { orderStore } = Store;
    return (
      <DismissKeyboard>
        <View key={index}>

          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}>{this.state.checkboxModel[index].isRequired ? data.title + " * " : data.title}</Text>
          </View>
          <View style={this.state.checkboxModel[index].showError ? s.featuresContainerError : s.featuresContainer}>
            {
              this.state.checkboxModel[index].values.map((item, key) => (

                <CheckBox
                  checkedColor={orderStore.color}
                  uncheckedColor={Appearences.Colors.headingGrey}
                  title={item.name}
                  key={key}
                  checked={this.state.checkboxModel[index].values[key].isChecked
                    //false

                    //false
                  }
                  containerStyle={s.checkBox}
                  size={Appearences.Fonts.paragraphFontSize}
                  textStyle={s.checkBoxText}
                  key={key}
                  onPress={() => {
                    let checkBoxClone = [...this.state.checkboxModel];
                    checkBoxClone[index].values[key].isChecked = !item.isChecked;
                    this.setState({ checkboxModel: checkBoxClone });
                    //    this.checkBoxTemp[index].values[key].is_checked = !item.is_checked;
                    //this.setState({checkboxStates:this.checkBoxTemp});  
                  }}>
                </CheckBox>

              )
              )}
          </View>

        </View>
      </DismissKeyboard>
    );

  }

  getDates = (item, index) => {
    var datesClone = [...this.state.dateModel];
    return (
      <DismissKeyboard>
        <View>

          <View style={styles.headingTextContainer}>
            <Text style={styles.subHeading}>{this.state.dateModel[index].isRequired ? item.title + " * " : item.title}</Text>
          </View>
          <DatePicker
            style={this.state.dateModel[index].showError ? styles.TextInputDateError : styles.TextInputDate}
            date={this.state.dateModel[index].value}
            mode="date"
            placeholder="select date"
            format="YYYY-MM-DD"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{ dateInput: { borderWidth: 0 } }}
            onDateChange={(date) => {

              datesClone[index].value = date;
              this.setState({ dateModel: datesClone });
            }}
          />

        </View>
      </DismissKeyboard>
    );


  }
  onClickDynamicField = async () => {

    this.setState({
      textFieldModel: [],
      selectModel: [],
      checkboxModel: [],
      dateModel: [],
      webModel: [],
    });

    let { orderStore } = Store;
    orderStore.setOnDynamicOptionSeleted(false);
    this.setState({ categoryId: orderStore.optionSelectedModel.categoryId });
    // if (orderStore.optionSelectedModel.hasTemp)
    this.getDynamicFields(orderStore.optionSelectedModel.categoryId);

  }


  createData = async () => {
    let { orderStore } = Store;


    let pageTwoClone = [...this.state.pageTwo];

    for (var i = 0; i < this.state.pageTwo.length; i++) {
      switch (this.state.pageTwo[i].type) {

        case "checkbox":
          let values = [];
          let valuesClone = [...this.state.pageTwo[i].values]
          for (var j = 0; j < valuesClone.length; j++) {
            if (valuesClone[j].is_checked)
              values.push(valuesClone[j].name);

          }
          if (values.length === 0 && this.state.pageTwo[i].isRequired) {
            pageTwoClone[i].showError = true;
            this.setState({ pageTwo: pageTwoClone });
          }

          else {
            pageTwoClone[i].showError = false;
            this.setState({ pageTwo: pageTwoClone });
            let data = {};
            data[this.state.pageTwo[i].fieldTypeName] = values;
            orderStore.postAdObject = Object.assign(orderStore.postAdObject, data);
          }
          break;



        case "select":

          if (this.state.pageTwo[i].data.field_type_name === "ad_cats1") {

            this.manageDynamicFieldsObject();

          }
          if (this.state.pageTwo[i].data.field_type_name === "ad_price_type") {
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
            if (this.state.pageTwo[i].selectedId.length != 0) {
              var dynamicKey = {};
              const data = this.state.pageTwo[i];
              dynamicKey[data.fieldTypeName] = this.state.pageTwo[i].selectedId;
              orderStore.postAdObject = Object.assign(orderStore.postAdObject, dynamicKey);
              pageTwoClone[i].showError = false;
              this.setState({ pageTwo: pageTwoClone });

            }
            else {
              if (this.state.pageTwo[i].isRequired) {
                pageTwoClone[i].showError = true;
                this.setState({ pageTwo: pageTwoClone });
              }
            }
          }
          break;
        case "textfield":
          if (this.state.pageTwo[i].value.length != 0) {

            var dynamicKey = {};
            dynamicKey[this.state.pageTwo[i].fieldTypeName] = this.state.pageTwo[i].value;
            orderStore.postAdObject = Object.assign(orderStore.postAdObject, dynamicKey);
            pageTwoClone[i].showError = false;
            this.setState({ pageTwo: pageTwoClone });
          }
          else {
            if (this.state.pageTwo[i].isRequired) {
              if (!this.state.showPriceOnly && pageTwoClone[i].fieldTypeName === "ad_price")
                pageTwoClone[i].showError = false;
              else
                pageTwoClone[i].showError = true;
              this.setState({ pageTwo: pageTwoClone });
            }
          }

          break;
        // new code
        case "textarea":
          if (this.state.pageTwo[i].value.length != 0) {
            var dynamicKey = {};
            dynamicKey[this.state.pageTwo[i].fieldTypeName] = this.state.pageTwo[i].value;
            orderStore.postAdObject = Object.assign(orderStore.postAdObject, dynamicKey);
            pageTwoClone[i].showError = false;
            this.setState({ pageTwo: pageTwoClone });
          }
          else {
            if (this.state.pageTwo[i].isRequired) {

              pageTwoClone[i].showError = true;
              this.setState({ pageTwo: pageTwoClone });
            }
          }
          break;
        // new code

      }



    }
    this.checkPageClear('createData');
    // console.warn(JSON.stringify(orderStore.postAdObject));

  }


  checkPageClear = (source) => {

    let { orderStore } = Store;
    this.areStaticFieldsClear = true;
    for (var i = 0; i < this.state.pageTwo.length; i++) {
      if (this.state.pageTwo[i].showError) {
        this.areStaticFieldsClear = false;
      }

    }
    if (this.categoryClear && this.textFieldClear && this.webClear && this.dateClear && this.checkClear && this.selectClear && this.areStaticFieldsClear) {
      {
        orderStore.isSecondPageClear = true;
        //   this.props.callBackFunc();
      }
    }
    else {
      orderStore.isSecondPageClear = false;
      Toast.show("Please Fill All The Required Fields");
    }

  }

  manageDynamicFieldsObject = () => {

    let { orderStore } = Store;

    orderStore.postAdObject = Object.assign(orderStore.postAdObject, { custom_fields: {} });

    if (this.categoryClear) {
      const data = { ad_cats1: this.state.categoryId }
      orderStore.postAdObject = Object.assign(orderStore.postAdObject, data)

    }

    if (this.state.textFieldModel.length != 0) {
      for (var i = 0; i < this.state.textFieldModel.length; i++) {
        if (this.state.textFieldModel[i].fieldTypeName.length != 0 && this.state.textFieldModel[i].value.length != 0) {
          if (this.state.textFieldModel[i].fieldTypeName === "ad_price") {
            if (!this.state.showPriceOnly)
              continue;
          }
          let data = {};
          data[this.state.textFieldModel[i].fieldTypeName] = this.state.textFieldModel[i].value;
          orderStore.postAdObject.custom_fields = Object.assign(orderStore.postAdObject.custom_fields, data);
        }

      }
    }
    if (this.state.checkboxModel.length != 0) {
      let data = {};
      for (var i = 0; i < this.state.checkboxModel.length; i++) {
        let selectedValues = [];
        for (var j = 0; j < this.state.checkboxModel[i].values.length; j++) {
          if (this.state.checkboxModel[i].values[j].isChecked)
            selectedValues.push(this.state.checkboxModel[i].values[j].name);
        }

        if (selectedValues.length === 0)
          continue;
        data[this.state.checkboxModel[i].fieldTypeName] = selectedValues;
        orderStore.postAdObject.custom_fields = Object.assign(orderStore.postAdObject.custom_fields, data);

      }


    }
    if (this.state.dateModel.length != 0) {

      for (var i = 0; i < this.state.dateModel.length; i++) {
        let data = {};
        if (this.state.dateModel[i].value.length === 0)
          continue;
        data[this.state.dateModel[i].fieldTypeName] = this.state.dateModel[i].value;
        orderStore.postAdObject.custom_fields = Object.assign(orderStore.postAdObject.custom_fields, data);
      }
    }
    if (this.state.webModel.length != 0) {
      for (var i = 0; i < this.state.webModel.length; i++) {
        if (this.state.webModel[i].value.length === 0)
          continue;
        let data = {};
        data[this.state.webModel[i].fieldTypeName] = this.state.webModel[i].value;
        orderStore.postAdObject.custom_fields = Object.assign(orderStore.postAdObject.custom_fields, data);
      }
    }
    if (this.state.selectModel.length != 0) {

      for (var i = 0; i < this.state.selectModel.length; i++) {
        if (this.state.selectModel[i].selectedId.length === 0)
          continue;

        if (this.state.selectModel[i].fieldTypeName === "ad_price_type") {

        }
        let data = {};

        data[this.state.selectModel[i].fieldTypeName] = this.state.selectModel[i].selectedId;
        orderStore.postAdObject.custom_fields = Object.assign(orderStore.postAdObject.custom_fields, data);
      }
    }
    this.checkForDynamicEmptyFields();

  }

  checkForDynamicEmptyFields = () => {
    let emptyTextFields = [];
    let emptyWebFields = [];
    let emptySelectFields = [];
    let emptyCheckFields = [];
    let emptyDateFields = [];
    let textFieldModelClone = this.state.textFieldModel;
    let selectClone = this.state.selectModel;
    let checkBoxClone = this.state.checkboxModel;
    let dateClone = this.state.dateModel;
    let webClone = this.state.webModel;
    for (var i = 0; i < this.state.textFieldModel.length; i++) {
      if (this.state.textFieldModel[i].fieldTypeName === "ad_price") {
        if (!this.state.showPriceOnly)
          continue;
      }
      if (this.state.textFieldModel[i].isRequired && this.state.textFieldModel[i].value.length === 0) {
        textFieldModelClone[i].showError = true;
        this.setState({ textFieldModel: textFieldModelClone });
        emptyTextFields.push(i);
      }
      else {
        textFieldModelClone[i].showError = false;
        this.setState({ textFieldModel: textFieldModelClone });
      }
    }
    for (var i = 0; i < this.state.webModel.length; i++) {
      if (this.state.webModel[i].isRequired && this.state.webModel[i].value.length === 0) {
        webClone[i].showError = true;
        this.setState({ webModel: webClone });
        emptyWebFields.push(i);
      }
      else {
        webClone[i].showError = false;
        this.setState({ webModel: webClone });
      }
    }

    for (var i = 0; i < this.state.dateModel.length; i++) {
      if (this.state.dateModel[i].isRequired && this.state.dateModel[i].value.length === 0) {
        dateClone[i].showError = true;
        this.setState({ dateModel: dateClone });
        emptyDateFields.push(i);
      }
      else {
        dateClone[i].showError = false;
        this.setState({ dateModel: dateClone });
      }
    }


    for (var i = 0; i < this.state.selectModel.length; i++) {
      if (this.state.selectModel[i].isRequired && this.state.selectModel[i].selectedValue.length === 0) {
        selectClone[i].showError = true;
        this.setState({ selectModel: selectClone });
        emptySelectFields.push(i);
      }
      else {
        selectClone[i].showError = false;
        this.setState({ selectModel: selectClone });
      }
    }


    for (var i = 0; i < this.state.checkboxModel.length; i++) {
      let valuesArrayInnerTemp = [];

      for (var j = 0; j < this.state.checkboxModel[i].values.length; j++) {
        let valuesModel = this.state.checkboxModel[i].values[j];
        if (valuesModel.isChecked) {

          valuesArrayInnerTemp.push(valuesModel);
        }
        checkBoxClone[i].selectedValues = valuesArrayInnerTemp;

      }


    }
    this.setState({ checkboxModel: checkBoxClone });

    for (var i = 0; i < this.state.checkboxModel.length; i++) {
      if (this.state.checkboxModel[i].isRequired && this.state.checkboxModel[i].selectedValues.length === 0) {
        checkBoxClone[i].showError = true;
        this.setState({ checkboxModel: checkBoxClone });
        emptyCheckFields.push(i);
      }
      else {
        checkBoxClone[i].showError = false;
        this.setState({ checkboxModel: checkBoxClone });


      }
    }

    if (this.state.categoryId.length === 0 && this.isCategoryRequired) {
      this.setState({ showCategoryError: true });
      this.categoryClear = false;
    }
    else {
      this.setState({ showCategoryError: false });
      this.categoryClear = true;
    }

    if (emptyTextFields.length != 0)
      this.textFieldClear = false;
    else
      this.textFieldClear = true;
    if (emptyWebFields.length != 0)
      this.webClear = false;
    else
      this.webClear = true;
    if (emptyDateFields.length != 0)
      this.dateClear = false;
    else
      this.dateClear = true;
    if (emptyCheckFields.length != 0)
      this.checkClear = false;
    else
      this.checkClear = true;
    if (emptySelectFields.length != 0)
      this.selectClear = false;
    else
      this.selectClear = true;


    this.checkPageClear('checkForDynamicEmptyFields');
  }

  render() {
    let { orderStore } = Store;

    if (orderStore.onSecondPageChange) {
      if (this.state.pageTwo.length != 0)
        this.checkPageClear('render');
      else
        this.checkForDynamicEmptyFields();
      this.createData();

      //if(orderStore.optionSelectedModel.hasTemp)
      //{
      this.manageDynamicFieldsObject();
      //}

    }
    if (this.props.onNextClick) {
      if (orderStore.isSecondPageClear === true) {
        this.props.callBackFunc();
      }
    }
    if (orderStore.optionSelected) {

      this.onClickDynamicField();

    }

    let data = orderStore.sell.data;
    let fields = [...data.fields];
    let extra = data.extra;
    return (
      <DismissKeyboard>
        <View style={{ height: '100%', backgroundColor: 'white' }}>
          <ScrollView
            keyboardShouldPersistTaps='always'

            contentContainerStyle={{
              backgroundColor: 'white',
              paddingBottom: 50,
            }}>
            <View style={styles.container}>


              {

                this.state.pageTwo.map((item, key) => (
                  <View key={key}>
                    {this.getPageTwo(item, key)}
                  </View>
                ))

              }
              {this.state.showSubCategories ? this.getSubCategoriesView() : null}
              {this.state.showSubSubCategories ? this.getSubSubCategoriesView() : null}
              {this.state.showSubSubSubCategories ? this.getSubSubSubCategoriesView() : null}



              {this.state.webModel.map((item, index) => { return this.getWebLinks(item, index) })}

              {this.state.dateModel.map((item, index) => { return this.getDates(item, index) })}

              {this.state.textFieldModel.map((item, index) => { return this.getTextFields(item, index) })}
              {this.state.selectModel.map((item, index) => { return this.getSelectMenu(item, index, index) })}
              {this.state.checkboxModel.map((item, index) => { return this.getCheckBox(item, index) })}

            </View>
          </ScrollView>

        </View>
      </DismissKeyboard>

    );
  }


}







