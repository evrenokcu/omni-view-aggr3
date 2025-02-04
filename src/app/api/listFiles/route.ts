import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
    const directoryPath = path.join('/price');
    try {
        const files = fs.readdirSync(directoryPath);
        return NextResponse.json({ files });
    } catch {
        return NextResponse.json({ error: 'Could not read directory' }, { status: 500 });
    }
}