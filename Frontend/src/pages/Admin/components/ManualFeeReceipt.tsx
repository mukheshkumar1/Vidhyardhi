import { useState } from "react";
import logo from "../../../assets/images/logo.png"; // Adjust path as needed

interface FeeComponent {
  name: string;
  amount: number;
}

const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TXN${timestamp}${random}`;
};

const ExtraFeeReceipt = () => {
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([]);
  const [componentName, setComponentName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI">("Cash");
  const [transactionId, setTransactionId] = useState<string>("");

  const handleAddComponent = () => {
    if (componentName && amount > 0) {
      setFeeComponents((prev) => [...prev, { name: componentName, amount }]);
      setComponentName("");
      setAmount(0);
    }
  };

  const handlePaymentModeChange = (mode: "Cash" | "UPI") => {
    setPaymentMode(mode);
    if (mode === "UPI") {
      setTransactionId(generateTransactionId());
    } else {
      setTransactionId("");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const total = feeComponents.reduce((sum, item) => sum + item.amount, 0);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative p-6 max-w-3xl mx-auto bg-white text-black rounded-xl shadow-md print:shadow-none print:p-0 print:bg-white print:text-black">
      {/* 👇 Form Section (Hidden on print) */}
      <div className="mb-4 print:hidden z-10">
        <h2 className="text-xl font-semibold mb-2">Extra Fee Receipt Generator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Student Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Class"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            className="p-2 border rounded"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Fee Component"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="p-2 border rounded w-32"
          />
          <button
            onClick={handleAddComponent}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Payment Mode:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMode"
                value="Cash"
                checked={paymentMode === "Cash"}
                onChange={() => handlePaymentModeChange("Cash")}
              />
              Cash
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentMode"
                value="UPI"
                checked={paymentMode === "UPI"}
                onChange={() => handlePaymentModeChange("UPI")}
              />
              UPI
            </label>
          </div>
        </div>

        {paymentMode === "UPI" && transactionId && (
          <div className="text-sm text-green-700 mb-4">
            <strong>Transaction ID:</strong> {transactionId}
          </div>
        )}
      </div>

      {/* 👇 Receipt Section */}
      <div className="p-6 border border-gray-300 rounded print:border-none print:p-2 print:rounded-none bg-white relative z-10 overflow-hidden">
        {/* 🔥 Watermark */}
        <img
          src={logo}
          alt="Watermark"
          className="absolute inset-0 opacity-10 w-full h-full object-contain z-0 print:opacity-10"
          style={{ pointerEvents: "none" }}
        />

        {/* Header */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-purple-800 mt-6 capitalize">
              Vidhyardhi English Medium School
            </h1>
            <p className="text-sm text-gray-700">Door No: 26-175/1</p>
            <p className="text-sm text-gray-700">
              Gayatri Nagar, Near Current Office Railway
            </p>
            <p className="text-sm text-gray-700">
              Nellore, Andhra Pradesh, India, 524004
            </p>
            <p className="text-sm text-gray-700">
              📞 +91-9849244277 | 📧 vidhyardhie.m.school25@gmail.com
            </p>
          </div>
          <img src={logo} alt="School Logo" className="h-40 w-auto print:mb-0 z-10" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-center underline text-blue-700 mb-4 z-10">
          FEE RECEIPT
        </h2>

        {/* Meta Info */}
        <div className="space-y-1 text-gray-800 font-medium relative z-10">
          <div>
            <strong className="text-purple-700">Date:</strong> {currentDate}
          </div>
          <div>
            <strong className="text-purple-700">Student Name:</strong>{" "}
            <span className="capitalize">{studentName || "__________"}</span>
          </div>
          <div>
            <strong className="text-purple-700">Class:</strong>{" "}
            {studentClass || "__________"}
          </div>
          <div>
            <strong className="text-purple-700">Payment Mode:</strong> {paymentMode}
          </div>
          {paymentMode === "UPI" && transactionId && (
            <div>
              <strong className="text-purple-700">Transaction ID:</strong>{" "}
              {transactionId}
            </div>
          )}
        </div>

        {/* Table */}
        <table className="w-full my-6 border border-purple-300 z-10 relative">
          <thead className="bg-purple-100 text-purple-800 font-bold">
            <tr>
              <th className="p-2 border border-purple-300 text-left">S.No</th>
              <th className="p-2 border border-purple-300 text-left">Fee Component</th>
              <th className="p-2 border border-purple-300 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 font-medium">
            {feeComponents.map((item, index) => (
              <tr key={index}>
                <td className="p-2 border border-purple-200">{index + 1}</td>
                <td className="p-2 border border-purple-200">{item.name}</td>
                <td className="p-2 border border-purple-200 text-right">
                  ₹{item.amount}
                </td>
              </tr>
            ))}
            <tr className="bg-purple-50 font-bold">
              <td colSpan={2} className="p-2 border border-purple-300 text-right">
                Total
              </td>
              <td className="p-2 border border-purple-300 text-right text-green-700">
                ₹{total}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signature & Note */}
        <div className="text-right mt-12 font-semibold text-gray-700 relative z-10">
          <p className="italic">Signature: __________________</p>
        </div>
        <p className="mt-6 text-center text-red-600 text-sm font-medium italic z-10 relative">
          ⚠️ All payments are non-refundable.
        </p>
      </div>

      {/* Print Button */}
      <div className="mt-4 print:hidden flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Tip: Disable "Headers and Footers" in print settings to hide URL/footer.
        </p>
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default ExtraFeeReceipt;
