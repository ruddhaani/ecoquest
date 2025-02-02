import { supabase } from "../lib/supabase";

export const getDailyPostDetail = async () => {
    const today = new Date().toLocaleDateString().split('T'); // YYYY-MM-DD format
    // console.log(today); 

    const { data, error } = await supabase
        .from('goal_schedule')
        .select(`
            *,
            goals:goalid (title, type)
        `)
        .eq('date', today)
        .maybeSingle(); // Prevents errors if no data is found

    if (error) {
        console.error("Supabase error:", error); // Log error details
        return { success: false, msg: error.message }; // Return actual error message
    }

    return { success: true, data };
};
