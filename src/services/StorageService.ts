import { supabase } from '../config/supabaseClient';

export const StorageService = {
    /**
     * Upload a file to Supabase Storage
     */
    async uploadFile(
        file: File,
        bucket: string = 'clinical-records',
        path?: string,
        userId?: string | null
    ): Promise<string | null> {
        try {
            if (!file) return null;

            let finalPath = path ?? '';
            if (!finalPath) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                finalPath = fileName;
            }

            // RLS safety net: ensure path starts with userId folder
            if (bucket === 'clinical-records' && finalPath && !finalPath.includes('/') && userId) {
                finalPath = `${userId}/${finalPath}`;
            }

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(finalPath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) throw error;
            return data.path;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    /**
     * Get a signed URL for a file
     */
    async getSignedUrl(
        path: string,
        bucket: string = 'clinical-records',
        expiresIn: number = 3600
    ): Promise<string | null> {
        try {
            if (!path) return null;

            const fileName = path.split('/').pop() ?? '';
            const folderPath = path.substring(0, path.lastIndexOf('/')) || '';

            const { data: files, error: listError } = await supabase.storage
                .from(bucket)
                .list(folderPath, { search: fileName });

            if (listError) {
                console.warn('Error checking file existence:', listError);
                return null;
            }

            const fileExists = files && files.find((f) => f.name === fileName);
            if (!fileExists) {
                console.warn(`File not found in storage: ${path}`);
                return null;
            }

            const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

            if (error) {
                console.error('Error getting signed URL:', error);
                return null;
            }
            return data.signedUrl;
        } catch (error: any) {
            if (
                error?.message?.includes('aborted') ||
                error?.name === 'AbortError'
            ) {
                return null;
            }
            console.error('Error in getSignedUrl:', error);
            return null;
        }
    },

    /**
     * Delete a file from Supabase Storage
     */
    async deleteFile(path: string, bucket: string = 'clinical-records'): Promise<void> {
        try {
            if (!path) return;
            const { error } = await supabase.storage.from(bucket).remove([path]);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting file from storage:', error);
            throw error;
        }
    },
};
