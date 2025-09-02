import { RootState } from '@/store';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

const ChooseDomain = () => {
    const domainData = useSelector((state: RootState) => state.domain.currentDomain);
    const isCompleted = useSelector((state: RootState) => state.domain.isCompleted);

    useEffect(() => {
        // If domain selection is already completed, redirect to edit screen
        if (isCompleted && domainData) {
            router.replace('/homeRoutes/domainSelection/editDomain');
        } else {
            // Start the domain selection flow
            router.replace('/homeRoutes/domainSelection/fieldSelection');
        }
    }, [isCompleted, domainData]);

    return (
        <View style={styles.container}>
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
});

export default ChooseDomain;
