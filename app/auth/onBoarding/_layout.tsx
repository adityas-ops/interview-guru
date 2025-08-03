import { Stack } from 'expo-router';
import React from 'react';

const Layout = () => {
    return (
       <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name='index'/>
         <Stack.Screen name='boardingFinal'/>
          <Stack.Screen name='boardingOne'/>
           <Stack.Screen name='boardingTwo'/>
       </Stack>
    );
}



export default Layout;
