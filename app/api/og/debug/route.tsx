import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Preload the font
const interBold = fetch(
    new URL('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-0.woff2', import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const debugText = url.searchParams.get('text') || 'OG Image Debug';

        const fontData = await interBold;

        // Generate the debug image
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
                        fontFamily: 'Inter',
                    }}
                >
                    <h1 style={{ fontSize: 60, margin: 0 }}>OG Debug Image</h1>
                    <p style={{ fontSize: 30, margin: '20px 0 40px 0' }}>{debugText}</p>
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
                        <p style={{ margin: '5px 0' }}>Timestamp: {new Date().toISOString()}</p>
                        <p style={{ margin: '5px 0' }}>URL: {req.url}</p>
                        <p style={{ margin: '5px 0' }}>OG API is working!</p>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'Inter',
                        data: fontData,
                        style: 'normal',
                        weight: 700,
                    },
                ],
            }
        );
    } catch (error: any) {
        console.error('Error generating OG image:', error);
        return new Response(`Error generating OG Image: ${error.message}`, {
            status: 500,
        });
    }
} 