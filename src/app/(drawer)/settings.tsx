import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import { useNavigation } from "expo-router";
import { DrawerActions } from "expo-router/react-navigation";

import { useGoal } from "@/context/GoalsContext";

export default function SettingsScreen() {
    const navigation = useNavigation();

    const { calorieGoal, proteinGoal } = useGoal();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
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
        flex: 1,
        padding: 24,
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
});