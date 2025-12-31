export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center">
          Archery Score Tracker
        </h1>

        <p className="text-center text-gray-600 mt-2">
          Track scores. Analyze performance. Improve accuracy.
        </p>

        <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg text-lg">
          Start Scoring
        </button>
      </div>
    </main>
  );
}
