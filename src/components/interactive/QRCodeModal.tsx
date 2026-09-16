"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { QrCode, Download, X, Copy, Check, Sparkles } from "lucide-react";

interface QRCodeModalProps {
  url: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({
  url,
  title = "Scan to Open Lovewrit",
  isOpen,
  onClose,
}: QRCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url || !isOpen) return;

    QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: {
        dark: "#171717",
        light: "#ffffff",
      },
    })
      .then((res) => setDataUrl(res))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [url, isOpen]);

  if (!isOpen) return null;

  const downloadQR = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `lovewrit-qr-code.png`;
    link.href = dataUrl;
    link.click();
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900 p-6 text-center shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-neutral-800 p-1.5 text-neutral-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-center space-x-1.5 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <QrCode className="h-4 w-4" />
          <span>Printable QR Code</span>
        </div>

        <h3 className="font-serif text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-[11px] text-neutral-400 mb-6">
          Print this code on your greeting card, gift tag, or event table.
        </p>

        {/* QR Code Canvas Frame */}
        <div className="mx-auto my-2 flex w-52 h-52 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-xl">
          {dataUrl ? (
            <img src={dataUrl} alt="Lovewrit QR Code" className="w-full h-full object-contain" />
          ) : (
            <div className="text-xs text-neutral-400">Generating code...</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={downloadQR}
            disabled={!dataUrl}
            className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Download QR Code (PNG)</span>
          </button>

          <button
            onClick={copyUrl}
            className="flex items-center justify-center space-x-2 rounded-xl border border-neutral-800 bg-neutral-950 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Page Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

