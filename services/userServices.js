import { supabase } from "../lib/supabase"

export const getUserData = async (userId) => {
    try {
        const {data , error} = await supabase
                                            .from('users')
                                            .select()
                                            .eq('id' , userId)
                                            .single();
        
        if(error){
            return {success: false , msg: error?.message}
        }

        return {success : true , data};

    } catch (error) {
        console.log("error" , error)
        return {success: false, msg: error.message}
    }
}

export const updateUserData = async (userId , updatedData) => {
    try {
        const {data , error} = await supabase
                                            .from('users')
                                            .update(updatedData)
                                            .eq('id' , userId)
        
        if(error){
            return {success: false , msg: error?.message}
        }

        return {success : true , data};

    } catch (error) {
        console.log("error" , error)
        return {success: false, msg: error.message}
    }
}