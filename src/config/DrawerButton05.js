import React from 'react';
import {
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    View
} from 'react-native';
import Appearences from '../config/Appearences';
import { widthPercentageToDP as wp} from '../helper/Responsive';

const DrawerButton = ({ navigation }) => (

    <View style={[{backgroundColor:Appearences.Colors.appBackgroundColor},{flexDirection:'row'}]}>
        <TouchableOpacity style={styles.wrapper}
            onPress={() => {

                // navigation.navigate('DrawerOpen')
                navigation.toggleDrawer();
            }}>
            <Image
                style={styles.icon}
                source={require('../../res/images/menu-black.png')}
            />
        </TouchableOpacity>



        <TouchableOpacity style={[styles.wrapper,{position:'absolute',right:wp('2')}]}
           >
            <Image
                style={styles.icon}
                source={require('../../res/images/search.png')}
            />
        </TouchableOpacity>
    </View>

);
const styles = StyleSheet.create({

    icon: {
        width: 20,
        height: 20,
    },
    wrapper: {
        marginStart: 5,
        padding: 10,
    },

});
export default DrawerButton;