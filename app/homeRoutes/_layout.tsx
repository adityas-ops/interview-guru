import { Stack } from 'expo-router';
import React from 'react';

const Layout = () => {
    return (
       <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name='resumeUpload'/>
           <Stack.Screen name='chooseDomain'/>
       </Stack>
    );
}


export default Layout;
