import { supabase } from "../lib/supabase";

export const getDailyPostDetail = async () => {
    const today = new Date().toISOString().split('T'); // YYYY-MM-DD format
    console.log(today); 

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

export const createOrUpdateGoal = async (goal) => {
    try {
        const {data , error} = await supabase
        .from('goal_completions')
        .upsert(goal)
        .select()
        .single();

        if(error){
            return {success : false , data : data};
        }

        return {success : true , msg: 'Goal completed'};
    } catch (error) {
        return {success : false , msg : 'Could not create your post!'};
    }
}

export const  getGoalCompletionDetails = async (userId , goalId) => {
        const { data, error } = await supabase
        .from('goal_completions')
        .select(`
            *
        `)
        .eq('goalid', goalId)
        .eq('userid' , userId)
        .single(); // Prevents errors if no data is found

    if (error) {
        return { success: false, msg: error.message }; // Return actual error message
    }

    return { success: true, data };
}