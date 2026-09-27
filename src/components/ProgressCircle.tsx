import { calculateProgress } from "@/utils/nutrition";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type ProgressCircleProps = {
    value: number;
    goal: number;
    unit?: string;
};

export default function ProgressCircle({
    value,
    goal,
    unit = "",
}: ProgressCircleProps){
    const size = 120;
    const strokeWidth = 10;

    const radius = (size - strokeWidth) /2;
    const circumference = 2 * Math.PI * radius;

    const progress = calculateProgress(value, goal);

    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={[styles.container,{width:size, height:size,},]}>
            <Svg width={size} height={size} style={styles.svg}>
                {/*Background circle*/}
                <Circle
                    cx={size/2}
                    cy={size/2}
                    r={radius}
                    stroke="#E8E8E8"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/*Progess circle */}
                <Circle
                    cx={size/2}
                    cy={size/2}
                    r={radius}
                    stroke="#3478F6"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation={-90}
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            
            <View style={styles.textContainer}>
                <Text style={styles.value}>
                    {value}
                    {unit}
                </Text>

                <Text style={styles.goal}>
                    / {goal}
                    {unit}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },

    svg: {
        position: "absolute",
    },

    textContainer: {
        alignItems: "center",
    },

    value: {
        fontSize: 23,
        fontWeight: "700",
    },

    goal: {
        fontSize: 12,
        color: "#777",
        marginTop: 2,
    },
});