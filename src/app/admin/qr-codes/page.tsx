// src/app/admin/qr-codes/page.tsx
"use client";

import { useState } from "react";
import QRCode from "qrcode";

export default function QRCodesPage() {
    const [tableCount, setTableCount] = useState(10);
    const [qrCodes, setQrCodes] = useState<{ table: number; url: string; qr: string }[]>([]);

    const generateQRCodes = async () => {
        const codes = [];
        for (let i = 1; i <= tableCount; i++) {
            const url = `http://192.168.8.95:3000/menu?table=${i}`; // ✅ با ?table=1
            const qr = await QRCode.toDataURL(url);
            codes.push({ table: i, url, qr });
        }
        setQrCodes(codes);
    };


    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">QR Code Generator</h1>

            <div className="mb-6">
                <label className="block mb-2">Number of Tables:</label>
                <input
                    type="number"
                    value={tableCount}
                    onChange={(e) => setTableCount(Number(e.target.value))}
                    className="border p-2 rounded"
                    min="1"
                />
                <button
                    onClick={generateQRCodes}
                    className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Generate QR Codes
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {qrCodes.map((code) => (
                    <div key={code.table} className="border p-4 text-center">
                        <h3 className="font-bold mb-2">Table {code.table}</h3>
                        <img src={code.qr} alt={`QR Code for Table ${code.table}`} className="mx-auto" />
                        <a href={code.qr} download={`table-${code.table}.png`} className="text-blue-500 mt-2 block">
                            Download
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}