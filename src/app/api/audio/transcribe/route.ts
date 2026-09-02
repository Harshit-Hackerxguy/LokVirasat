import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const audio = formData.get('audio');
    const language = formData.get('language');

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Audio file is required',
        },
        { status: 400 }
      );
    }

    console.log(
      `Received oral story: ${audio.name}, language: ${language}`
    );

    /*
     * For now, this endpoint only verifies that the
     * audio reaches the application successfully.
     *
     * Permanent storage + Bhashini transcription will
     * be connected through the FastAPI backend next.
     */

    return NextResponse.json({
      success: true,
      message: 'Audio received successfully',
      language,
      filename: audio.name,
    });
  } catch (error) {
    console.error(
      'Audio upload error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process audio',
      },
      { status: 500 }
    );
  }
}