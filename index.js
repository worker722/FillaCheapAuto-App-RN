import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import bgMessaging from './src/firebase/bgMessaging';
console.disableYellowBox = true;

AppRegistry.registerComponent('carsport', () => App);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);
