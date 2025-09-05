import { Stack } from 'expo-router';
import React from 'react';

const Layout = () => {
    return (
       <Stack  screenOptions={{headerShown:false}}>
        <Stack.Screen name='index'/>
        <Stack.Screen 
          name='questions' 
          options={{
            headerBackButtonMenuEnabled: false,
          }}
        />
       </Stack>
    );
}


export default Layout;
