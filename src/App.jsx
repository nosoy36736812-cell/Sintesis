import React, { useState } from 'react';
import { BookOpen, Sparkles, BrainCircuit, AlertCircle, CheckCircle2, List, FileQuestion, Lightbulb } from 'lucide-react';

const WORKER_URL = "https://sintesis-worker.nosoy36736812.workers.dev/generate";

export default function App() {
  const [notes, setNotes] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (notes.length < 30) {
      setError("Apuntes muy cortos");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, subject })
      });

      const data = await response.json();
      setGuide(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Sintesis</h1>
        <p className="text-gray-600 mb-6">Generador de guias de estudio</p>

        <div className="bg-white p-6 rounded-lg shadow">
          <input 
            type="text" 
            placeholder="Materia"
            className="w-full p-2 border rounded mb-4"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea 
            rows="6"
            placeholder="Tus apuntes..."
            className="w-full p-2 border rounded mb-4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          
          {error && <div className="text-red-600 mb-4">{error}</div>}

          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : 'Generar Guia'}
          </button>
        </div>

        {guide && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">{guide.meta?.title}</h2>
            {guide.key_concepts && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Conceptos Clave</h3>
                {guide.key_concepts.map((c, i) => (
                  <div key={i} className="mb-3 p-3 bg-gray-50 rounded">
                    <strong>{c.term}</strong>: {c.definition}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
