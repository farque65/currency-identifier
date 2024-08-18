'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const identifyCurrency = async () => {
    if (!image) return;

    setLoading(true);
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    try {
      const imageParts = [
        {
          inlineData: {
            data: await fileToGenerativePart(image),
            mimeType: image.type,
          },
        },
      ];

      const result = await model.generateContent([
        "Identify this currency and provide its name and other important information.",
        ...imageParts,
      ]);
      console.log('Result:', result);
      setResult(result.response.text());
    } catch (error) {
      console.error('Error identifying currency:', error);
      setResult('An error occurred while identifying the currency.');
    } finally {
      setLoading(false);
    }
  };

  async function fileToGenerativePart(file: File): Promise<string> {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    return (await base64EncodedDataPromise).split(',')[1];
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">Currency Identifier</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Upload a currency image
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          {preview && (
            <div className="mb-6">
              <Image src={preview} alt="Preview" width={300} height={300} className="rounded-lg" />
            </div>
          )}
          <button
            onClick={identifyCurrency}
            disabled={!image || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Identifying...' : 'Identify Currency'}
          </button>
          {result && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Currency Information:</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}