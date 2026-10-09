import { useState, useCallback } from "react";

import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
    useFocusEffect,
    useRouter,
} from "expo-router";

import {
    getRecentFoods,
    RecentFoodRow,
} from "@/database/database";

export default function RecentFoodsScreen() {
    const router = useRouter();

    const [recentFoods , setRecentFoods] = useState<RecentFoodRow[]>([]);

    useFocusEffect(
        useCallback(() => {
            const loadRecentFoods = async () => {
                const foods = await getRecentFoods();
                setRecentFoods(foods);
            };

            loadRecentFoods();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>
                        ‹ Back
                    </Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    Recent Foods
                </Text>

                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
            >
                {recentFoods.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>
                            No Recent Foods
                        </Text>

                        <Text style={styles.emptyText}>
                            Foods you log will appear here
                        </Text>
                    </View>
                ) : (
                    recentFoods.map((food, index) => (
                        <TouchableOpacity
                            key={food.id.toString()}
                            style={styles.foodCard}
                            onPress={() => {
                                router.push({
                                    pathname: "/log-recent-food",
                                    params: {
                                        id: food.id.toString(),
                                    },
                                })
                            }}
                        >
                            <View>
                                <Text style={styles.foodName}>
                                    {food.name}
                                </Text>

                                {food.amount != null && food.unit && (
                                    <Text style={styles.serving}>
                                        {food.amount} {food.unit}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.nutrition}>
                                <Text style={styles.calories}>
                                    {food.calories} kcal
                                </Text>

                                <Text style={styles.protein}>
                                    {food.protein}g protein
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    backButton: {
        fontSize: 17,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
    },

    headerSpacer: {
        width: 50,
    },

    content: {
        padding: 16,
    },

    emptyContainer: {
        alignItems: "center",
        marginTop: 80,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
    },

    emptyText: {
        color: "#777",
        marginTop: 8,
    },

    foodCard: {
        backgroundColor: "white",
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    foodName: {
        fontSize: 17,
        fontWeight: "600",
    },

    serving: {
        fontSize: 14,
        color: "#777",
        marginTop: 4,
    },

    nutrition: {
        alignItems: "flex-end",
    },

    calories: {
        fontSize: 15,
        fontWeight: "500",
    },

    protein: {
        fontSize: 13,
        color: "#777",
        marginTop: 3,
    },
    
    searchInput: {
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 16,
    },
});