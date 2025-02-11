import { supabase } from "../lib/supabase";

export const getDailyPostDetail = async () => {
    // Get current UTC time and convert it to IST
    const now = new Date();
    const utcOffset = 0; // IST is UTC +5:30
    const istDate = new Date(now.getTime() + utcOffset);

    const isoDate = istDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD

    console.log(isoDate); // Should log the correct ISO date

    const { data, error } = await supabase
        .from('goal_schedule')
        .select(`
            *,
            goals:goalid (title, type)
        `)
        .eq('date', isoDate) // Query using the correct date format
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