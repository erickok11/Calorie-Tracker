import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
    ScrollView,
    Switch,
    TextInput,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router, useFocusEffect , useNavigation } from "expo-router";

import { DrawerActions } from "expo-router/react-navigation";

import { useGoal } from "@/context/GoalsContext";

import { act, useCallback, useState } from "react";

import {
    getDashboardNutrientSettings,
    setDashboardNutrientGoal,
    setDashboardNutrientVisible,
    type DashboardNutrient,
    type DashboardNutrientSetting,
} from "@/database/database";

const EXTRA_NUTRIENTS: {
    key: DashboardNutrient;
    label: string;
    unit: string;
}[] = [
    { key: "carbs", label: "Carbohydrates", unit: "g"},
    { key: "fat", label: "Fat", unit: "g"},
    { key: "sugar", label: "Sugar", unit: "g"},
    { key: "fiber", label: "Fiber", unit: "g"},
    { key: "sodium_mg", label: "Sodium", unit: "mg"},
];

type GoalInputs = Record<DashboardNutrient, string>;

const EMPTY_GOALS: GoalInputs = {
    carbs: "",
    fat: "",
    sugar: "",
    fiber: "",
    sodium_mg: "",
}

export default function SettingsScreen() {
    const navigation = useNavigation();

    const { calorieGoal, proteinGoal } = useGoal();

    const [nutrientSettings, setNutrientSettings] = useState<DashboardNutrientSetting[]>([]);

    const [goalInputs, setGoalInputs] = useState<GoalInputs>(EMPTY_GOALS);

    const [loading, setLoading] = useState(true);

    const [isSavingGoals, setIsSavingGoals] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let active = true;
            
            const loadSettings = async () => {
                setLoading(true);
                
                try {
                    const rows = await getDashboardNutrientSettings()

                    if(!active) return;

                    setNutrientSettings(rows);

                    const inputs: GoalInputs = {
                        ...EMPTY_GOALS,
                    };

                    for (const row of rows) {
                        inputs[row.nutrient] = row.goal === null ? "" : String(row.goal);
                    }

                    setGoalInputs(inputs);
                } catch(error){
                    console.error("Failed to load dashboard settings:", error);

                    Alert.alert(
                        "Error",
                        "Could not load dashboard settings."
                    );
                } finally {
                    if(active) {
                        setLoading(false);
                    }
                }
            };

            void loadSettings();

            return () => {
                active = false;
            };

        }, [])
    );

    const handleVisibilityChange = async (
        nutrient: DashboardNutrient,
        visible: boolean
    ) => {
        try {
            await setDashboardNutrientVisible(nutrient, visible);

            setNutrientSettings((current) => 
                current.map((setting) =>
                    setting.nutrient === nutrient
                        ? {...setting, is_visible: visible ? 1 : 0}
                        : setting
                )
            );
        } catch(error) {
            console.error("Failed to update visibility", error);

            Alert.alert(
                "Error",
                "Could not update dashboard visibility."
            );
        }
    };

    const handleSaveNutritionGoals = async () => {
        if(isSavingGoals) return;

        const newGoals = EXTRA_NUTRIENTS.map((nutrient) => {
            const input = goalInputs[nutrient.key].trim();

            return {
                nutrient: nutrient.key,
                goal: input === "" ? null : Number(input),
            };
        });

        const invalidGoal = newGoals.some(
            ({goal}) => 
                goal !== null && (!Number.isFinite(goal) || goal <= 0)
        );

        if (invalidGoal) {
            Alert.alert(
                "Invalid goal",
                "Nutrition goals must be positive numbers, or left empty."
            );
            return;
        }

        setIsSavingGoals(true);

        try {
            for (const {nutrient, goal} of newGoals) {
                await setDashboardNutrientGoal(nutrient,goal);
            }

            Alert.alert(
                "Saved",
                "Your nutrition goals have been updated."
            );
        } catch (error) {
            console.error("Failed to save nutrition goals:", error);

            Alert.alert(
                "Error",
                "Could not save all nutrition goals. Please try again."
            );
        } finally {
            setIsSavingGoals(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.content}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress = {() => 
                            navigation.dispatch(DrawerActions.openDrawer())
                        }
                    >
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.title}>Settings</Text>

                    <View style={styles.headerSpacer} />
                </View>

                <Text style={styles.sectionTitle}>
                    NUTRITION
                </Text>
                
                <TouchableOpacity
                    style={styles.settingRow}
                    onPress={() => router.push("/edit-goal")}
                >
                    <Text style={styles.settingName}>
                        Daily Goals
                    </Text> 

                    <Text style={styles.settingDescription}>
                        {calorieGoal} kcal · {proteinGoal} g protein
                    </Text>
                    
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, styles.dashboardSection]}>
                    DASHBOARD CUSTOMIZATION
                </Text>

                <Text style={styles.sectionDescription}>
                    Choose which extra nutrients appear on your Home dashboard.
                    Calories and Protein are always displayed.
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <>
                        {EXTRA_NUTRIENTS.map((nutrient) => {
                            const setting = nutrientSettings.find(
                                (item) => item.nutrient === nutrient.key
                            );

                            return (
                                <View key={nutrient.key} style={styles.nutrientCard}>
                                    <View style={styles.nutrientHeader}>
                                        <Text style={styles.settingName}>
                                            {nutrient.label}
                                        </Text>

                                        <Switch
                                            value={setting?.is_visible === 1}
                                            onValueChange={(visible) =>
                                                handleVisibilityChange(nutrient.key, visible)
                                            }
                                        />
                                    </View>
                                    <Text style={styles.goalLabel}>
                                        Daily {nutrient.label.toLowerCase()} goal ({nutrient.unit})
                                    </Text>

                                    <TextInput
                                        style={styles.goalInput}
                                        value={goalInputs[nutrient.key]}
                                        onChangeText={(value) =>
                                            setGoalInputs((current) => ({
                                                ...current,
                                                [nutrient.key]: value,
                                            }))
                                        }
                                        keyboardType="decimal-pad"
                                        placeholder="no goal set"
                                    />
                                </View>
                            );
                        })}

                        <TouchableOpacity
                            style={[
                                styles.saveGoalsButton,
                                isSavingGoals && styles.saveGoalsButtonDisabled,
                            ]}
                            disabled={isSavingGoals}
                            onPress={handleSaveNutritionGoals}
                        >
                            <Text style={styles.saveGoalButtonText}>
                                {isSavingGoals ? "Saving..." : "Save Nutritions Goals"}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
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
        paddingBottom: 48,
    },

    backButton: {
        fontSize: 17,
        color: "#3478F6",
    },
    
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#777",
        letterSpacing: 0.0,
        marginBottom: 8,
    },

    settingRow: {
        backgroundColor: "white",
        padding: 18,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    settingName: {
        fontSize: 17,
        fontWeight: "500",
    },

    chevron: {
        fontSize: 24,
        color: "#999",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },

    menuButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "flex-start",
    },

    menuIcon: {
        fontSize: 25,
        fontWeight: "600",
    },

    headerText: {
        flex: 1,
        alignItems: "center",
    },

    title: {
        flex: 1,
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
    },

    date: {
        fontSize: 14,
        color: "#777",
        marginTop: 2,
    },

    headerSpacer: {
        width: 44,
    },

    settingDescription: {
        fontSize: 14,
        color: "#777",
        marginTop: 4,
    },

    dashboardSection: {
        marginTop: 32,
    },

    sectionDescription: {
        fontSize: 14,
        color: "#777",
        marginBottom: 16,
        lineHeight: 20,
    },

    nutrientCard: {
        backgroundColor: "white",
        borderRadius: 14,
        padding: 18,
        marginBottom: 12,
    },

    nutrientHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    goalLabel: {
        fontSize: 13,
        color: "#777",
        marginTop: 14,
        marginBottom: 8,
    },

    goalInput: {
        backgroundColor: "#F7F7F7",
        borderRadius: 10,
        paddingHorizontal: 14,
        height: 46,
        fontSize: 16,
    },

    saveGoalsButton: {
        backgroundColor: "#3478F6",
        borderRadius: 14,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },

    saveGoalsButtonDisabled: {
        opacity: 0.5,
    },

    saveGoalButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },


});