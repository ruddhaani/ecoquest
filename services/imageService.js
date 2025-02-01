import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { supabaseUrl } from '../constants';

export const getUserImageSource = imagePath => {
    if(imagePath){
        return getSupabaseFileUri(imagePath)
    }else{
        return require('../assets/images/defaultUser.png')
    }
}

export const downloadFile = async (url) => {
    try {
        console.log('Downloading file from:', url);
        const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url));
        console.log('Downloaded file saved at:', uri);
        return uri;
    } catch (error) {
        console.error('File download error:', error);
        return null;
    }
};

export const getLocalFilePath = filepath => {
    let fileName = filepath.split('/').pop();
    return `${FileSystem.documentDirectory}${fileName}`;
}

export const getSupabaseFileUri = filepath => {
    if(filepath){
        return {uri : `${supabaseUrl}/storage/v1/object/public/uploads/${filepath}`}
    }
}

export const uploadFile = async (folderName , fileUri , isImage = true) => {
    try {
        let fileName = getFilePath(folderName , isImage);
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri , {
            encoding : FileSystem.EncodingType.Base64
        });

        let imageData = decode(fileBase64); //arraybuffer

        let {data , error} = await supabase
        .storage
        .from('uploads')
        .upload(fileName , imageData , {
            cacheControl : '3600',
            upsert: false,
            contentType : isImage ? 'image/*' : 'video/*'
        });

        if(error) {
            console.log('fileUploadError' , error);
            return {success: false , msg: 'could not upload media'}
        }

        return {success: true , data : data.path}

    } catch (error) {
        console.log('fileUploadError' , error);
        return {success: false , msg: 'could not upload media'}
    }
}

export const getFilePath = (folderName , isImage) => {
    return `/${folderName}/${(new Date()).getTime()}${isImage ? '.png': '.mp4'}`;
}