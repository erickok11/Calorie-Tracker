import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useFood } from "@/context/FoodContext";
import { router, useLocalSearchParams } from "expo-router";

export default function FoodDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { foods, deleteFood } = useFood();

    const food = foods.find((food) => food.id === id);

    if (!food) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Food not found.</Text>
            </SafeAreaView>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            "Delete Food", //title
            `Are you sure you want to delete ${food.name}?`, //message
            //buttons
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteFood(id);
                        router.back();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>‹ Back</Text>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Food Details</Text>
                    
                    <View style={styles.headerSpacer} />    
                </View>

                <View style={styles.foodHeader}>
                    <Text style={styles.foodName}>{food.name}</Text>

                    {food.amount !== undefined && (
                        <Text style={styles.amount}>
                            {food.amount} {food.unit}
                        </Text>
                    )}
                </View>

                <View style={styles.nutritionCard}>
                    <View style={styles.nutritionRow}>
                        <Text style={styles.label}>Calories</Text>

                        <Text style={styles.value}>
                            {food.calories} kcal
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.nutritionRow}>
                        <Text style={styles.label}>Protein</Text>

                        <Text style={styles.value}>
                            {food.protein} g
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                        router.push({
                            pathname: "/edit-food",
                            params: { id: food.id },
                        })
                    }
                >
                    <Text style={styles.editButtonText}>Edit Food</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                >
                    <Text style={styles.deleteButtonText}>
                        Delete Food
                    </Text>
                </TouchableOpacity>

                
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
    },

    content: {
        padding: 24,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 35,
    },

    backButton: {
        fontSize: 17,
        color: "#3478F6",
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: "700"
    },

    headerSpacer: {
        width: 50,
    },

    foodHeader: {
        marginBottom: 25,
    },

    foodName: {
        fontSize: 32,
        fontWeight: 700,
    },

    amount: {
        fontSize:17,
        color: "#777",
        marginTop: 6,
    },

    nutritionCard: {
        backgroundColor: "white",
        borderRadius: 18,
        padding: 20,
    },

    nutritionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    label: {
        fontSize: 17,
        color: "#555",
    },

    value: {
        fontSize: 18,
        fontWeight: "600",
    },

    divider: {
        height: 1,
        backgroundColor: "#EEE",
        marginVertical: 18
    },

    deleteButton: {
        marginTop: 12,
        padding: 16,
        borderRadius: 14,
        backgroundColor: "#FFE5E5",
        alignItems: "center",
    },

    deleteButtonText: {
        color: "#D32F2F",
        fontSize: 17,
        fontWeight: "600",
    },

    editButton: {
        marginTop: 30,
        padding: 16,
        borderRadius: 14,
        backgroundColor: "#3478F6",
        alignItems: "center",
    },

    editButtonText: {
        color: "white",
        fontSize: 17,
        fontWeight: "600",
    },
});