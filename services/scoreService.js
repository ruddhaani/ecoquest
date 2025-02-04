import { supabase } from "../lib/supabase";

export const updateUserScore = async (userId, points) => {
    try {
        console.log("Attempting to update score for user:", userId, "with points:", points);

        // Fetch current score
        const { data: userData, error: fetchError } = await supabase
            .from('scores')
            .select('score')
            .eq('userid', userId)
            .single();

        if (fetchError) {
            console.error("Error fetching user score:", fetchError);
            return { success: false, msg: fetchError.message };
        }

        // Calculate new score
        const newScore = (userData?.score || 0) + points;

        // Update user score
        const { data, error } = await supabase
            .from('scores')
            .update({ score: newScore })
            .eq('userid', userId)
            .select()
            .single();

        if (error) {
            console.error("Supabase Error:", error);
            return { success: false, msg: error.message };
        }

        console.log("User score updated successfully:", data);
        return { success: true, msg: "User score updated", data };
    } catch (err) {
        console.error("Unexpected error:", err);
        return { success: false, msg: err.message };
    }
};
