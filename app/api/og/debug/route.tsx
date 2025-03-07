import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Disable caching to ensure fresh content on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const debugText = url.searchParams.get('text') || 'OG Image Debug';

        // Simple debug image with system fonts only
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1e293b',
                        color: 'white',
                        padding: '40px 20px',
                        textAlign: 'center',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    <h1 style={{ fontSize: 60, margin: 0, display: 'flex' }}>OG Debug Image</h1>
                    <p style={{ fontSize: 30, margin: '20px 0 40px 0', display: 'flex' }}>{debugText}</p>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        backgroundColor: '#2d3748',
                        borderRadius: 10,
                        padding: 20,
                        fontSize: 24,
                        width: '80%'
                    }}>
                        <p style={{ margin: '5px 0', display: 'flex' }}>Timestamp: {new Date().toISOString()}</p>
                        <p style={{ margin: '5px 0', display: 'flex' }}>URL: {req.url}</p>
                        <p style={{ margin: '5px 0', display: 'flex' }}>OG API is working!</p>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630
            }
        );
    } catch (error: any) {
        console.error('Error generating OG image:', error);
        return new Response(`Error generating OG Image: ${error.message}`, {
            status: 500,
        });
    }
}