import { useEffect, useState } from "react";

import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useNavigation } from "expo-router";
import { DrawerActions } from "expo-router/react-navigation";

import { DailySummaryRow, getDailySummaries } from "@/database/database";

export default function HistoryScreen() {
    const navigation = useNavigation();
    
    const [days, setDays] = useState<DailySummaryRow[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const results = await getDailySummaries();
        setDays(results);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => 
                            navigation.dispatch(DrawerActions.openDrawer)
                        }
                    >
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>History</Text>

                    <View style={styles.headerSpacer} />

                </View>

                {days.length === 0 ? (
                    <Text style={styles.emptyText}>No history yet</Text>
                ): (
                    days.map((day) => (
                        <View 
                            key={day.date} 
                            style={styles.dayCard}
                        >
                            <Text style={styles.dateText}>
                                {new Date(
                                    `${day.date}T12:00:00`
                                ).toLocaleDateString("en-US",{
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </Text>

                            <View style={styles.summaryRow}>
                                <View>
                                    <Text style={styles.summaryLabel}>
                                        Calories
                                    </Text>

                                    <Text style={styles.summaryValue}>
                                        {day.total_calories} kcal
                                    </Text>
                                </View>

                                <View>
                                    <Text style={styles.summaryLabel}>
                                        Protein
                                    </Text>

                                    <Text style={styles.summaryValue}>
                                        {day.total_protein} g
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}


            </ScrollView>
        </SafeAreaView>
    )
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
        alignItems: "center",
        marginBottom: 30,
    },

    menuButton: {
        width:44,
        height:44,
        justifyContent: "center",
    },

    menuIcon: {
        fontSize: 25,
        fontWeight: "600",
    },

    title: {
        flex: 1,
        textAlign: "center",
        fontSize: 24,
        fontWeight: "700",
    },

    headerSpacer: {
        width:44,
    },

    dayCard: {
        backgroundColor: "white",
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
    },

    dateText: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 16,
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    summaryLabel: {
        fontSize: 12,
        color: "#777",
        marginBottom: 3,
    },

    summaryValue: {
        fontSize: 16,
        fontWeight: "700",
    },

    emptyText: {
        textAlign: "center",
        color: "#777",
        marginTop: 50,
    },
});