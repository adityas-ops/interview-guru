import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const Layout = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const translateX = useSharedValue(0);

    const tabs = [
        { name: 'Home', icon: 'home', component: 'index' },
        { name: 'Reports', icon: 'bar-chart', component: 'report' },
        { name: 'Settings', icon: 'settings', component: 'settings' },
    ];

    // Wrap JS thread functions with runOnJS
    const updateCurrentIndex = (newIndex: number) => {
        setCurrentIndex(newIndex);
        flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd(() => {
            if (Math.abs(translateX.value) > screenWidth * 0.3) {
                if (translateX.value > 0 && currentIndex > 0) {
                    // Swipe right - go to previous tab
                    const newIndex = currentIndex - 1;
                    runOnJS(updateCurrentIndex)(newIndex);
                } else if (translateX.value < 0 && currentIndex < tabs.length - 1) {
                    // Swipe left - go to next tab
                    const newIndex = currentIndex + 1;
                    runOnJS(updateCurrentIndex)(newIndex);
                }
            }
            // Reset position
            translateX.value = 0;
        });

    const navigateToTab = (index: number) => {
        setCurrentIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const renderTabBar = () => (
        <View style={styles.tabBar}>
            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={tab.name}
                    style={[
                        styles.tabItem,
                        currentIndex === index && styles.activeTabItem
                    ]}
                    onPress={() => navigateToTab(index)}
                >
                    <Ionicons
                        name={tab.icon as any}
                        size={24}
                        color={currentIndex === index ? '#007AFF' : '#8E8E93'}
                    />
                    <Text style={[
                        styles.tabLabel,
                        currentIndex === index && styles.activeTabLabel
                    ]}>
                        {tab.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderItem = ({ item }: { item: typeof tabs[0]; index: number }) => {
        let Component;
        switch (item.component) {
            case 'index':
                Component = require('./index').default;
                break;
            case 'report':
                Component = require('./report').default;
                break;
            case 'settings':
                Component = require('./settings').default;
                break;
            default:
                Component = require('./index').default;
        }
        
        return (
            <View style={styles.screenContainer}>
                <Component />
            </View>
        );
    };

    const handleScrollEnd = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setCurrentIndex(index);
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView edges={['bottom']} style={styles.container}>
                <GestureDetector gesture={panGesture}>
                    <View style={styles.container}>
                        <FlatList
                            ref={flatListRef}
                            data={tabs}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.name}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            scrollEnabled={false}
                            onMomentumScrollEnd={handleScrollEnd}
                            getItemLayout={(_, index) => ({
                                length: screenWidth,
                                offset: screenWidth * index,
                                index,
                            })}
                        />
                        {renderTabBar()}
                    </View>
                </GestureDetector>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:"white"
    },
    screenContainer: {
        width: screenWidth,
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        paddingVertical: 5,
        height: 60,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTabItem: {
        // Add any active tab styling here if needed
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
        marginTop: 4,
    },
    activeTabLabel: {
        color: '#007AFF',
    },
});

export default Layout;
