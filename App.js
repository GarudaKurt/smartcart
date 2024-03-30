import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// import SignIn from './components/SignIn';
// import SignUp from './components/signUp';
// import  {Admin}  from './components/admin';
// import { Customer } from './components/customer';
import { Cashier } from './components/cashier';

const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* <Stack.Screen name='login' component={SignIn} options={{headerShown:false}}/> */}
        {/* <Stack.Screen name='create' component={SignUp} options={{headerShown:false}}/> */}
        {/* <Stack.Screen name='inventory' component={Admin} options={{headerShown:false}}/> */}
        {/* <Stack.Screen name='customers' component={Customer} options={{headerShown:false}}/> */}
        <Stack.Screen name='cashiers' component={Cashier} options={{headerShown:false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
