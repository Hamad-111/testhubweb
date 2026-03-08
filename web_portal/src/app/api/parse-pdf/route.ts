import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json({ error: 'No file uploaded or invalid file type' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse the PDF
        const data = await pdfParse(buffer);

        return NextResponse.json({ text: data.text });

    } catch (error: any) {
        console.error('Error parsing document:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to parse document' },
            { status: 500 }
        );
    }
}
