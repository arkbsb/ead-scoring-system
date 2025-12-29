import { supabase } from './supabase';

export interface PublicShare {
    id: string;
    user_id: string;
    token: string;
    dashboard_type: string;
    spreadsheet_id: string | null;
    created_at: string;
    expires_at: string | null;
    is_active: boolean;
    view_count: number;
    last_viewed_at: string | null;
    launch_id?: string | null;
    traffic_mapping?: any;
}

/**
 * Generate a unique random token for sharing
 */
export function generateShareToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Create a new public share for a dashboard
 */
export async function createPublicShare(
    userId: string,
    spreadsheetId: string | null,
    launchId: string | null = null,
    dashboardType: string = 'traffic',
    trafficMapping: any = null
): Promise<{ data: PublicShare | null; error: Error | null }> {
    try {
        const token = generateShareToken();

        const { data, error } = await supabase
            .from('public_dashboards')
            .insert({
                user_id: userId,
                token,
                dashboard_type: dashboardType,
                spreadsheet_id: spreadsheetId,
                launch_id: launchId,
                traffic_mapping: trafficMapping,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Error creating public share:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Get public share by token
 */
export async function getPublicShare(
    token: string
): Promise<{ data: PublicShare | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('public_dashboards')
            .select('*')
            .eq('token', token)
            .eq('is_active', true)
            .single();

        if (error) throw error;

        // Check if expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return { data: null, error: new Error('Share link has expired') };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Error getting public share:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Get active share for current user
 */
export async function getUserActiveShare(
    userId: string,
    dashboardType: string = 'traffic'
): Promise<{ data: PublicShare | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('public_dashboards')
            .select('*')
            .eq('user_id', userId)
            .eq('dashboard_type', dashboardType)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Error getting user active share:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Revoke a public share
 */
export async function revokePublicShare(
    shareId: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('public_dashboards')
            .update({ is_active: false })
            .eq('id', shareId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        console.error('Error revoking public share:', error);
        return { error: error as Error };
    }
}

/**
 * Update a public share configuration
 */
export async function updatePublicShare(
    shareId: string,
    updates: {
        traffic_mapping?: any;
        launch_id?: string | null;
        spreadsheet_id?: string | null;
    }
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('public_dashboards')
            .update(updates)
            .eq('id', shareId);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        console.error('Error updating public share:', error);
        return { error: error as Error };
    }
}

/**
 * Increment view count for a share
 */
export async function incrementViewCount(
    token: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase.rpc('increment_share_view_count', {
            share_token: token
        });

        if (error) {
            // Fallback if RPC doesn't exist - manual increment
            const { data: share } = await supabase
                .from('public_dashboards')
                .select('view_count')
                .eq('token', token)
                .single();

            if (share) {
                await supabase
                    .from('public_dashboards')
                    .update({
                        view_count: (share.view_count || 0) + 1,
                        last_viewed_at: new Date().toISOString()
                    })
                    .eq('token', token);
            }
        }

        return { error: null };
    } catch (error) {
        console.error('Error incrementing view count:', error);
        return { error: error as Error };
    }
}

/**
 * Generate public URL for a share token
 */
export function getPublicShareUrl(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/public/${token}`;
}
