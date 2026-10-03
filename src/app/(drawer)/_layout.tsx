import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: false,
                
                drawerStyle: {
                    backgroundColor: "#F7F7F7",
                    width: 280,
                },

                drawerLabelStyle: {
                    fontSize: 16,
                    fontWeight: "600",
                },

                drawerActiveTintColor: "#3478F6",
                drawerInactiveTintColor: "#333",
            }}
        >
            <Drawer.Screen
                name = "index"
                options={{
                    drawerLabel: "Home",
                    title: "Home",
                }}
            />

            <Drawer.Screen
                name = "history"
                options={{
                    drawerLabel: "History",
                    title: "History"
                }}
            />

            <Drawer.Screen
                name = "settings"
                options={{
                    drawerLabel: "Settings",
                    title: "Settings",
                }}
            />
        </Drawer>
    );
}

