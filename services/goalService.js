import { supabase } from "../lib/supabase";

export const getDailyPostDetail = async () => {
    const today = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    // Parse the date string in the format 'dd/mm/yyyy, hh:mm:ss AM/PM'
    const localDate = new Date(today.split(',')[0].trim().split('/').reverse().join('-')); 

    const isoDate = localDate.toISOString().split('T')[0]; // Extract only the date part (YYYY-MM-DD)
    
    console.log(isoDate); // Will log the date in ISO string format: YYYY-MM-DD

    const { data, error } = await supabase
        .from('goal_schedule')
        .select(`
            *,
            goals:goalid (title, type)
        `)
        .eq('date', isoDate) // Use ISO date for querying
        .maybeSingle();

    if (error) {
        console.error("Supabase error:", error);
        return { success: false, msg: error.message };
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