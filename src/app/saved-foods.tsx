import { getSavedFood, SavedFoodRow } from "@/database/database";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";



export default function SavedFoodsScreen() {
    const router = useRouter();

    const [savedFoods, setSavedFoods] = useState<SavedFoodRow[]>([]);

    const loadSavedFoods = async () => {
        const foods = await getSavedFood();
        setSavedFoods(foods);
    };

    const [search, setSearch] = useState("");

    const filteredFoods = savedFoods.filter((food) => 
        food.name.toLowerCase().includes(search.trim().toLowerCase()));

    useFocusEffect(
        useCallback(() => {
            loadSavedFoods();
        }, [])
    );


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>‹ Back</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Saved Foods</Text>

                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
            >
                <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search saved foods"
                    clearButtonMode="while-editing"
                />

                {savedFoods.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>
                            No Saved Foods
                        </Text>

                        <Text style={styles.emptyText}>
                            Foods you save will appear here.
                        </Text>
                    </View>
                ): filteredFoods.length === 0 ?(
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>
                            No Results
                        </Text>

                        <Text style={styles.emptyText}>
                            No saved foods match "{search}".
                        </Text>
                    </View>
                ) : (
                    filteredFoods.map((food) => (
                        <TouchableOpacity
                            key={food.id}
                            style={styles.foodCard}
                            onPress={() => {
                                router.push({
                                    pathname: "/log-saved-food",
                                    params: {
                                        id: food.id.toString(),
                                    },
                                });
                            }}
                        >
                            <View>
                                <Text style={styles.foodName}>
                                    {food.name}
                                </Text>

                                <Text style={styles.serving}>
                                    {food.serving_amount}{" "}
                                    {food.serving_unit}
                                </Text>
                            </View>
                            <View style={styles.nutrition}>
                                <Text style={styles.calories}>
                                    {food.calories} kcal
                                </Text>

                                <Text style={styles.protein}>
                                    {food.protein} g protein
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