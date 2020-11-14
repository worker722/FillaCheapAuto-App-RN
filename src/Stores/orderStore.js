import { observable, action } from 'mobx'

class orderStore {
    @observable isSocailLogin = false;
    @observable settings = {};
    @observable advanceSearch = {};
    @observable sell = {};
    @observable home = {};
    @observable blog = {};
    @observable comparison = {};
    @observable innerResponse = {};
    @observable inbox = {};
    @observable adDetail = {};
    @observable profile = {};
    @observable publicProfile = {};
    @observable dp = '';
    @observable defaultDp = '';
    @observable name = '';
    @observable defaultName = '';
    @observable email = '';
    @observable fcmToken = '';
    @observable stripeKey = '';
    @observable postAdObject = {};
    @observable optionSelectedModel = { hasTemp: false, categoryId: "" };
    @observable onFirstPageChange = false;
    @observable onSecondPageChange = false;
    @observable onThirdPageChange = false;
    @observable onForthPageChange = false;
    @observable onPreviousPageChange = false;
    @observable isFirstPageClear = false;
    @observable isSecondPageClear = false;
    @observable isThirdPageClear = false;
    @observable isForthPageClear = false;
    @observable onPostClick = false;
    @observable onEditClick = false;
    @observable onNextClick = false;
    @observable isPublicProfile = false;
    @observable optionSelected = false;
    @observable DEVICE_TOKEN = "";
    @observable adDetailComponentMounted = false;
    @observable showEditOption = false;
    @observable onBlogsViewAllClicked = false;
    @observable screenTitles = {};
    @observable drawerMenu = {};

    @observable isSell = false;
    @observable isSellResMsg = '';
    @observable notificationCount = 4;


    @observable appRating = {};
    @observable appColor = "#000000";
    @observable isDealer = false;
    @observable isIndividual = false;
    @observable dealerConfirmDialogue = {};
    @observable onClickSearch = false;
    @observable isCallAdvance = false;
    @observable banner = { isShow: false, position: '', banner_id: '' }
    @observable inter = { isShow: false, interval: '', banner_id: '' }
    @observable canEditAds = true;
    @observable chat_image_split = "#p^image^p#";
    @observable chat_audio_split = "#p^audio^p#";

    @observable phone_verify_codes = [{ index: 0, code: '' }, { index: 1, code: '' }, { index: 2, code: '' }, { index: 3, code: '' }, { index: 4, code: '' }];

    @observable detailToolbarModel = {
        reportText: '',
        favouriteText: '',
        shareText: '',
        status: '',
        onClickFavourute: false,
        onClickShare: false,
        repeat: false,
        data: '',
        reportPopup: {

            title: '',
            options: [],
            textAreaPlaceholder: '',
            dropdownPlaceholder: '',
            submitButtonText: '',
            cancelButtonText: '',
            onClickReport: false,
        },

    };

    setOnBlogViewAll(onBlogsViewAllClicked) {
        this.onBlogsViewAllClicked = onBlogsViewAllClicked;
    }

    setDetailToolbarModel(model, reportPopupObject) {
        this.detailToolbarModel.reportText = model.report_btn;
        this.detailToolbarModel.favouriteText = model.fav_btn;
        this.detailToolbarModel.shareText = model.share_btn;
        this.detailToolbarModel.reportPopup.title = reportPopupObject.text;
        this.detailToolbarModel.reportPopup.options = reportPopupObject.name;
        this.detailToolbarModel.reportPopup.textAreaPlaceholder = reportPopupObject.input_textarea;
        this.detailToolbarModel.reportPopup.dropdownPlaceholder = reportPopupObject.key;
        this.detailToolbarModel.reportPopup.submitButtonText = reportPopupObject.btn_send;
        this.detailToolbarModel.reportPopup.cancelButtonText = reportPopupObject.btn_cancel;


    }

    changeForthPageClear(forthPage) {
        this.isForthPageClear = forthPage;
    }
    @action
    setBanner(banner) {
        this.banner = banner;
    }
    @action
    setInter(inter) {
        this.inter = inter;
    }
    setOnClickReportListener(clicked) {
        this.detailToolbarModel.reportPopup.onClickReport = clicked;
    }
    setOnClickFavouritetListener(clicked) {
        this.detailToolbarModel.onClickFavourute = clicked;
    }
    setOnClickSearchListener(clicked) {
        this.onClickSearch = clicked;
    }
    setOnClickShareListener(clicked) {
        this.detailToolbarModel.onClickShare = clicked;
    }
    setOnClickActiveListner(clicked, data, status) {
        this.detailToolbarModel.repeat = clicked;
        this.detailToolbarModel.data = data;
        this.detailToolbarModel.status = status;
    }
    setOnFirstPageChangeListener(onFirstPageChange) {
        this.onFirstPageChange = onFirstPageChange;
    }
    setIsCallAdvance(isCallAdvance) {
        this.isCallAdvance = isCallAdvance;
    }
    setOnSecondChangeListener(onSecondPageChange) {
        this.onSecondPageChange = onSecondPageChange;
    }
    setOnThirdPageChangeListener(onThirdPageChange) {
        this.onThirdPageChange = onThirdPageChange;
    }

    setOnForthPageChangeListener(onForthPageChange) {
        this.onForthPageChange = onForthPageChange;
    }
    setOnPreviousPageChangeListener(onPreviousPageChange) {
        this.onPreviousPageChange = onPreviousPageChange;
    }
    setOnPostAdClickListener(onPostClick) {
        this.onPostClick = onPostClick;
    }
    setOnEditAdClickListener(onEditClick) {
        this.onEditClick = onEditClick;
    }
    setNotificationCount(count) {
        this.notificationCount = count;
    }

    setOnDynamicOptionSeleted(optionSelected) {

        this.optionSelected = optionSelected;
    }
    setOnNextClick(onNextClick) {
        this.onNextClick = onNextClick;
    }
    @action
    setAdDetailComponentMounted(adDetailComponentMounted) {
        this.adDetailComponentMounted = adDetailComponentMounted;
    }
    @action
    setAppColor(appColor) {
        this.appColor = appColor;
    }
    @action
    setEditTopTab(isEdit) {
        this.canEditAds = isEdit;
    }
    @action
    setPhoneVerifyCode(index, code) {
        this.phone_verify_codes[index].code = code;
    }
}

const store = new orderStore();

export default store;
