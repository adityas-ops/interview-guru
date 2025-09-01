import { Stack } from 'expo-router';
import React from 'react';


const Layout = () => {
    return (
      <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name='editProfile'/>
         <Stack.Screen name='notification'/>
         <Stack.Screen name='privacy'/>
      </Stack>
    );
}


export default Layout;
