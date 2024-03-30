import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Cashier  from './components/Cashier';
import Admin from './components/Admin';
import Customer from './components/Customer';
import QRCodeDisplay from './components/QRCodeDisplay';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Login' component={SignIn} options={{headerShown:false}}/>
        <Stack.Screen name='Create' component={SignUp} options={{headerShown:false}}/>
        <Stack.Screen name='Admins' component={Admin} options={{headerShown:false}}/>
        <Stack.Screen name='Customers' component={Customer} options={{headerShown:false}}/>
        {/* <Stack.Screen name='Customers' component={QRCodeDisplay} options={{headerShown:false}}/> */}
        <Stack.Screen name='Cashiers' component={Cashier} options={{headerShown:false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default App
