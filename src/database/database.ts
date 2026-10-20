import { FoodUnit } from "@/constants/unit";
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

let initializationPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export type ExtraNutrition = {
    carbs: number | null;
    fat: number | null;
    sugar: number | null;
    fiber: number | null;
    sodium_mg: number | null;
}

export type FoodRow = {
    id: number;
    name: string;
    amount: number | null;
    unit: string | null;
    calories: number;
    protein: number;
    date: string;
} & ExtraNutrition;

export type settingsRow = {
    id: number;
    calorie_goal: number;
    protein_goal: number;
};

export type DailySummaryRow = {
    date: string;
    total_calories: number;
    total_protein: number;
    calorie_goal: number;
    protein_goal: number;
}

export type DailyGoal = {
    date: string;
    calorie_goal: number;
    protein_goal: number;
}

export type SavedFoodRow = {
    id: number;
    name: string;
    serving_amount: number;
    serving_unit: FoodUnit;
    calories: number;
    protein: number;
    serving_description?: string | null;
    barcode?: string | null;
} & ExtraNutrition;

export type RecentFoodRow = {
    id: number;
    name: string;
    amount: number | null;
    unit: string | null;
    calories: number;
    protein: number;
} & ExtraNutrition;

export type ExtraNutritionInput = Partial<ExtraNutrition>;

export function getLocalDate(){
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2,"0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

async function addMissingNutritionColumns(
    database: SQLite.SQLiteDatabase,
    table: "foods" | "saved_foods"
) {
    const columns = await database.getAllAsync<{
        name: string;
    }>(`PRAGMA table_info(${table})`);

    const existingColumns = new Set(
        columns.map((column) => column.name)
    );

    const newColumns = [
        "carbs", "fat", "sugar", "fiber", "sodium_mg"
    ];

    for (const column of newColumns) {
        if(!existingColumns.has(column)){
            await database.execAsync(
                `ALTER TABLE ${table} ADD COLUMN ${column} REAL`
            );
        };

    }
}

export async function initializeDatabase() : Promise<SQLite.SQLiteDatabase> {
    if(db) {
        return db;
    }

    if(initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => { 
        const database = await SQLite.openDatabaseAsync(
            "calorieTracker.db"
        );

        await database.execAsync(`
            CREATE TABLE IF NOT EXISTS foods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                amount REAL,
                unit TEXT,
                calories REAL NOT NULL,
                protein REAL NOT NULL,
                carbs REAL,
                fat REAL,
                sugar REAL,
                fiber REAL,
                sodium_mg REAL,
                date TEXT NOT NULL
                );
                
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                calorie_goal REAL NOT NULL,
                protein_goal REAL NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS daily_goals (
                date TEXT PRIMARY KEY NOT NULL,
                calorie_goal REAL NOT NULL,
                protein_goal REAL NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS saved_foods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                serving_amount REAL NOT NULL,
                serving_unit TEXT NOT NULL,
                calories REAL NOT NULL,
                protein REAL NOT NULL,
                carbs REAL,
                fat REAL,
                sugar REAL,
                fiber REAL,
                sodium_mg REAL,
                serving_description TEXT,
                barcode TEXT UNIQUE
            );
        `);

        const columns = await database.getAllAsync<{ name: string }>(
            "PRAGMA table_info(saved_foods)"
        );

        const hasServingDescription = columns.some(
            (column) => column.name === "serving_description"
        );

        if (!hasServingDescription){
            await database.execAsync(
                "ALTER TABLE saved_foods ADD COLUMN serving_description TEXT"
            );
        }

        await database.runAsync(`
            INSERT OR IGNORE INTO settings
            (id, calorie_goal, protein_goal)
            VALUES (1, 1800, 140)
        `);

        const updatedColumns = await database.getAllAsync<{
            name: string;
        }> (
            "PRAGMA table_info(saved_foods)"
        );

        const hasBarcode = updatedColumns.some(
            (column) => column.name === "barcode"
        );

        if (!hasBarcode) {
            await database.execAsync(
                `ALTER TABLE saved_foods ADD COLUMN barcode TEXT`
            );
        }

        await database.execAsync(`
            CREATE UNIQUE INDEX IF NOT EXISTS
            idx_saved_foods_barcode
            ON saved_foods(barcode);
        `);

        await addMissingNutritionColumns(database, "foods");

        await addMissingNutritionColumns(database, "saved_foods");

        db = database;
        
        return database;
    })();

    try {
        return await initializationPromise;
    } finally {
        initializationPromise = null;
    }
}

export async function getDatabase() {
    if (db == null){
        return await initializeDatabase();
    }

    return db;
}

export async function insertFood(
    name: string,
    amount: number | undefined,
    unit: string | undefined,
    calories: number,
    protein: number,
    date: string,
    nutrients: ExtraNutritionInput = {}
){
    const database = await getDatabase();

    const result = await database.runAsync(
        `INSERT INTO foods
            (name, amount, unit, calories, protein, carbs, fat, sugar, fiber, sodium_mg, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        name,
        amount ?? null,
        unit ?? null,
        calories,
        protein,
        nutrients.carbs ?? null,
        nutrients.fat ?? null,
        nutrients.sugar ?? null,
        nutrients.fiber ?? null,
        nutrients.sodium_mg ?? null,
        date
    );

    return result;
}



export async function getFoodsByDate(date: string) {
    const database = await getDatabase();
    
    const foods = await database.getAllAsync<FoodRow>(
        `SELECT *
        FROM foods
        WHERE date = ?
        ORDER BY id ASC`,
        date
    );

    return foods;
}

export async function deleteFoodById(id: number){
    const database = await getDatabase();

    await database.runAsync(
        "DELETE FROM foods WHERE id = ?",
        id
    );
}

export async function updateFoodById(
    id:number,
    name:string,
    amount: number | undefined,
    unit: string | undefined,
    calories: number,
    protein: number,
    nutrients: ExtraNutritionInput = {}
){
    const datatbase = await getDatabase();

    const updates = ["name= ?", "amount= ?", "unit= ?", "calories= ?", "protein= ?"];

    const values: (number | string | null)[] = [
        name,
        amount ?? null,
        unit ?? null,
        calories,
        protein,
    ];

    const nutrientColumns = ["carbs", "fat", "sugar", "fiber", "sodium_mg"] as const;

    for (const column of nutrientColumns){
        if(nutrients[column] !== undefined){
            updates.push(`${column} = ?`);
            values.push(nutrients[column] ?? null);
        }
    }

    values.push(id)

    await datatbase.runAsync(
        `UPDATE foods
        SET ${updates.join(", ")}
        WHERE id = ?`,
        values
    );
}

export async function getSettings() {
    const database = await getDatabase();

    return await database.getFirstAsync<settingsRow>(
        "SELECT * FROM settings WHERE id = 1"
    );
}

export async function updateGoal(
    calorieGoal: number,
    proteinGoal: number
){
    const database = await getDatabase();
    
    await database.runAsync(
        `UPDATE settings
        SET calorie_goal = ?,
            protein_goal = ?
        WHERE id = 1`,
        calorieGoal,
        proteinGoal
    );
}

export async function getDailySummaries() {
    const database = await getDatabase();

    return await database.getAllAsync<DailySummaryRow>(
        `SELECT
            foods.date,
            SUM(foods.calories) AS total_calories,
            SUM(foods.protein) AS total_protein,
            daily_goals.calorie_goal,
            daily_goals.protein_goal
        FROM foods
        JOIN daily_goals
            ON foods.date = daily_goals.date
        GROUP BY foods.date
        ORDER BY foods.date DESC`
    );
}

export async function getDailyGoals(date: string) {
    const database = await getDatabase();

    return await database.getFirstAsync<DailyGoal>(
        `SELECT *
         FROM daily_goals
         WHERE date = ?`,
        date
    );
}

export async function ensureDailyGoals(
    date:string,
    calorieGoal: number,
    proteinGoal: number
){
    const database = await getDatabase();

    await database.runAsync(
        `INSERT OR IGNORE INTO daily_goals
        (date, calorie_goal, protein_goal)
        VALUES (?, ?, ?)`,
        date,
        calorieGoal,
        proteinGoal
    );
}

export async function updateDailyGoals(
    date:string,
    calorieGoal: number,
    proteinGoal: number,
){
    const database = await getDatabase();

    await database.runAsync(
        `INSERT INTO daily_goals
        (date, calorie_goal, protein_goal)
        VALUES (?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
            calorie_goal = excluded.calorie_goal,
            protein_goal = excluded.protein_goal`,
        date,
        calorieGoal,
        proteinGoal
    );
}

export async function getSavedFood() {
    const database = await getDatabase();

    return await database.getAllAsync<SavedFoodRow>(
        `SELECT *
        FROM saved_foods
        ORDER BY name ASC`
    );
}

export async function createSavedFood(
    name: string,
    servingAmount: number,
    servingUnit: string,
    calories: number,
    protein: number,
    servingDescription: string | null = null,
    barcode: string | null = null,
    nutrients: ExtraNutritionInput = {}
){
    const database = await getDatabase();

    const result = await database.runAsync(
        `INSERT INTO saved_foods (
         name,
         serving_amount,
         serving_unit,
         calories,
         protein,
         serving_description,
         barcode,
         carbs,
         fat,
         sugar,
         fiber,
         sodium_mg
        )
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        name,
        servingAmount,
        servingUnit,
        calories,
        protein,
        servingDescription,
        barcode,
        nutrients.carbs ?? null,
        nutrients.fat ?? null,
        nutrients.sugar ?? null,
        nutrients.fiber ?? null,
        nutrients.sodium_mg ?? null
    );

    return result.lastInsertRowId;
}

export async function deleteSavedFood(id: number) {
    const database = await getDatabase();

    await database.runAsync(
        `DELETE FROM saved_foods
        WHERE id = ?`,
        id
    );
}

export async function getSavedFoodById(id: number) {
    const database= await getDatabase();

    const food = await database.getFirstAsync<SavedFoodRow>(
        `SELECT *
        FROM saved_foods
        WHERE id = ?`,
        id
    );

    return food;
}

export async function updateSavedFood(
    id: number,
    food: Pick<SavedFoodRow, | "name" | "serving_amount" | "serving_unit" | "calories" | "protein"> & ExtraNutritionInput
): Promise<void> {
    const database = await getDatabase();

    const updates = [
        "name = ?",
        "serving_amount = ?",
        "serving_unit = ?",
        "calories = ?",
        "protein = ?",
    ];

    const values: (string | number | null)[] = [
        food.name,
        food.serving_amount,
        food.serving_unit,
        food.calories,
        food.protein,
    ] ;

    const nutrientColumns = [
        "carbs", "fat", "sugar", "fiber", "sodium_mg",
    ] as const;

    for (const column of nutrientColumns) {
        if (food[column] !== undefined) {
            updates.push(`${column} = ?`);
            values.push(food[column] ?? null);
        }
    }

    values.push(id);

    await database.runAsync(
        `UPDATE saved_foods
         SET ${updates.join(", ")}
         WHERE id = ?`,
        values
    );
}

export async function getRecentFoods(search: string = ""): Promise<RecentFoodRow[]> {
    const database = await getDatabase();

    return await database.getAllAsync<RecentFoodRow>(
        `SELECT f.*
        FROM foods f
        WHERE f.id = (
            SELECT MAX(f2.id)
            FROM foods f2
            WHERE LOWER(f2.name) = LOWER(f.name)
        )
        AND LOWER(f.name) LIKE ?
        ORDER BY f.id DESC
        LIMIT 20`,
        `%${search.trim().toLowerCase()}%`
    );
}

export async function getRecentFoodById(id:number) : Promise<RecentFoodRow | null> {
    const database = await getDatabase();

    return await database.getFirstAsync<RecentFoodRow>(
        `SELECT *
        FROM foods
        WHERE id = ?`,
        id
    );
}

export async function getSavedFoodByBarcode(
    barcode: string
): Promise<{ id: number } | null> {
    const database  = await getDatabase();

    return await database.getFirstAsync<{ id: number}>(
        `
        SELECT id
        FROM saved_foods
        WHERE barcode = ?
        LIMIT 1
        `,
        barcode
    );
}