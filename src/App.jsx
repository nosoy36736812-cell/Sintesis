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
      setError("Tus apuntes son muy cortos. Ingresa al menos un párrafo.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGuide(null);

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, subject })
      });

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        throw new Error(data.message || "Ocurrió un error al generar la guía.");
      }

      setGuide(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderImportanceColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3 text-indigo-600">
            <BrainCircuit size={40} />
            <h1 className="text-4xl font-extrabold tracking-tight">Síntesis</h1>
          </div>
          <p className="text-gray-500 text-lg">Convierte tus apuntes desordenados en guías maestras.</p>
        </div>

        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materia (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ej. Biología, Historia, Cálculo..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tus Apuntes</label>
              <textarea 
                rows="6"
                placeholder="Pega tus apuntes desordenados aquí..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Procesando apuntes...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generar Guía de Estudio</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        {guide && (
          <div id="guide-content" className="space-y-6 animate-fade-in-up">
            
            {/* Meta & Summary */}
            <div className="bg-white p-8 rounded-2xl shadow-md border-t-4 border-indigo-600">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{guide.meta?.title}</h2>
              <div className="flex space-x-3 mb-6 text-sm">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">{guide.meta?.subject}</span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{guide.meta?.level}</span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">? ~{guide.meta?.estimated_study_time_minutes} min</span>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">{guide.summary}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Main Structure (Takes up 2 columns) */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Conceptos Clave */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                    <BookOpen size={24} />
                    <h3 className="text-xl font-bold text-gray-900">Conceptos Clave</h3>
                  </div>
                  <div className="space-y-4">
                    {guide.key_concepts?.map((concept, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-gray-900 text-lg">{concept.term}</span>
                          <span className={`text-xs px-2 py-1 rounded border font-medium ${renderImportanceColor(concept.importance)}`}>
                            Prioridad {concept.importance}
                          </span>
                        </div>
                        <p className="text-gray-600">{concept.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estructura del Tema */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                    <List size={24} />
                    <h3 className="text-xl font-bold text-gray-900">Desarrollo del Tema</h3>
                  </div>
                  <div className="space-y-6">
                    {guide.structure?.map((section, idx) => (
                      <div key={idx} className="border-l-4 border-indigo-200 pl-4 py-1">
                        <h4 className="text-lg font-bold text-gray-800 mb-2">{section.topic}</h4>
                        <ul className="list-disc list-inside text-gray-600 mb-3 space-y-1">
                          {section.key_points?.map((point, pIdx) => (
                            <li key={pIdx}>{point}</li>
                          ))}
                        </ul>
                        {section.memory_tip && (
                          <div className="mt-3 bg-amber-50 text-amber-800 p-3 rounded-lg flex items-start space-x-2 text-sm border border-amber-100">
                            <Lightbulb size={18} className="flex-shrink-0 mt-0.5 text-amber-500" />
                            <span><strong>Truco para recordar:</strong> {section.memory_tip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Sidebar (Takes up 1 column) */}
              <div className="space-y-6">
                
                {/* Preguntas de Repaso */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                    <FileQuestion size={24} />
                    <h3 className="text-xl font-bold text-gray-900">Auto-Evaluación</h3>
                  </div>
                  <div className="space-y-4">
                    {guide.qa_pairs?.map((qa, idx) => (
                      <div key={idx} className="group cursor-pointer">
                        <div className="font-medium text-gray-800 mb-1 group-hover:text-indigo-600 transition">¿{qa.question}</div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg hidden group-hover:block transition-all">
                          {qa.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips de Estudio */}
                <div className="bg-indigo-600 p-6 rounded-2xl shadow-sm text-white">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle2 size={24} className="text-indigo-200" />
                    <h3 className="text-xl font-bold">Consejos de Estudio</h3>
                  </div>
                  <ul className="space-y-3">
                    {guide.study_tips?.map((tip, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-indigo-100 text-sm">
                        <span className="mt-1 flex-shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
            
            <div className="text-center text-xs text-gray-400 mt-8">
              Generado con {guide._meta?.provider === 'groq' ? 'Groq (Llama 3 70B)' : 'Cerebras'} • Guías restantes hoy: {guide._meta?.remaining_today}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
