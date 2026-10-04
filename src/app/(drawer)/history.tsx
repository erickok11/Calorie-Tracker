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

import { formatDateForDatabase } from "@/utils/date";
import { getGoalStatus } from "@/utils/goals";

import Svg, { Circle } from "react-native-svg";

export default function HistoryScreen() {
    const navigation = useNavigation();
    
    const [days, setDays] = useState<DailySummaryRow[]>([]);

    const [currentMonth, setCurrentMonth] = useState(
        new Date()
    );

    const [selectedDate, setSelectedDate] = useState<string | null>(
        null
    );

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const results = await getDailySummaries();
        setDays(results);
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth()-1,
                1
            )
        );
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth()+1,
                1
            )
        );
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(
        year,
        month,
        1
    ).getDay();

    const numberOfDays = new Date(
        year,
        month,
        0
    ).getDate();

    const calendarDays: (number | null)[] = [];

    for (let i = 0;i < firstDayOfMonth;i ++){
        calendarDays.push(null);
    }

    for (let day = 1;day <= numberOfDays; day++){
        calendarDays.push(day);
    }

    const getSummaryForDay = (day:number) => {
        const date = formatDateForDatabase(
            new Date(year, month, day)
        );

        return days.find(
            (summary) => summary.date === date
        );
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

                
                <View style={styles.monthHeader}>
                    <TouchableOpacity onPress={goToPreviousMonth}>
                        <Text style={styles.monthArrow}>‹</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.monthTitle}>
                        {currentMonth.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        })}
                    </Text>

                    <TouchableOpacity onPress={goToNextMonth}>
                        <Text style={styles.monthArrow}>›</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.weekRow}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                            <Text 
                                key={day}
                                style={styles.weekDay}
                            >
                                {day}
                            </Text>
                        )
                    )}
                </View>

                <View style={styles.calendarGrid}>
                    {calendarDays.map((day,index)=> {
                        if(day === null) {
                            return (
                                <View
                                    key={`empty-${index}`}
                                    style={styles.dayCell}
                                />
                            );
                        }

                        const summary = getSummaryForDay(day);

                        const status = summary
                            ? getGoalStatus(
                                summary.total_calories,
                                summary.total_protein,
                                summary.calorie_goal,
                                summary.protein_goal
                            )
                        :undefined;

                        const date = formatDateForDatabase(
                            new Date(year, month, day)
                        );

                        return (
                            <TouchableOpacity
                                key={date}
                                style={styles.dayCell}
                                onPress={() => setSelectedDate(date)}
                            >
                                {summary ? (
                                    <DayRing
                                        day={day}
                                        status={status}
                                        selected={selectedDate === date}
                                    />
                                ) : (
                                    <View 
                                        style={[
                                            styles.emptyDay,
                                            selectedDate === date && styles.selectedEmptyDay,
                                        ]}
                                    >
                                        <Text style={styles.dayNumber}>
                                            {day}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {selectedDate && (()=> {
                    const summary = days.find(
                        (day) => day.date === selectedDate
                    );

                    return (
                        <View style={styles.selectedSummary}>
                            <Text style={styles.selectedDate}>
                                {new Date(
                                    `${selectedDate}T12:00:00`
                                ).toLocaleDateString("en-US", {
                                    weekday:"long",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </Text>

                            {summary ? (
                                <View style={styles.summaryRow}>
                                    <View>
                                        <Text style={styles.summaryLabel}>
                                            Calories
                                        </Text>

                                        <Text style={styles.summaryValue}>
                                            {summary.total_calories} / {summary.calorie_goal}
                                        </Text>
                                    </View>

                                    <View>
                                        <Text style={styles.summaryLabel}>
                                            Protein
                                        </Text>

                                        <Text style={styles.summaryValue}>
                                            {summary.total_protein} / {summary.protein_goal}g    
                                        </Text>
                                    </View>
                                </View>
                            ):(
                                <Text style={styles.noData}>
                                    No food logged on this day.
                                </Text>
                            )}
                        </View>
                    );
                })()}
                


            </ScrollView>
        </SafeAreaView>
    )
}


type DayRingProps = {
    day: number;
    status?: "complete" | "partial" | "incomplete";
    selected?: boolean;
};

function DayRing({
    day,
    status,
    selected = false,
}: DayRingProps) {
    const size = 42;
    const strokeWidth = selected ? 4 : 3;

    let ringColor = "#D1D1D1";

    if(status === "complete"){
        ringColor = "#34C759";
    } else if(status === "partial"){
        ringColor = "#FFCC00";
    } else if(status === "incomplete"){
        ringColor = "#ff3B30"
    }

    return (
        <View
            style={[
                styles.dayRingContainer,
                selected && styles.selectedDay,
            ]}
        >
            <Svg
                width={size}
                height={size}
                style={StyleSheet.absoluteFill}
            >
                <Circle
                    cx={size/2}
                    cy={size/2}
                    r={(size-strokeWidth)/2}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
            </Svg>

            <Text style={styles.dayNumber}>
                {day}
            </Text>
        </View>
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

    emptyText: {
        textAlign: "center",
        color: "#777",
        marginTop: 50,
    },

    monthHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    monthTitle: {
        fontSize: 20,
        fontWeight: "700",
    },

    monthArrow: {
        fontSize: 32,
        color: "#3478F6",
        paddingHorizontal: 10,
    },

    weekRow: {
        flexDirection: "row",
        marginBottom: 10,
    },

    weekDay: {
        width: "14.2857%",
        textAlign: "center",
        fontSize: 12,
        fontWeight: "600",
        color: "#777",
    },

    calendarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },

    dayCell: {
        width: "14.2587%",
        height: 52,
        justifyContent: "center",
    },

    dayNumber: {
        fontSize: 14,
        fontWeight: "600",
    },

    selectedSummary: {
        backgroundColor: "white",
        borderRadius: 18,
        padding: 20,
        marginTop: 25,
    },

    selectedDate: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 18,
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    summaryLabel:{
        fontSize: 12,
        color: "#777",
        marginBottom: 4,
    },

    summaryValue: {
        fontSize: 17,
        fontWeight: "600",
    },

    noData:{
        color: "#777"
    },

    emptyDay: {
        width: 42,
        height: 42,
        justifyContent: "center",
        alignItems: "center",
    },

    selectedEmptyDay: {
        backgroundColor: "#E5E5EA",
        borderRadius: 21,
    },

    dayRingContainer: {
        width: 42,
        height: 42,
        justifyContent: "center",
        alignItems: "center",
    },

    selectedDay: {
        backgroundColor: "#E5E5EA",
        borderRadius: 21,
    },
});
