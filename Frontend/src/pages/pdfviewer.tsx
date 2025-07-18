import { useSearchParams } from "react-router-dom";

export default function PDFViewer() {
  const [searchParams] = useSearchParams();
  const pdfUrl = searchParams.get("url");

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 gap-4">
      {pdfUrl ? (
        <>
          <div className="w-full h-[90vh] shadow-lg border rounded overflow-hidden">
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              width="100%"
              height="100%"
              style={{ border: "none" }}
              allow="fullscreen"
            />
          </div>

          <a
            href={pdfUrl}
            download
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow"
          >
            ⬇️ Download PDF
          </a>
        </>
      ) : (
        <p className="text-center text-red-500">No PDF URL provided.</p>
      )}
    </div>
  );
}
