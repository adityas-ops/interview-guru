import { Stack } from 'expo-router';
import React from 'react';

const Layout = () => {
    return (
       <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name='onBoarding'/>
        <Stack.Screen name='sign-in'/>
        <Stack.Screen name='log-in'/>
       </Stack>
    );
}
export default Layout;
